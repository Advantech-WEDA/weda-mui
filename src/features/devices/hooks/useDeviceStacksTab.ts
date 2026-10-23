import {
  type Action,
  type IDeploymentItem,
  type IGetListStacksInDeviceParams,
  type Status,
  type TableHeaderSortKey,
  useDeploymentsStore,
} from '@features/container-stacks';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useHasManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { type SortOrder, useNotification } from '@shared/ui';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { CONTAINER_STACKS_REFRESH_INTERVAL } from '../domain/types';

interface Input {
  deploymentItems: IDeploymentItem[];
  loading: boolean;
  totalCount: number;
  rowsPerPage: number;
  onRowsPerPageChange: (rows: number) => void;
  onFetchDeployments: (
    params: Omit<IGetListStacksInDeviceParams, 'deviceId'>,
    signal?: AbortSignal
  ) => Promise<unknown>;
}

export function useDeviceStacksTab({
  deploymentItems,
  loading,
  totalCount,
  rowsPerPage,
  onRowsPerPageChange: setRowsPerPage,
  onFetchDeployments,
}: Input) {
  const navigate = useAppNavigate();
  const { deviceId } = useParams<{
    tenant: string;
    deviceId: string;
  }>();
  const hasPermission = useHasManagementPermission();

  const [dialogOpenDeleteStack, setDialogOpenDeleteStack] = useState(false);
  const [selectedDeleteStack, setSelectedDeleteStack] = useState<{
    stackConfigId: string;
    deviceId: string;
  } | null>(null);

  const [searchWord, setSearchWord] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const [page, setPage] = useState(0);

  const [sortKey, setSortKey] = useState<TableHeaderSortKey>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const pollTimerRef = useRef<number | null>(null);
  const isPollingRef = useRef(false);

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { showError, showSuccess } = useNotification();
  const { currentOrgId } = useOrgContentStore();

  const POST_STACK_ACTION = useDeploymentsStore((s) => s.POST_STACK_ACTION);

  const DELETE_STACK_FROM_DEVICE = useDeploymentsStore(
    (s) => s.DELETE_STACK_FROM_DEVICE
  );

  const POST_DEPLOY_STACK_TO_DEVICES = useDeploymentsStore(
    (s) => s.POST_DEPLOY_STACK_TO_DEVICES
  );

  const fetchDeployments = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      if (!deviceId) {
        showError('No Device ID');
        return;
      }

      try {
        await onFetchDeployments(
          {
            skipCount: page * rowsPerPage,
            maxResultCount: rowsPerPage,
            sorting: `${sortKey} ${sortOrder}`,
          },
          signal
        );
      } catch (error) {
        if (axios.isCancel(error)) return;

        const message = error instanceof Error ? error.message : String(error);

        showError(message);
      } finally {
        if (!signal?.aborted) {
          setLastUpdated(new Date());
        }
      }
    },
    [
      deviceId,
      showError,
      onFetchDeployments,
      page,
      rowsPerPage,
      sortKey,
      sortOrder,
    ]
  );

  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    fetchDeployments();
  }, [fetchDeployments]);

  useEffect(() => {
    setLastUpdated(new Date());

    const controller = new AbortController();

    pollTimerRef.current = window.setInterval(() => {
      isPollingRef.current = true;
      fetchDeployments(controller.signal).finally(() => {
        isPollingRef.current = false;
      });
    }, CONTAINER_STACKS_REFRESH_INTERVAL);

    return () => {
      if (pollTimerRef.current) {
        window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }

      controller.abort();
    };
  }, [fetchDeployments]);

  const rows = useMemo(() => {
    const keyword = searchWord.trim().toLowerCase();
    return (deploymentItems ?? []).filter((item) => {
      const stackName = item.stackName?.toLowerCase() ?? '';

      const matchKeyword = !keyword || stackName.includes(keyword);
      const matchStatus = !statusFilter || item.status === statusFilter;

      return matchKeyword && matchStatus;
    });
  }, [deploymentItems, searchWord, statusFilter]);

  const hasFilter = Boolean(searchWord || statusFilter);

  const pagedRows = rows;

  const statusCounts = useMemo<Partial<Record<Status, number>>>(() => {
    return {
      pending: deploymentItems.filter((v) => v.status === 'pending').length,
      deploying: deploymentItems.filter((v) => v.status === 'deploying').length,
      running: deploymentItems.filter((v) => v.status === 'running').length,
      paused: deploymentItems.filter((v) => v.status === 'paused').length,
      error: deploymentItems.filter((v) => v.status === 'error').length,
      exited: deploymentItems.filter((v) => v.status === 'exited').length,
      retry: deploymentItems.filter((v) => v.status === 'retry').length,
    };
  }, [deploymentItems]);

  const selectedStack = deploymentItems.find(
    (item) => item.stackConfigId === selectedDeleteStack?.stackConfigId
  );

  const handleRefresh = async () => {
    try {
      await fetchDeployments();

      showSuccess('Deployment list refreshed');

      setPage(0);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Refresh deployment list failed';

      showError(message);
    }
  };

  const handleAdd = () => {
    if (!hasPermission) return;

    navigate(`/devices/${deviceId}/container-stacks/deploy`);
  };

  const handleSort = (key: TableHeaderSortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }

    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchWord('');
    setStatusFilter('');
    setSortKey('createdAt');
    setSortOrder('asc');
  };

  const handleSearchChange = (value: string) => {
    setSearchWord(value);
  };

  const handleStatusFilterChange = (value: Status | '') => {
    setStatusFilter(value);
  };

  const handleClose = () => {
    setDialogOpenDeleteStack(false);
    setSelectedDeleteStack(null);
  };

  const handleOpenDeleteStack = (stackConfigId: string, deviceId: string) => {
    setDialogOpenDeleteStack(true);
    setSelectedDeleteStack({ stackConfigId, deviceId });
  };

  const handleConfirmDeleteStack = async () => {
    if (!selectedDeleteStack || !hasPermission) return;

    try {
      await DELETE_STACK_FROM_DEVICE({
        deviceId: selectedDeleteStack.deviceId,
        stackConfigId: selectedDeleteStack.stackConfigId,
      });

      showSuccess('Stack deleted successfully');

      fetchDeployments();

      handleClose();
    } catch (err: unknown) {
      let message = 'Delete Container Stack failed';

      if (err instanceof Error) {
        message = err.message;
      }

      showError(message);
      console.error('[Delete Container Stack] failed:', message);
    } finally {
      handleClose();
    }
  };

  const handleAction = async (
    deviceId: string,
    stackConfigId: string,
    action: Action
  ) => {
    if (!hasPermission) return;

    try {
      await POST_STACK_ACTION({
        deviceId,
        stackConfigId,
        action,
      });

      showSuccess('Stack action performed successfully');

      fetchDeployments();

      handleClose();
    } catch (err: unknown) {
      let message = 'Stack action failed';

      if (err instanceof Error) {
        message = err.message;
      }

      showError(message);
      console.error('[Stack action] failed:', message);
    } finally {
      handleClose();
    }
  };

  const handleDeploy = async (
    deviceId: string,
    stackConfigId: string,
    stackRevisionId: string
  ) => {
    if (!hasPermission) return;

    if (!currentOrgId) {
      showError('No Org Id');
      return;
    }

    try {
      await POST_DEPLOY_STACK_TO_DEVICES({
        orgId: currentOrgId,
        stackConfigId,
        stackRevisionId,
        deviceIds: [deviceId],
      });

      showSuccess('Stack deployed successfully');

      fetchDeployments();

      handleClose();
    } catch (err: unknown) {
      let message = 'Stack deploy failed';

      if (err instanceof Error) {
        message = err.message;
      }

      showError(message);
      console.error('[Stack deploy] failed:', message);
    } finally {
      handleClose();
    }
  };

  return {
    hasPermission,
    loading: loading && !isPollingRef.current,
    lastUpdated,
    pagedRows,
    statusCounts,
    statusFilter,
    searchWord,
    page,
    rowsPerPage,
    sortKey,
    sortOrder,
    hasFilter,
    visibleTotalCount: hasFilter ? rows.length : totalCount,
    dialogOpenDeleteStack,
    selectedStackName: selectedStack?.stackName,
    selectedStackVersion: selectedStack?.version,
    setPage,
    setRowsPerPage,
    setStatusFilter,
    setDialogOpenDeleteStack,
    handleSearchChange,
    handleStatusFilterChange,
    handleSort,
    handleClearFilters,
    handleRefresh,
    handleAdd,
    handleOpenDeleteStack,
    handleConfirmDeleteStack,
    handleAction,
    handleDeploy,
  };
}
