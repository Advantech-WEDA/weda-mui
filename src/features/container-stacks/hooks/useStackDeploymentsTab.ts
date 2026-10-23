import { useDeviceStore } from '@features/devices';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useHasManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { type SortOrder, useNotification } from '@shared/ui';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  type Action,
  type DeploymentDeviceRow,
  DEPLOYMENTS_REFRESH_INTERVAL,
  type Status,
  type TableHeaderSortKey,
} from '../domain/types';
import { useDeploymentsStore } from '../store/useDeploymentsStore';

export function useStackDeploymentsTab() {
  const { stackRevisionId, stackConfigId } = useParams<{
    stackRevisionId: string;
    stackConfigId: string;
  }>();

  const navigate = useAppNavigate();

  const [dialogOpenDeleteStack, setDialogOpenDeleteStack] = useState(false);
  const [selectedDeleteStack, setSelectedDeleteStack] = useState<{
    stackConfigId: string;
    deviceId: string;
  } | null>(null);

  const [searchWord, setSearchWord] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [sortKey, setSortKey] = useState<TableHeaderSortKey>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const isPollingRef = useRef(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const hasPermission = useHasManagementPermission();

  const { showError, showSuccess } = useNotification();
  const { currentOrgId } = useOrgContentStore();

  const loading = useDeploymentsStore((s) => s.loading);

  const totalCount = useDeploymentsStore((s) => s.totalCount);

  const deploymentItems = useDeploymentsStore((s) => s.deploymentItems);

  const deviceItems = useDeviceStore((s) => s.deviceItems);

  const GET_DEPLOYMENTS = useDeploymentsStore((s) => s.GET_DEPLOYMENTS);
  const GET_ALL_DEVICES = useDeviceStore((s) => s.GET_ALL_DEVICES);
  const POST_STACK_ACTION = useDeploymentsStore((s) => s.POST_STACK_ACTION);

  const DELETE_STACK_FROM_DEVICE = useDeploymentsStore(
    (s) => s.DELETE_STACK_FROM_DEVICE
  );
  const POST_DEPLOY_STACK_TO_DEVICES = useDeploymentsStore(
    (s) => s.POST_DEPLOY_STACK_TO_DEVICES
  );

  const fetchDeploymentList = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      if (!currentOrgId || !stackRevisionId) return;

      try {
        await GET_DEPLOYMENTS(
          {
            orgId: currentOrgId,
            skipCount: page * rowsPerPage,
            maxResultCount: rowsPerPage,
            sorting: `${sortKey} ${sortOrder}`,

            stackRevisionId: [stackRevisionId],
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
      currentOrgId,
      stackRevisionId,
      page,
      rowsPerPage,
      sortKey,
      sortOrder,
      GET_DEPLOYMENTS,
      showError,
    ]
  );

  const fetchDeployments = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      if (!currentOrgId) {
        showError('No Org Id');
        return;
      }

      if (!stackRevisionId) {
        showError('No stack Revision Id');
        return;
      }

      try {
        await GET_ALL_DEVICES({ orgId: currentOrgId }, signal);
      } catch (error) {
        if (axios.isCancel(error)) return;

        throw error;
      }

      await fetchDeploymentList(signal);
    },
    [
      currentOrgId,
      stackRevisionId,
      GET_ALL_DEVICES,
      fetchDeploymentList,
      showError,
    ]
  );

  useEffect(() => {
    useDeploymentsStore.setState({
      deploymentItems: [],
      totalCount: 0,
    });

    const controller = new AbortController();

    fetchDeployments(controller.signal);

    return () => controller.abort();
  }, [fetchDeployments]);

  useEffect(() => {
    const controller = new AbortController();

    const timerId = window.setInterval(() => {
      isPollingRef.current = true;
      fetchDeploymentList(controller.signal).finally(() => {
        isPollingRef.current = false;
      });
    }, DEPLOYMENTS_REFRESH_INTERVAL);

    return () => {
      window.clearInterval(timerId);
      controller.abort();
    };
  }, [fetchDeploymentList]);

  const rows = useMemo<DeploymentDeviceRow[]>(() => {
    if (deploymentItems.length === 0 || deviceItems.length === 0) {
      return [];
    }

    return deploymentItems
      .filter((deployment) => {
        const deviceName = deviceItems.find(
          (device) => device.deviceId === deployment.deviceId
        )?.deviceName;

        const matchSearchWord =
          !searchWord ||
          (deviceName?.toLowerCase().includes(searchWord.toLowerCase()) ??
            false);

        const matchStatusFilter =
          !statusFilter || deployment.status === statusFilter;

        return matchSearchWord && matchStatusFilter;
      })
      .map((deployment) => ({
        id: deployment.deploymentId,
        deviceId: deployment.deviceId,
        deviceName:
          deviceItems.find((device) => device.deviceId === deployment.deviceId)
            ?.deviceName ?? '-',
        deviceStatus:
          deviceItems.find((device) => device.deviceId === deployment.deviceId)
            ?.status ?? '-',
        deviceCreationTime:
          deviceItems.find((device) => device.deviceId === deployment.deviceId)
            ?.createdAt ?? '-',
        status: deployment.status,
        dateModified: deployment.createdAt,
        dateCreated: deployment.createdAt,
        containers: deployment.containers.map((container) => ({
          id: container.id,
          name: container.name,
          state: container.state,
          error: container.error,
        })),
        stackName: deployment.stackName,
        version: deployment.version,
      }));
  }, [deploymentItems, deviceItems, searchWord, statusFilter]);

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

  const handleAdd = () => {
    if (!hasPermission) return;

    navigate(`/container-stacks/${stackConfigId}/${stackRevisionId}/deploy`);
  };

  const handleSort = (key: TableHeaderSortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }

    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchWord('');
    setStatusFilter('');
    setSortKey('createdAt');
    setSortOrder('desc');
  };

  const handleSearchChange = (value: string) => {
    setSearchWord(value);
  };

  const handleStatusFilterChange = (value: Status | '') => {
    setStatusFilter(value);
  };

  const handleClose = () => {
    setDialogOpenDeleteStack(false);
  };

  const handleOpenDeleteStack = (stackConfigId: string, deviceId: string) => {
    setSelectedDeleteStack({ stackConfigId, deviceId });

    setDialogOpenDeleteStack(true);
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
    loading: loading && !isPollingRef.current,
    lastUpdated,
    hasPermission,
    pagedRows,
    statusCounts,
    statusFilter,
    searchWord,
    page,
    rowsPerPage,
    sortKey,
    sortOrder,
    dialogOpenDeleteStack,

    visibleTotalCount: hasFilter ? rows.length : totalCount,
    hasFilter,
    setPage,
    setRowsPerPage,

    setStatusFilter,
    handleSearchChange,
    handleStatusFilterChange,
    handleSort,
    handleClearFilters,
    handleAdd,
    handleClose,
    handleOpenDeleteStack,
    handleConfirmDeleteStack,
    handleAction,
    handleDeploy,
  };
}
