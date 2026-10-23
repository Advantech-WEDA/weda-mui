import { useHasManagementPermission } from '@shared/session/useHasManagementPermission';
import { useNotification } from '@shared/ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  type CollectionFilter,
  type IDeviceTelemetryTableItem,
  TELEMETRY_REFRESH_INTERVAL,
} from '../domain/types';
import { useDeviceStore } from '../store/useDeviceStore';

interface Input {
  loading: boolean;
  onFetchTelemetryTable: () => Promise<unknown>;
}

export function useDeviceTelemetryTab({
  loading,
  onFetchTelemetryTable,
}: Input) {
  const { deviceId } = useParams<{
    tenant: string;
    deviceId: string;
  }>();

  const [search, setSearch] = useState('');
  const [collectionFilter, setCollectionFilter] =
    useState<CollectionFilter>('all');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [originalRow, setOriginalRow] =
    useState<IDeviceTelemetryTableItem | null>(null);

  const isPollingRef = useRef(false);

  const [lastUpdated, setLastUpdated] = useState<Date>(() => new Date());

  const { showError, showSuccess } = useNotification();

  const hasPermission = useHasManagementPermission();

  const telemetryTableItems = useDeviceStore((s) => s.telemetryTableItems);

  const UPDATE_LOCAL_TELEMETRY_ROW = useDeviceStore(
    (s) => s.UPDATE_LOCAL_TELEMETRY_ROW
  );

  const SAVE_DEVICE_TELEMETRY_ROW = useDeviceStore(
    (s) => s.SAVE_DEVICE_TELEMETRY_ROW
  );

  const fetchTelemetryTable = useCallback(async (): Promise<void> => {
    try {
      await onFetchTelemetryTable();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      showError(message);
    } finally {
      setLastUpdated(new Date());
    }
  }, [onFetchTelemetryTable, showError]);

  useEffect(() => {
    if (editingKey) return;

    const timerId = window.setInterval(() => {
      isPollingRef.current = true;
      fetchTelemetryTable().finally(() => {
        isPollingRef.current = false;
      });
    }, TELEMETRY_REFRESH_INTERVAL);

    return () => window.clearInterval(timerId);
  }, [fetchTelemetryTable, editingKey]);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    let filtered = telemetryTableItems;

    if (keyword) {
      filtered = filtered.filter(
        (row) =>
          row.telemetryName.toLowerCase().includes(keyword) ||
          row.telemetryKey.toLowerCase().includes(keyword)
      );
    }

    if (collectionFilter === 'enabled') {
      filtered = filtered.filter((row) => row.collectionEnabled);
    }

    if (collectionFilter === 'disabled') {
      filtered = filtered.filter((row) => !row.collectionEnabled);
    }

    return filtered;
  }, [search, collectionFilter, telemetryTableItems]);

  const maxPage = Math.max(0, Math.ceil(filteredRows.length / rowsPerPage) - 1);
  const currentPage = Math.min(page, maxPage);

  const pagedRows = useMemo(() => {
    return filteredRows.slice(
      currentPage * rowsPerPage,
      currentPage * rowsPerPage + rowsPerPage
    );
  }, [filteredRows, currentPage, rowsPerPage]);

  const handleClearFilters = () => {
    setSearch('');
    setCollectionFilter('all');
    setPage(0);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleCollectionFilterChange = (value: CollectionFilter) => {
    setCollectionFilter(value);
    setPage(0);
  };

  const handleRefresh = () => {
    fetchTelemetryTable();
    showSuccess('Device list refreshed');
  };

  const handleStartEdit = (row: IDeviceTelemetryTableItem) => {
    setEditingKey(row.key);
    setOriginalRow(row);
  };

  const handleCancelEdit = () => {
    if (originalRow) {
      UPDATE_LOCAL_TELEMETRY_ROW(originalRow.key, {
        collectionEnabled: originalRow.collectionEnabled,
        frequency: originalRow.frequency,
      });
    }

    setEditingKey(null);
    setOriginalRow(null);
  };

  const handleFrequencyChange = (value: number) => {
    if (!editingKey) return;

    UPDATE_LOCAL_TELEMETRY_ROW(editingKey, {
      frequency: Number.isNaN(value) ? 0 : value,
    });
  };

  const handleCollectionChange = (checked: boolean) => {
    if (!editingKey) return;
    UPDATE_LOCAL_TELEMETRY_ROW(editingKey, {
      collectionEnabled: checked,
    });
  };

  const handleSaveEdit = async (row: IDeviceTelemetryTableItem) => {
    if (!deviceId) return;
    setEditingKey(null);
    setOriginalRow(null);

    try {
      await SAVE_DEVICE_TELEMETRY_ROW(deviceId, row, originalRow);

      showSuccess('Configs updated successfully');
    } catch (error) {
      console.error('[SAVE_DEVICE_TELEMETRY_ROW] failed:', error);
      const message = error instanceof Error ? error.message : String(error);
      showError(message);
    }
  };

  return {
    hasPermission,
    loading: loading && !isPollingRef.current,
    lastUpdated,
    pagedRows,
    search,
    collectionFilter,
    currentPage,
    rowsPerPage,
    editingKey,
    filteredTotalCount: filteredRows.length,
    hasFilter: !!search || collectionFilter !== 'all',
    setPage,
    setRowsPerPage,
    handleSearchChange,
    handleCollectionFilterChange,
    handleClearFilters,
    handleRefresh,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleFrequencyChange,
    handleCollectionChange,
  };
}
