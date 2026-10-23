import {
  isDeviceOperational,
  isWedaNode,
  type Status,
  type TableHeaderSortKey,
  useDeviceStore,
} from '@features/devices';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useHasManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { type SortOrder, useNotification } from '@shared/ui';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { DeployDeviceRow } from '../api/stacks.api.types';
import type { Connectivity } from '../domain/types';
import { useDeploymentsStore } from '../store/useDeploymentsStore';

const LATEST_DATA_REFRESH_INTERVAL = 2 * 60 * 1000; // 2 minutes

const getDeployErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  return fallbackMessage;
};

export function useStackDeployPage() {
  const navigate = useAppNavigate();
  const { stackConfigId, stackRevisionId } = useParams();
  const { currentOrgId } = useOrgContentStore();

  const { showError, showSuccess } = useNotification();
  const hasPermission = useHasManagementPermission();

  const GET_STACK_CONFIG_BY_ID = useDeploymentsStore(
    (s) => s.GET_STACK_CONFIG_BY_ID
  );

  const POST_DEPLOY_STACK_TO_DEVICES = useDeploymentsStore(
    (s) => s.POST_DEPLOY_STACK_TO_DEVICES
  );

  const [cancelOpen, setCancelOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);

  const [searchWord, setSearchWord] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const [connectivityFilter, setConnectivityFilter] = useState<
    Connectivity | ''
  >('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [sortKey, setSortKey] = useState<TableHeaderSortKey>('deviceId');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const latestTimerRef = useRef<number | null>(null);

  const loading = useDeviceStore((s) => s.loading);
  const totalCount = useDeviceStore((s) => s.totalCount);
  const deviceItems = useDeviceStore((s) => s.deviceItems);
  const deviceLatestMap = useDeviceStore((s) => s.deviceLatestMap);
  const deploymentItems = useDeploymentsStore((s) => s.deploymentItems);
  const deploymentsLoading = useDeploymentsStore((s) => s.loading);
  const stackConfigById = useDeploymentsStore((s) => s.stackConfigById);
  const GET_DEVICES = useDeviceStore((s) => s.GET_DEVICES);
  const GET_DEVICE_LATEST_DATA = useDeviceStore(
    (s) => s.GET_DEVICE_LATEST_DATA
  );
  const GET_ALL_DEPLOYMENTS = useDeploymentsStore((s) => s.GET_ALL_DEPLOYMENTS);

  const pageTitle = stackConfigById
    ? `Deploy "${stackConfigById.stackName}(v${stackConfigById.version})" to Device(s)"`
    : 'Deploy to Device(s)';

  const fetchLatestDataByDeviceIds = useCallback(
    async (ids: string[], signal?: AbortSignal) => {
      if (!ids.length) return;

      const results = await Promise.allSettled(
        ids.map((deviceId) => GET_DEVICE_LATEST_DATA({ deviceId }, signal))
      );

      const failedItems = results
        .map((result, index) => ({
          deviceId: ids[index],
          result,
        }))

        .filter(
          (item) =>
            item.result.status === 'rejected' &&
            !axios.isCancel(item.result.reason)
        );

      if (failedItems.length > 0) {
        console.warn('[Device latest data failed]', failedItems);
      }
    },
    [GET_DEVICE_LATEST_DATA]
  );

  const clearLatestPolling = useCallback(() => {
    if (latestTimerRef.current) {
      window.clearInterval(latestTimerRef.current);
      latestTimerRef.current = null;
    }
  }, []);

  const fetchGetDevices = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      if (!currentOrgId || !stackRevisionId) {
        showError('No Org ID');
        return;
      }

      try {
        await GET_DEVICES(
          {
            orgId: currentOrgId,
            skipCount: page * rowsPerPage,
            maxResultCount: rowsPerPage,
            sorting: `${sortKey} ${sortOrder}`,
          },
          signal
        );

        await GET_ALL_DEPLOYMENTS(
          { orgId: currentOrgId, stackRevisionId: [stackRevisionId] },
          signal
        );
      } catch (error) {
        if (axios.isCancel(error)) return;

        const message = error instanceof Error ? error.message : String(error);
        showError(message);
      }
    },
    [
      currentOrgId,
      sortKey,
      sortOrder,
      showError,
      GET_DEVICES,
      GET_ALL_DEPLOYMENTS,
      stackRevisionId,
      page,
      rowsPerPage,
    ]
  );

  const filteredDeviceItems = useMemo(() => {
    const keyword = searchWord.trim().toLowerCase();

    return (deviceItems ?? []).filter((item) => {
      const deviceName = item.deviceName?.toLowerCase() ?? '';

      const matchKeyword = !keyword || deviceName.includes(keyword);
      const matchStatus = !statusFilter || item.status === statusFilter;

      return matchKeyword && matchStatus;
    });
  }, [deviceItems, searchWord, statusFilter]);

  const hasFilter = Boolean(searchWord || statusFilter || connectivityFilter);

  const pagedDeviceItems = filteredDeviceItems;

  const displayRows: DeployDeviceRow[] = useMemo(() => {
    const deploymentStatusMap = new Map(
      deploymentItems.map((deployment) => [
        deployment.deviceId,
        deployment.status,
      ])
    );

    return pagedDeviceItems.map((device) => ({
      ...device,
      lastSeen: deviceLatestMap[device.deviceId]?.time ?? null,
      latestData: deviceLatestMap[device.deviceId] ?? null,
      deploymentStatus: deploymentStatusMap.get(device.deviceId) ?? null,
    }));
  }, [pagedDeviceItems, deviceLatestMap, deploymentItems]);

  const isDeviceDisabled = useCallback(
    (
      device: Pick<
        DeployDeviceRow,
        | 'deviceId'
        | 'status'
        | 'deploymentStatus'
        | 'hwModel'
        | 'parentDeviceId'
      >
    ) => {
      return (
        !isWedaNode(device) ||
        !isDeviceOperational(device.status) ||
        (device.status === 'Activated' &&
          device.deploymentStatus === 'deploying')
      );
    },
    []
  );

  const selectableDeviceIds = useMemo(() => {
    return displayRows
      .filter((row) => !isDeviceDisabled(row))
      .map((row) => row.deviceId)
      .filter((deviceId): deviceId is string => Boolean(deviceId));
  }, [displayRows, isDeviceDisabled]);

  const visibleDeviceIds = useMemo(() => {
    return pagedDeviceItems
      .map((item) => item.deviceId)
      .filter((deviceId): deviceId is string => Boolean(deviceId));
  }, [pagedDeviceItems]);

  const visibleDeviceIdsKey = useMemo(
    () => visibleDeviceIds.join(','),
    [visibleDeviceIds]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchGetDevices(controller.signal);

    return () => {
      clearLatestPolling();
      controller.abort();
    };
  }, [fetchGetDevices, clearLatestPolling]);

  useEffect(() => {
    clearLatestPolling();

    const ids = visibleDeviceIdsKey ? visibleDeviceIdsKey.split(',') : [];

    if (!ids.length) return;

    const controller = new AbortController();

    fetchLatestDataByDeviceIds(ids, controller.signal);

    latestTimerRef.current = window.setInterval(() => {
      fetchLatestDataByDeviceIds(ids, controller.signal);
    }, LATEST_DATA_REFRESH_INTERVAL);

    return () => {
      clearLatestPolling();
      controller.abort();
    };
  }, [clearLatestPolling, fetchLatestDataByDeviceIds, visibleDeviceIdsKey]);

  const handleClearFilters = () => {
    setSearchWord('');
    setStatusFilter('');
    setConnectivityFilter('');
    setSortKey('deviceId');
    setSortOrder('asc');
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

  const handleSearchChange = (value: string) => {
    setSearchWord(value);
  };

  const handleStatusFilterChange = (value: Status | '') => {
    setStatusFilter(value);
  };

  const fetchStackConfigById = useCallback(
    async (signal?: AbortSignal) => {
      if (!stackConfigId || !stackRevisionId || !currentOrgId) return;

      try {
        await GET_STACK_CONFIG_BY_ID(
          {
            orgId: currentOrgId,
            stackConfigId,
            stackRevisionId,
          },
          signal
        );
      } catch (error) {
        if (axios.isCancel(error)) return;

        const message = getDeployErrorMessage(
          error,
          'Fetch stack config failed'
        );

        showError(message);
        console.error('[DeployStack] Fetch stack config failed:', error);
      }
    },
    [
      GET_STACK_CONFIG_BY_ID,
      currentOrgId,
      showError,
      stackConfigId,
      stackRevisionId,
    ]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchStackConfigById(controller.signal);

    return () => controller.abort();
  }, [fetchStackConfigById]);

  const handleSelectDevice = (deviceId: string) => {
    setSelectedDeviceIds((prev) =>
      prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const handleSelectAll = (deviceIds: string[]) => {
    const isAllSelected = deviceIds.every((id) =>
      selectedDeviceIds.includes(id)
    );

    setSelectedDeviceIds((prev) =>
      isAllSelected
        ? prev.filter((id) => !deviceIds.includes(id))
        : [...new Set([...prev, ...deviceIds])]
    );
  };

  const closeDialogs = () => {
    setCancelOpen(false);
    setSubmitOpen(false);
  };

  const validateSubmit = () => {
    if (!hasPermission) return false;

    if (!currentOrgId) {
      showError('Organization is required');
      return false;
    }

    if (!stackConfigId || !stackRevisionId) {
      showError('Stack config is required');
      return false;
    }

    if (selectedDeviceIds.length === 0) {
      showError('Please select devices');
      return false;
    }

    return true;
  };

  const handleSubmitConfirmOpen = () => {
    if (submitting) return;

    if (!validateSubmit()) return;

    setSubmitOpen(true);
  };

  const handleSubmit = async () => {
    if (submitting) return;

    if (!validateSubmit()) return;

    try {
      setSubmitting(true);

      await POST_DEPLOY_STACK_TO_DEVICES({
        orgId: currentOrgId!,
        stackConfigId: stackConfigId!,
        stackRevisionId: stackRevisionId!,
        deviceIds: selectedDeviceIds,
      });

      closeDialogs();

      showSuccess('Success: Deployment task(s) created.');

      navigate('/container-stacks');
    } catch (error) {
      const message = getDeployErrorMessage(error, 'Deploy failed');

      showError(message);
      console.error('[DeployStack] Deploy failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) return;

    closeDialogs();
    navigate('/container-stacks');
  };

  const handleOpenCancelDialog = () => {
    if (!submitting) setCancelOpen(true);
  };

  return {
    cancelOpen,
    submitOpen,
    selectedDeviceIds,
    handleSelectDevice,
    handleSelectAll,
    handleSubmit,
    handleCancel,
    handleConfirmCancel: closeDialogs,
    handleOpenCancelDialog,
    handleSubmitConfirmOpen,

    pageTitle,
    hasPermission,
    loading,
    deploymentsLoading,
    displayRows,
    disabledDeviceIds: displayRows
      .filter(isDeviceDisabled)
      .map((row) => row.deviceId),
    selectableDeviceIds,
    searchWord,
    statusFilter,
    page,
    rowsPerPage,
    sortKey,
    sortOrder,

    visibleTotalCount: hasFilter ? filteredDeviceItems.length : totalCount,
    hasFilter,
    setPage,
    setRowsPerPage,
    handleSearchChange,
    handleStatusFilterChange,
    handleSort,
    handleClearFilters,
  };
}
