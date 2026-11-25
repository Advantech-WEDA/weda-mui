import { useDeviceStore } from '@features/devices';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { usePageClamp } from '@shared/lib/usePageClamp';
import { useHasManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { type SortOrder, useNotification } from '@shared/ui';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
  DeploymentWithDeviceName,
  StackWithDeployments,
} from '../api/stacks.api.types';
import {
  type Action,
  countStackStatusCards,
  getStackStatusCard,
  type Status,
  type TableHeaderSortKey,
} from '../domain/types';
import { useDeploymentsStore } from '../store/useDeploymentsStore';
import { type RedeployTarget, useRedeployConfirm } from './useRedeployConfirm';
import { useStackCommand } from './useStackCommand';

export function useStackListPage() {
  const navigate = useAppNavigate();

  const [searchWord, setSearchWord] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<StackWithDeployments | null>(
    null
  );
  const [selectedDeleteStack, setSelectedDeleteStack] = useState<{
    stackConfigId: string;
    deviceId: string;
  } | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortKey, setSortKey] = useState<TableHeaderSortKey>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogOpenDeleteStack, setDialogOpenDeleteStack] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const { currentOrgId } = useOrgContentStore();
  const hasPermission = useHasManagementPermission();

  const { showError, showSuccess } = useNotification();
  const [totalCount, setTotalCount] = useState(0);
  const loading = useDeploymentsStore((s) => s.loading);
  const stackConfigsItems = useDeploymentsStore((s) => s.stackConfigsItems);
  const deploymentItems = useDeploymentsStore((s) => s.deploymentItems);
  const deviceItems = useDeviceStore((s) => s.deviceItems);

  const GET_ALL_STACK_CONFIGS = useDeploymentsStore(
    (s) => s.GET_ALL_STACK_CONFIGS
  );
  const GET_ALL_DEPLOYMENTS = useDeploymentsStore((s) => s.GET_ALL_DEPLOYMENTS);
  const GET_ALL_DEVICES = useDeviceStore((s) => s.GET_ALL_DEVICES);

  const DELETE_STACK_CONFIG_BY_ID = useDeploymentsStore(
    (s) => s.DELETE_STACK_CONFIG_BY_ID
  );
  const DELETE_STACK_FROM_DEVICE = useDeploymentsStore(
    (s) => s.DELETE_STACK_FROM_DEVICE
  );

  const { runStackCommand } = useStackCommand();

  const POST_DEPLOY_STACK_TO_DEVICES = useDeploymentsStore(
    (s) => s.POST_DEPLOY_STACK_TO_DEVICES
  );

  const fetchStacksList = useCallback(
    async (signal?: AbortSignal): Promise<boolean> => {
      if (!currentOrgId) {
        showError('No Org ID');
        return false;
      }
      let stacksLoaded = false;

      try {
        await GET_ALL_STACK_CONFIGS(
          { orgId: currentOrgId, sorting: 'createdAt desc' },
          signal
        );
        stacksLoaded = true;
        setLoadError(false);

        await GET_ALL_DEVICES({ orgId: currentOrgId }, signal);

        await GET_ALL_DEPLOYMENTS({ orgId: currentOrgId }, signal);
        return true;
      } catch (error) {
        if (axios.isCancel(error)) return false;

        const message = error instanceof Error ? error.message : String(error);
        if (!stacksLoaded) setTotalCount(0);
        setLoadError(true);
        showError(message);
        return false;
      }
    },
    [
      currentOrgId,
      showError,
      GET_ALL_STACK_CONFIGS,
      GET_ALL_DEPLOYMENTS,
      GET_ALL_DEVICES,
    ]
  );

  useEffect(() => {
    useDeploymentsStore.setState({
      deploymentItems: [],
      totalCount: 0,
    });

    const controller = new AbortController();

    fetchStacksList(controller.signal);

    return () => controller.abort();
  }, [fetchStacksList]);

  const isResolvingPage = usePageClamp({
    page,
    setPage,
    rowsPerPage,
    totalCount,
    itemCount: stackConfigsItems?.length ?? 0,
    loading,
  });

  const allRows = useMemo<StackWithDeployments[]>(() => {
    const deploymentMap = new Map<string, DeploymentWithDeviceName[]>();

    deploymentItems.forEach((deployment) => {
      const key = deployment.stackRevisionId;

      const enrichedDeployment: DeploymentWithDeviceName = {
        ...deployment,
        deviceName: deviceItems.find(
          (device) => device.deviceId === deployment.deviceId
        )?.deviceName,
      };

      if (!deploymentMap.has(key)) {
        deploymentMap.set(key, []);
      }

      deploymentMap.get(key)?.push(enrichedDeployment);
    });

    return (stackConfigsItems ?? []).map((stack) => ({
      ...stack,
      deployments: deploymentMap.get(stack.stackRevisionId) ?? [],
    }));
  }, [stackConfigsItems, deploymentItems, deviceItems]);

  const rows = useMemo<StackWithDeployments[]>(() => {
    const keyword = searchWord.trim().toLowerCase();

    return allRows.filter((stack) => {
      const matchStatus =
        !statusFilter ||
        stack.deployments.some(
          (deployment) =>
            getStackStatusCard(deployment?.status) === statusFilter
        );

      const stackName = stack.stackName?.toLowerCase() ?? '';
      const stackType = stack.type?.toLowerCase() ?? '';

      const matchKeyword = !keyword || stackName.includes(keyword);
      const matchType = !typeFilter || stackType === typeFilter;

      return matchKeyword && matchType && matchStatus;
    });
  }, [allRows, searchWord, statusFilter, typeFilter]);

  const lastPage = Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1);
  const currentPage = Math.min(page, lastPage);

  const pagedRows = rows.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  const hasFilter = Boolean(searchWord.trim() || statusFilter || typeFilter);

  const visibleTotalCount = rows.length;

  const statusCounts = useMemo<Partial<Record<Status, number>>>(
    () => countStackStatusCards(allRows.flatMap((stack) => stack.deployments)),
    [allRows]
  );

  const handleClearFilters = () => {
    setSearchWord('');
    setTypeFilter('');
    setStatusFilter('');
    setSortKey('createdAt');
    setSortOrder('desc');
    setPage(0);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setDialogOpenDeleteStack(false);
    setSelectedItem(null);
  };

  const handleAdd = () => {
    if (!hasPermission) return;

    navigate('/container-stacks/add');
  };

  const handleDeploy = useCallback(
    (stackConfigId: string, stackRevisionId: string) => {
      if (!hasPermission) return;

      navigate(`/container-stacks/${stackConfigId}/${stackRevisionId}/deploy`);
    },
    [navigate, hasPermission]
  );

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

      fetchStacksList();
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

  const deleteStackRow = rows.find(
    (row) =>
      row.stackConfigId === selectedDeleteStack?.stackConfigId &&
      row.deployments.some(
        (deployment) => deployment.deviceId === selectedDeleteStack?.deviceId
      )
  );

  const redeployStack = rows.find(
    (row) => row.stackRevisionId === redeployTarget?.stackRevisionId
  );

  const handleEdit = useCallback(
    (stackConfigId: string, stackRevisionId: string) => {
      if (!hasPermission) return;

      navigate(`/container-stacks/${stackConfigId}/${stackRevisionId}/edit`);
    },
    [navigate, hasPermission]
  );

  const handleRefresh = async () => {
    const ok = await fetchStacksList();
    if (!ok) return;

    showSuccess('Container Stacks list refreshed');
    setPage(0);
  };

  const handleRetryFetch = useCallback(() => {
    fetchStacksList();
  }, [fetchStacksList]);

  const handleSort = (key: TableHeaderSortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);
    setSortOrder('asc');
    setPage(0);
  };

  const handleOpenDelete = (row: StackWithDeployments) => {
    setSelectedItem(row);
    setDialogOpen(true);
  };

  const handleOpenDeleteStack = (stackConfigId: string, deviceId: string) => {
    setSelectedDeleteStack({ stackConfigId, deviceId });
    setDialogOpenDeleteStack(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem || !hasPermission) return;

    try {
      await DELETE_STACK_CONFIG_BY_ID({
        orgId: selectedItem.orgId,
        stackConfigId: selectedItem.stackConfigId,
        stackRevisionId: selectedItem.stackRevisionId,
      });

      showSuccess('Stack deleted successfully');

      fetchStacksList();

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

  const handleConfirmDeleteStack = async () => {
    if (!selectedDeleteStack || !hasPermission) return;

    try {
      await DELETE_STACK_FROM_DEVICE({
        deviceId: selectedDeleteStack.deviceId,
        stackConfigId: selectedDeleteStack.stackConfigId,
      });

      showSuccess('Stack deleted successfully');

      fetchStacksList();

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
      { onStatusUnknown: () => fetchStacksList() }
    );

    handleClose();
  };

  const handleSearchChange = (value: string) => {
    setSearchWord(value);
    setPage(0);
  };

  const handleStatusCardChange = (value: Status | '') => {
    setStatusFilter(value);
    setPage(0);
  };

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setPage(0);
  };

  const handleStatusFilterChange = (value: Status | '') => {
    setStatusFilter(value);
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setPage(0);
  };

  return {
    searchWord,
    statusFilter,
    typeFilter,
    hasFilter,
    selectedItem,
    page: currentPage,
    rowsPerPage,
    sortKey,
    sortOrder,
    dialogOpen,
    dialogOpenDeleteStack,
    deleteStackDialog: {
      stackName: deleteStackRow?.stackName,
      version: deleteStackRow?.version,
      deviceName: deleteStackRow?.deployments.find(
        (deployment) => deployment.deviceId === selectedDeleteStack?.deviceId
      )?.deviceName,
    },
    setDialogOpen,
    setDialogOpenDeleteStack,
    hasPermission,
    loading: loading || isResolvingPage,
    loadError,
    pagedRows,
    rows,
    visibleTotalCount,
    statusCounts,
    handleClearFilters,
    handleRetryFetch,
    handleAdd,
    handleDeploy,
    handleRedeploy: handleOpenRedeploy,
    redeployDialog: {
      open: redeployTarget !== null,
      stackName: redeployStack?.stackName,
      version: redeployStack?.version,
      deviceName: redeployStack?.deployments.find(
        (deployment) => deployment.deviceId === redeployTarget?.deviceId
      )?.deviceName,
      loading: redeployLoading,
      onClose: handleCloseRedeploy,
      onConfirm: handleConfirmRedeploy,
    },
    handleEdit,
    handleRefresh,
    handleSort,
    handleOpenDelete,
    handleOpenDeleteStack,
    handleConfirmDelete,
    handleConfirmDeleteStack,
    handleAction,
    handleSearchChange,
    handleStatusCardChange,
    handleTypeFilterChange,
    handleStatusFilterChange,
    handlePageChange,
    handleRowsPerPageChange,
  };
}
