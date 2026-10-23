import { useDeviceStore } from '@features/devices';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
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
  type Status,
  type TableHeaderSortKey,
} from '../domain/types';
import { useDeploymentsStore } from '../store/useDeploymentsStore';

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

  const [totalCount, setTotalCount] = useState(0);

  const { currentOrgId } = useOrgContentStore();
  const hasPermission = useHasManagementPermission();

  const { showError, showSuccess } = useNotification();

  const loading = useDeploymentsStore((s) => s.loading);
  const stackConfigsItems = useDeploymentsStore((s) => s.stackConfigsItems);
  const deploymentItems = useDeploymentsStore((s) => s.deploymentItems);
  const deviceItems = useDeviceStore((s) => s.deviceItems);

  const GET_STACK_CONFIGS = useDeploymentsStore((s) => s.GET_STACK_CONFIGS);
  const GET_ALL_DEPLOYMENTS = useDeploymentsStore((s) => s.GET_ALL_DEPLOYMENTS);
  const GET_ALL_DEVICES = useDeviceStore((s) => s.GET_ALL_DEVICES);

  const DELETE_STACK_CONFIG_BY_ID = useDeploymentsStore(
    (s) => s.DELETE_STACK_CONFIG_BY_ID
  );
  const DELETE_STACK_FROM_DEVICE = useDeploymentsStore(
    (s) => s.DELETE_STACK_FROM_DEVICE
  );

  const POST_STACK_ACTION = useDeploymentsStore((s) => s.POST_STACK_ACTION);

  const POST_DEPLOY_STACK_TO_DEVICES = useDeploymentsStore(
    (s) => s.POST_DEPLOY_STACK_TO_DEVICES
  );

  const fetchStacksList = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      if (!currentOrgId) {
        showError('No Org ID');
        return;
      }

      try {
        const stackResponse = await GET_STACK_CONFIGS(
          {
            orgId: currentOrgId,
            skipCount: page * rowsPerPage,
            maxResultCount: rowsPerPage,
            sorting: `${sortKey} ${sortOrder}`,
          },
          signal
        );

        setLoadError(false);
        setTotalCount(stackResponse.totalCount);

        const revisionIds = stackResponse.items
          .map((item) => item.stackRevisionId)
          .filter(Boolean);

        if (!revisionIds.length) {
          return;
        }

        await GET_ALL_DEVICES({ orgId: currentOrgId }, signal);

        await GET_ALL_DEPLOYMENTS(
          { orgId: currentOrgId, stackRevisionId: revisionIds },
          signal
        );
      } catch (error) {
        if (axios.isCancel(error)) return;

        const message = error instanceof Error ? error.message : String(error);
        setLoadError(true);
        showError(message);
      }
    },
    [
      currentOrgId,
      page,
      rowsPerPage,
      sortKey,
      sortOrder,
      showError,
      GET_STACK_CONFIGS,
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

  const rows = useMemo<StackWithDeployments[]>(() => {
    const keyword = searchWord.trim().toLowerCase();
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

    return (stackConfigsItems ?? [])
      .map((stack) => ({
        ...stack,
        deployments: deploymentMap.get(stack.stackRevisionId) ?? [],
      }))
      .filter((stack) => {
        const matchStatus =
          !statusFilter ||
          stack.deployments.some(
            (deployment) =>
              deployment?.status?.toLowerCase() === statusFilter.toLowerCase()
          );

        const stackName = stack.stackName?.toLowerCase() ?? '';
        const stackType = stack.type?.toLowerCase() ?? '';

        const matchKeyword = !keyword || stackName.includes(keyword);
        const matchType = !typeFilter || stackType === typeFilter;

        return matchKeyword && matchType && matchStatus;
      });
  }, [
    stackConfigsItems,
    deploymentItems,
    deviceItems,
    searchWord,
    statusFilter,
    typeFilter,
  ]);

  const pagedRows = rows;

  const hasFilter = Boolean(searchWord.trim() || statusFilter || typeFilter);

  const visibleTotalCount = hasFilter ? rows.length : totalCount;

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

  const handleClearFilters = () => {
    setSearchWord('');
    setTypeFilter('');
    setStatusFilter('');
    setSortKey('createdAt');
    setSortOrder('desc');
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

  const handleRedeploy = async (
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

      fetchStacksList();

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

  const handleEdit = useCallback(
    (stackConfigId: string, stackRevisionId: string) => {
      if (!hasPermission) return;

      navigate(`/container-stacks/${stackConfigId}/${stackRevisionId}/edit`);
    },
    [navigate, hasPermission]
  );

  const handleRefresh = async () => {
    try {
      await fetchStacksList();

      showSuccess('Container Stacks list refreshed');

      setPage(0);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Refresh Container Stacks list failed';

      showError(message);
    }
  };

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

    try {
      await POST_STACK_ACTION({
        deviceId,
        stackConfigId,
        action,
      });

      showSuccess('Stack action performed successfully');

      fetchStacksList();

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

  const handleSearchChange = (value: string) => {
    setSearchWord(value);
  };

  const handleStatusCardChange = (value: Status | '') => {
    setStatusFilter(value);
  };

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
  };

  const handleStatusFilterChange = (value: Status | '') => {
    setStatusFilter(value);
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
    page,
    rowsPerPage,
    sortKey,
    sortOrder,
    dialogOpen,
    dialogOpenDeleteStack,
    setDialogOpen,
    setDialogOpenDeleteStack,
    hasPermission,
    loading,
    loadError,
    pagedRows,
    rows,
    visibleTotalCount,
    statusCounts,
    handleClearFilters,
    handleRetryFetch: fetchStacksList,
    handleAdd,
    handleDeploy,
    handleRedeploy,
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
