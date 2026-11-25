import { useNotification } from '@shared/ui';
import { useEffect, useRef } from 'react';

import { toStackCommandResult } from '../api/stackCommandResult.mapper';
import { stacksApi } from '../api/stacks.api';
import {
  decideStackCommandOutcome,
  STACK_COMMAND_POLL_INTERVAL_MS,
  type StackCommandOutcome,
  type StackCommandResult,
} from '../domain/stackCommand';
import type { Action } from '../domain/types';
import { useDeploymentsStore } from '../store/useDeploymentsStore';

interface StackCommandTarget {
  deviceId: string;
  stackConfigId: string;
  action: Action;
}

interface StackCommandCallbacks {
  onStatusConfirmed?: (status: string) => void;

  onStatusUnknown?: () => void;
}

const RESULTS_PAGE_SIZE = 10;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export function useStackCommand() {
  const { showNotification, showSuccess, showError } = useNotification();

  const POST_STACK_ACTION = useDeploymentsStore((s) => s.POST_STACK_ACTION);
  const SET_STACK_STATUS = useDeploymentsStore((s) => s.SET_STACK_STATUS);

  const inFlightRef = useRef(new Set<string>());

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchResults = async (
    target: StackCommandTarget
  ): Promise<StackCommandResult[]> => {
    try {
      const data = await stacksApi.getStackCommandResults({
        deviceId: target.deviceId,
        stackConfigId: target.stackConfigId,
        maxResultCount: RESULTS_PAGE_SIZE,
      });

      return data.items.map(toStackCommandResult);
    } catch (error) {
      console.error('[Stack command results] poll failed:', error);

      return [];
    }
  };

  const waitForOutcome = async (
    target: StackCommandTarget,
    reqSeqId: string
  ): Promise<StackCommandOutcome | null> => {
    const startedAt = Date.now();
    let outcome: StackCommandOutcome = { kind: 'pending' };

    while (outcome.kind === 'pending') {
      await sleep(STACK_COMMAND_POLL_INTERVAL_MS);

      if (!mountedRef.current) return null;

      const results = await fetchResults(target);

      outcome = decideStackCommandOutcome(
        results,
        reqSeqId,
        Date.now() - startedAt
      );
    }

    return mountedRef.current ? outcome : null;
  };

  const runStackCommand = async (
    target: StackCommandTarget,
    { onStatusConfirmed, onStatusUnknown }: StackCommandCallbacks = {}
  ): Promise<void> => {
    const key = `${target.deviceId}:${target.stackConfigId}`;

    if (inFlightRef.current.has(key)) {
      showNotification({
        message: 'A command is still running on this stack',
        severity: 'info',
      });

      return;
    }

    inFlightRef.current.add(key);

    try {
      const { reqSeqId } = await POST_STACK_ACTION(target);

      if (!reqSeqId) {
        showSuccess('Stack command sent');
        onStatusUnknown?.();

        return;
      }

      const outcome = await waitForOutcome(target, reqSeqId);

      if (!outcome) return;

      if (outcome.kind === 'failed') {
        showError(`Stack ${target.action} failed: ${outcome.message}`);

        return;
      }

      if (outcome.kind === 'timedOut') {
        showNotification({
          message:
            'Stack command sent, but the device has not reported a result yet',
          severity: 'warning',
        });
        onStatusUnknown?.();

        return;
      }

      if (outcome.kind === 'succeeded') {
        showSuccess(`Stack ${target.action} completed`);

        if (outcome.stackStatus) {
          SET_STACK_STATUS({
            deviceId: target.deviceId,
            stackConfigId: target.stackConfigId,
            status: outcome.stackStatus,
          });
          onStatusConfirmed?.(outcome.stackStatus);
        } else {
          onStatusUnknown?.();
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Stack action failed';

      showError(message);
      console.error('[Stack action] failed:', message);
    } finally {
      inFlightRef.current.delete(key);
    }
  };

  return { runStackCommand };
}
