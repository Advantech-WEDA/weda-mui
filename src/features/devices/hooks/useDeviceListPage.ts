import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { type SortOrder, useNotification } from '@shared/ui';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  buildActivationSuccessMsg,
  buildStatusDialogContent,
  getActivationAction,
} from '@/features/devices/domain/devicePolicy';
import {
  LATEST_DATA_REFRESH_INTERVAL,
  type Status,
  type TableHeaderSortKey,
} from '@/features/devices/domain/types';
import { useDeviceStore } from '@/features/devices/store/useDeviceStore';

import type {
  IDataStreamsLatestResponse,
  IDeviceItem,
} from '../api/devices.api.types';

export function filterDeviceItems(
  items: IDeviceItem[],
  searchWord: string,
  statusFilter: Status | ''
): IDeviceItem[] {
  const keyword = searchWord.trim().toLowerCase();

  return items.filter((item) => {
    const deviceId = item.deviceId?.toLowerCase() ?? '';
    const deviceName = item.deviceName?.toLowerCase() ?? '';
    const matchKeyword =
      !keyword || deviceId.includes(keyword) || deviceName.includes(keyword);
    const matchStatus = !statusFilter || item.status === statusFilter;
    return matchKeyword && matchStatus;
  });
}

export function computeStatusCounts(
  items: IDeviceItem[]
): Record<Status, number> {
  return {
    Registered: items.filter((v) => v.status === 'Registered').length,
    Activated: items.filter((v) => v.status === 'Activated').length,
    Deactivated: items.filter((v) => v.status === 'Deactivated').length,
  };
}

export function mergeLatestData(
  items: IDeviceItem[],
  deviceLatestMap: Record<string, IDataStreamsLatestResponse>
): IDeviceItem[] {
  return items.map((item) => ({
    ...item,
    lastSeen: deviceLatestMap[item.deviceId]?.time,
    latestData: deviceLatestMap[item.deviceId],
  }));
}

