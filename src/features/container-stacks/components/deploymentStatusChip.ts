import type { AppChipStyle, Tone, ToneAppearance } from '@shared/ui';

import type { StackDeploymentStatus } from '../domain/types';

export interface StatusChipProps {
  label?: string;
  tone?: Tone;
  appearance?: ToneAppearance;

  config?: AppChipStyle;
}

type KnownStackStatus = Exclude<StackDeploymentStatus, 'unknown'>;

const STACK_DEPLOYMENT_STATUS_CHIPS: Record<
  KnownStackStatus,
  { label: string; tone: Tone }
> = {
  pending: { label: 'Pending', tone: 'info' },
  deploying: { label: 'Deploying', tone: 'info' },
  awaitingDeployedStatus: { label: 'Awaiting deployed status', tone: 'info' },
  running: { label: 'Running', tone: 'success' },
  deployed: { label: 'Deployed', tone: 'success' },
  completed: { label: 'Completed', tone: 'success' },
  exited: { label: 'Exited', tone: 'secondary' },
  paused: { label: 'Paused', tone: 'warning' },
  stopped: { label: 'Stopped', tone: 'neutral' },
  removing: { label: 'Removing', tone: 'info' },
  awaitingRemovedStatus: { label: 'Awaiting removed status', tone: 'info' },
  awaitingCleanup: { label: 'Awaiting cleanup', tone: 'info' },
  retry: { label: 'Retrying', tone: 'neutral' },
  error: { label: 'Error', tone: 'error' },
};

const UNKNOWN_STACK_DEPLOYMENT_STATUS: AppChipStyle = {
  label: 'Unknown',
  color: 'var(--text-primary, rgba(0, 0, 0, 0.87))',
  backgroundColor: '#F5F5F5',
  borderColor: '#757575',
};

type ContainerState =
  | 'created'
  | 'running'
  | 'paused'
  | 'restarting'
  | 'exited'
  | 'dead';

const CONTAINER_STATE_CHIPS: Record<
  ContainerState,
  { label: string; tone: Tone }
> = {
  created: { label: 'Created', tone: 'info' },
  running: { label: 'Running', tone: 'success' },
  paused: { label: 'Paused', tone: 'warning' },
  restarting: { label: 'Restarting', tone: 'info' },
  exited: { label: 'Exited', tone: 'error' },
  dead: { label: 'Dead', tone: 'error' },
};

function findKey<K extends string>(
  table: Record<K, unknown>,
  value: string
): K | undefined {
  const lower = value.toLowerCase();

  return (Object.keys(table) as K[]).find((key) => key.toLowerCase() === lower);
}

export function stackDeploymentStatusChipProps(
  status?: string
): StatusChipProps {
  if (!status) return {};
  if (status.toLowerCase() === 'unknown') {
    return { config: UNKNOWN_STACK_DEPLOYMENT_STATUS };
  }

  const key = findKey(STACK_DEPLOYMENT_STATUS_CHIPS, status);

  return key
    ? { ...STACK_DEPLOYMENT_STATUS_CHIPS[key], appearance: 'filled' }
    : { label: status, tone: 'neutral', appearance: 'filled' };
}

export function containerStateChipProps(state?: string): StatusChipProps {
  if (!state) return {};

  const key = findKey(CONTAINER_STATE_CHIPS, state);

  return key
    ? { ...CONTAINER_STATE_CHIPS[key], appearance: 'outlined' }
    : { label: state, tone: 'neutral', appearance: 'outlined' };
}
