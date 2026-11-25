import {
  type Action,
  countStackStatusCards,
  getStackStatusCard,
  type IDeploymentItem,
  type IGetListStacksInDeviceParams,
  type RedeployTarget,
  type Status,
  type TableHeaderSortKey,
  useDeploymentsStore,
  useRedeployConfirm,
  useStackCommand,
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
  rowsPerPage: number;
  onRowsPerPageChange: (rows: number) => void;
  onFetchDeployments: (
    params: Pick<IGetListStacksInDeviceParams, 'sorting'>,
    signal?: AbortSignal
  ) => Promise<unknown>;
}

export function useDeviceStacksTab({
  deploymentItems,
  loading,
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

  const { runStackCommand } = useStackCommand();

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
          { sorting: `${sortKey} ${sortOrder}` },
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
    [deviceId, showError, onFetchDeployments, sortKey, sortOrder]
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
      const matchStatus =
        !statusFilter || getStackStatusCard(item.status) === statusFilter;

      return matchKeyword && matchStatus;
    });
  }, [deploymentItems, searchWord, statusFilter]);

  const hasFilter = Boolean(searchWord || statusFilter);

  const lastPage = Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1);
  const currentPage = Math.min(page, lastPage);

  const pagedRows = rows.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  const statusCounts = useMemo<Partial<Record<Status, number>>>(
    () => countStackStatusCards(deploymentItems),
    [deploymentItems]
  );

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
    setPage(0);
  };

  const handleSearchChange = (value: string) => {
    setSearchWord(value);
    setPage(0);
  };

  const handleStatusFilterChange = (value: Status | '') => {
    setStatusFilter(value);
    setPage(0);
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

    await runStackCommand(
      { deviceId, stackConfigId, action },
      { onStatusUnknown: () => fetchDeployments() }
    );

    handleClose();
  };

  const redeploy = async ({
    deviceId,
    stackConfigId,
    stackRevisionId,
  }: RedeployTarget) => {
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
    } catch (err: unknown) {
      let message = 'Stack deploy failed';

      if (err instanceof Error) {
        message = err.message;
      }

      showError(message);
      console.error('[Stack deploy] failed:', message);
    }
  };

  const {
    redeployTarget,
    redeployLoading,
    handleOpenRedeploy,
    handleCloseRedeploy,
    handleConfirmRedeploy,
  } = useRedeployConfirm(redeploy);

  const redeployStack = deploymentItems.find(
    (item) => item.stackConfigId === redeployTarget?.stackConfigId
  );

  return {
    hasPermission,
    loading: loading && !isPollingRef.current,
    lastUpdated,
    pagedRows,
    statusCounts,
    statusFilter,
    searchWord,
    page: currentPage,
    rowsPerPage,
    sortKey,
    sortOrder,
    hasFilter,
    visibleTotalCount: rows.length,
    dialogOpenDeleteStack,
    selectedStackName: selectedStack?.stackName,
    selectedStackVersion: selectedStack?.version,
    setPage,
    setRowsPerPage,

    setStatusFilter: handleStatusFilterChange,
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
    handleDeploy: handleOpenRedeploy,

    redeployDialog: {
      open: redeployTarget !== null,
      stackName: redeployStack?.stackName,
      version: redeployStack?.version,
      loading: redeployLoading,
      onClose: handleCloseRedeploy,
      onConfirm: handleConfirmRedeploy,
    },
  };
}