export function useDeviceListPage() {
  const navigate = useAppNavigate();

  const [searchWord, setSearchWord] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortKey, setSortKey] = useState<TableHeaderSortKey>('deviceId');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IDeviceItem | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [loadError, setLoadError] = useState(false);
  const [devicesReady, setDevicesReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { showError, showSuccess } = useNotification();
  const latestTimerRef = useRef<number | null>(null);

  const { currentOrgId } = useOrgContentStore();

  const permissions = useManagementPermission();
  const hasPermission = permissions.canManageDevices;
  const hasDeletePermission = permissions.canDeleteDevices;

  const loading = useDeviceStore((s) => s.loading);
  const deviceItems = useDeviceStore((s) => s.deviceItems);
  const deviceLatestMap = useDeviceStore((s) => s.deviceLatestMap);
  const totalCount = useDeviceStore((s) => s.totalCount);

  const GET_DEVICES = useDeviceStore((s) => s.GET_DEVICES);
  const POST_DEVICE_STATUS = useDeviceStore((s) => s.POST_DEVICE_STATUS);
  const DELETE_DEVICES = useDeviceStore((s) => s.DELETE_DEVICES);
  const GET_DEVICES_LATEST_DATA_BATCH = useDeviceStore(
    (s) => s.GET_DEVICES_LATEST_DATA_BATCH
  );

  const canDelete =
    inputValue.trim() === (selectedItem?.deviceName ?? '').trim();

  const hasFilter = Boolean(searchWord.trim() || statusFilter);

  const filteredRows = useMemo(
    () => filterDeviceItems(deviceItems ?? [], searchWord, statusFilter),
    [deviceItems, searchWord, statusFilter]
  );

  const pagedRows = useMemo(
    () => filteredRows.slice(0, rowsPerPage),
    [filteredRows, rowsPerPage]
  );

  const displayRows = useMemo(
    () => mergeLatestData(pagedRows, deviceLatestMap),
    [pagedRows, deviceLatestMap]
  );

  const visibleDeviceIds = useMemo(
    () =>
      pagedRows
        .map((item) => item.deviceId)
        .filter((id): id is string => Boolean(id)),
    [pagedRows]
  );

  const visibleDeviceIdsKey = useMemo(
    () => visibleDeviceIds.join(','),
    [visibleDeviceIds]
  );

  const statusCounts = useMemo(
    () => computeStatusCounts(deviceItems),
    [deviceItems]
  );

  const statusDialogContent = useMemo(
    () => buildStatusDialogContent(selectedItem, 'list'),
    [selectedItem]
  );

  const fetchLatestDataByDeviceIds = useCallback(
    async (ids: string[], signal?: AbortSignal) => {
      if (!ids.length) return;

      await GET_DEVICES_LATEST_DATA_BATCH(ids, signal);
    },
    [GET_DEVICES_LATEST_DATA_BATCH]
  );

  const clearLatestPolling = useCallback(() => {
    if (latestTimerRef.current) {
      window.clearInterval(latestTimerRef.current);
      latestTimerRef.current = null;
    }
  }, []);

  const fetchGetDevices = useCallback(
    async (signal?: AbortSignal): Promise<boolean> => {
      if (!currentOrgId) {
        showError('No Org ID');
        return false;
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

        setLoadError(false);
        return true;
      } catch (error) {
        if (axios.isCancel(error)) return false;

        setLoadError(true);
        showError(error instanceof Error ? error.message : String(error));
        return false;
      }
    },
    [
      currentOrgId,
      showError,
      GET_DEVICES,
      page,
      rowsPerPage,
      sortKey,
      sortOrder,
    ]
  );

  useEffect(() => {
    setDevicesReady(false);

    const controller = new AbortController();

    fetchGetDevices(controller.signal).then((ok) => {
      if (ok) setDevicesReady(true);
    });

    return () => {
      clearLatestPolling();
      controller.abort();
    };
  }, [fetchGetDevices, clearLatestPolling]);

  useEffect(() => {
    clearLatestPolling();

    if (!devicesReady) return;

    const ids = visibleDeviceIdsKey ? visibleDeviceIdsKey.split(',') : [];

    if (!ids.length) return;

    const controller = new AbortController();

    let tickInFlight = false;

    const tick = async () => {
      if (tickInFlight) return;

      tickInFlight = true;

      try {
        await fetchLatestDataByDeviceIds(ids, controller.signal);
      } finally {
        tickInFlight = false;
      }
    };

    tick();

    latestTimerRef.current = window.setInterval(
      tick,
      LATEST_DATA_REFRESH_INTERVAL
    );

    return () => {
      clearLatestPolling();
      controller.abort();
    };
  }, [
    devicesReady,
    visibleDeviceIdsKey,
    fetchLatestDataByDeviceIds,
    clearLatestPolling,
  ]);

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setStatusDialogOpen(false);
    setSelectedItem(null);
    setInputValue('');
  };

  const handleAdd = () => {
    if (!hasPermission) return;
    navigate('/devices/add');
  };

  const handleEdit = useCallback(
    (deviceId: string) => {
      if (!hasPermission) return;
      navigate(`/devices/${deviceId}/edit`);
    },
    [hasPermission, navigate]
  );

  const handleRefresh = async () => {
    if (refreshing) return;

    setRefreshing(true);

    try {
      const isFetched = await fetchGetDevices();
      if (!isFetched) return;

      await fetchLatestDataByDeviceIds(visibleDeviceIds);
      showSuccess('Device list refreshed');
      setPage(0);
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Refresh device list failed'
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleOpenDelete = (row: IDeviceItem) => {
    setSelectedItem(row);
    setDeleteDialogOpen(true);
  };

  const handleOpenStatus = (row: IDeviceItem) => {
    setSelectedItem(row);
    setStatusDialogOpen(true);
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
  };

  const handleActivationStatus = async () => {
    if (!selectedItem || !hasPermission) return;

    const action = getActivationAction(selectedItem.status);

    try {
      await POST_DEVICE_STATUS({
        deviceId: selectedItem.deviceId,
        status: action,
      });
      await fetchGetDevices();
      handleCloseDialog();
      showSuccess(buildActivationSuccessMsg(action));
    } catch (error) {
      handleCloseDialog();
      showError(
        error instanceof Error ? error.message : 'Update device status failed'
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem || !hasDeletePermission) return;

    try {
      await DELETE_DEVICES({ deviceId: selectedItem.deviceId });
      await fetchGetDevices();
      handleCloseDialog();
      showSuccess('Device deleted successfully');
      setPage(0);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Delete device failed';
      showError(message);
      console.error('[Delete device] failed:', message);
    }
  };

  const handleStatusCardChange = (value: Status | '') => {
    setStatusFilter(value);
    setSearchWord('');
  };

  const handleSearchChange = (value: string) => {
    setSearchWord(value);
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

  const handleStatusDialogClose = () => setStatusDialogOpen(false);

  const tableSectionProps = {
    rows: displayRows,
    totalCount: hasFilter ? filteredRows.length : totalCount,
    page,
    rowsPerPage,
    sortKey,
    sortOrder,
    loading,
    hasError: loadError,
    hasFilter,
    hasPermission,
    hasDeletePermission,
    onSort: handleSort,
    onRetry: fetchGetDevices,
    onClearAll: handleClearFilters,
    onPageChange: handlePageChange,
    onRowsPerPageChange: handleRowsPerPageChange,
    onDelete: handleOpenDelete,
    onEdit: handleEdit,
    onActivationStatus: handleOpenStatus,
    onAdd: handleAdd,
  };

  return {
    searchWord,
    statusFilter,
    page,
    rowsPerPage,
    sortKey,
    sortOrder,
    deleteDialogOpen,
    statusDialogOpen,
    selectedItem,
    inputValue,
    setInputValue,
    canDelete,
    hasFilter,
    filteredRows,
    displayRows,
    statusCounts,
    statusDialogContent,
    loading,
    hasPermission,
    hasDeletePermission,
    refreshing,
    handleCloseDialog,
    handleAdd,
    handleEdit,
    handleRefresh,
    handleOpenDelete,
    handleOpenStatus,
    handleSort,
    handleClearFilters,
    handleActivationStatus,
    handleConfirmDelete,
    handleStatusCardChange,
    handleSearchChange,
    handleStatusFilterChange,
    handlePageChange,
    handleRowsPerPageChange,
    handleStatusDialogClose,
    tableSectionProps,
  };
}
