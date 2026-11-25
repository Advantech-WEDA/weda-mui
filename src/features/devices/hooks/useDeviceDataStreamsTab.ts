import {
  type DataStreamDataType,
  dataStreamsApi,
  type DataStreamSourceType,
  getDataStreamActions,
  getDeleteConfirmation,
  type IDataStreamItem,
} from '@features/data-streams';
import { fetchAllPages } from '@shared/api/fetchAllPages';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { type SelectOption, type SortOrder, useNotification } from '@shared/ui';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { DataStreamSortKey } from '@/features/devices/components/Detail/DataStreams/dataStreamTable.columns';

export const UNBOUND_SOURCE = 'Unbound';

export type SourceFilterValue = DataStreamSourceType | typeof UNBOUND_SOURCE;

export function useDeviceDataStreamsTab() {
  const navigate = useAppNavigate();
  const { deviceId } = useParams<{ tenant: string; deviceId: string }>();
  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);
  const hasPermission = useManagementPermission().canManageDevices;
  const { showError, showSuccess } = useNotification();

  const [items, setItems] = useState<IDataStreamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [searchWord, setSearchWord] = useState('');
  const [dataTypeFilter, setDataTypeFilter] = useState<DataStreamDataType | ''>(
    ''
  );
  const [sourceFilter, setSourceFilter] = useState<SourceFilterValue | ''>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortKey, setSortKey] = useState<DataStreamSortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [deleteTarget, setDeleteTarget] = useState<IDataStreamItem | null>(
    null
  );
  const [inputValue, setInputValue] = useState('');

  const fetchDataStreams = useCallback(
    async (signal?: AbortSignal): Promise<boolean> => {
      if (!currentOrgId || !deviceId) return false;

      setLoading(true);
      setLoadError(false);

      try {
        const result = await fetchAllPages((paging) =>
          dataStreamsApi.getDataStreamsList(
            { orgId: currentOrgId, deviceId, ...paging },
            signal
          )
        );

        setItems(result.items);

        return true;
      } catch (error) {
        if (axios.isCancel(error)) return false;

        setItems([]);
        setLoadError(true);
        showError(error instanceof Error ? error.message : String(error));

        return false;
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [currentOrgId, deviceId, showError]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchDataStreams(controller.signal);

    return () => controller.abort();
  }, [fetchDataStreams]);

  const sourceOptions = useMemo<SelectOption[]>(() => {
    const types = new Set<DataStreamSourceType>();

    items.forEach((item) => {
      if (item.dataSource?.type) types.add(item.dataSource.type);
    });

    return [
      { label: UNBOUND_SOURCE, value: UNBOUND_SOURCE },
      ...[...types].map((type) => ({ label: type, value: type })),
    ];
  }, [items]);

  useEffect(() => {
    if (sourceFilter && !sourceOptions.some((o) => o.value === sourceFilter)) {
      setSourceFilter('');
    }
  }, [sourceFilter, sourceOptions]);

  const filteredRows = useMemo(() => {
    const keyword = searchWord.trim().toLowerCase();

    return items.filter((item) => {
      const matchSearch =
        !keyword ||
        (item.displayName ?? '').toLowerCase().includes(keyword) ||
        (item.dataStreamName ?? '').toLowerCase().includes(keyword);
      const matchDataType = !dataTypeFilter || item.dataType === dataTypeFilter;

      const matchSource =
        !sourceFilter ||
        (sourceFilter === UNBOUND_SOURCE
          ? !item.dataSource?.type
          : item.dataSource?.type === sourceFilter);

      return matchSearch && matchDataType && matchSource;
    });
  }, [items, searchWord, dataTypeFilter, sourceFilter]);

  const sortedRows = useMemo(() => {
    if (!sortKey) return filteredRows;

    const direction = sortOrder === 'asc' ? 1 : -1;
    const nameOf = (item: IDataStreamItem) =>
      item.displayName || item.dataStreamName || '';

    return [...filteredRows].sort(
      (a, b) =>
        direction *
        nameOf(a).localeCompare(nameOf(b), undefined, {
          numeric: true,
          sensitivity: 'base',
        })
    );
  }, [filteredRows, sortKey, sortOrder]);

  const pagedRows = useMemo(
    () => sortedRows.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
    [sortedRows, page, rowsPerPage]
  );

  useEffect(() => {
    if (page > 0 && page * rowsPerPage >= filteredRows.length) {
      setPage(Math.max(0, Math.ceil(filteredRows.length / rowsPerPage) - 1));
    }
  }, [filteredRows.length, page, rowsPerPage]);

  const hasFilter = Boolean(searchWord || dataTypeFilter || sourceFilter);

  const handleSearchChange = (value: string) => {
    setSearchWord(value);
    setPage(0);
  };

  const handleDataTypeFilterChange = (value: DataStreamDataType | '') => {
    setDataTypeFilter(value);
    setPage(0);
  };

  const handleSourceFilterChange = (value: SourceFilterValue | '') => {
    setSourceFilter(value);
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchWord('');
    setDataTypeFilter('');
    setSourceFilter('');
    setPage(0);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setPage(0);
  };

  const handleSort = (key: DataStreamSortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
    setPage(0);
  };

  const handleRetry = () => {
    void fetchDataStreams();
  };

  const handleRefresh = async () => {
    if (await fetchDataStreams()) {
      showSuccess('DataStreams list refreshed');
    }
  };

  const handleAdd = () => {
    if (!hasPermission || !deviceId) return;
    navigate(`/devices/${deviceId}/data-streams/add`);
  };

  const handleEdit = (row: IDataStreamItem) => {
    if (!getDataStreamActions(row, hasPermission).edit.enabled || !deviceId)
      return;
    navigate(`/devices/${deviceId}/data-streams/${row.dataStreamId}/edit`);
  };

  const {
    targetName: deleteTargetName,
    confirmName: deleteConfirmName,
    canConfirm: canConfirmDelete,
  } = getDeleteConfirmation(deleteTarget, inputValue);

  const handleOpenDelete = (row: IDataStreamItem) => {
    if (!getDataStreamActions(row, hasPermission).delete.enabled) return;
    setDeleteTarget(row);
  };

  const handleCloseDelete = () => {
    setDeleteTarget(null);
    setInputValue('');
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !currentOrgId || !deviceId || !canConfirmDelete)
      return;

    try {
      await dataStreamsApi.deleteDataStream({
        orgId: currentOrgId,
        deviceId,
        dataStreamId: deleteTarget.dataStreamId,
      });

      showSuccess('DataStream deleted successfully');
      fetchDataStreams();
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Delete DataStream failed'
      );
    } finally {
      handleCloseDelete();
    }
  };

  return {
    hasPermission,
    loading,
    hasError: loadError,
    pagedRows,
    visibleTotalCount: filteredRows.length,
    hasFilter,
    searchWord,
    dataTypeFilter,
    sourceFilter,
    sourceOptions,
    page,
    rowsPerPage,
    sortKey,
    sortOrder,
    deleteTarget,
    inputValue,
    deleteTargetName,
    deleteConfirmName,
    canConfirmDelete,
    setPage,
    setInputValue,
    handleSearchChange,
    handleDataTypeFilterChange,
    handleSourceFilterChange,
    handleClearFilters,
    handleRowsPerPageChange,
    handleSort,
    handleRefresh,
    handleRetry,
    handleAdd,
    handleEdit,
    handleOpenDelete,
    handleCloseDelete,
    handleConfirmDelete,
  };
}
