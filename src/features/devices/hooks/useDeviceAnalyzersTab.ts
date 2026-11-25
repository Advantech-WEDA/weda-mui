import {
  analyzersApi,
  type AnalyzerSortKey,
  type AnalyzerType,
  getAnalyzerActions,
  type IAnalyzerItem,
} from '@features/analyzers';
import { dataStreamsApi } from '@features/data-streams';
import { getApiErrorMessage } from '@shared/api/ApiError';
import { fetchAllPages } from '@shared/api/fetchAllPages';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { usePageClamp } from '@shared/lib/usePageClamp';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { type SortOrder, useNotification } from '@shared/ui';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const SEARCH_DEBOUNCE_MS = 300;

export function useDeviceAnalyzersTab() {
  const navigate = useAppNavigate();
  const { deviceId } = useParams<{ tenant: string; deviceId: string }>();
  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);
  const hasPermission = useManagementPermission().canManageDevices;
  const { showError, showSuccess } = useNotification();

  const [rows, setRows] = useState<IAnalyzerItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [dataStreamNames, setDataStreamNames] = useState<
    Record<string, string>
  >({});

  const [searchWord, setSearchWord] = useState('');
  const [debouncedSearchWord, setDebouncedSearchWord] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [sortKey, setSortKey] = useState<AnalyzerSortKey>('Name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [deleteTarget, setDeleteTarget] = useState<IAnalyzerItem | null>(null);

  const [toggleTarget, setToggleTarget] = useState<IAnalyzerItem | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchWord(searchWord.trim());
      setPage(0);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchWord]);

  const fetchAnalyzers = useCallback(
    async (signal?: AbortSignal): Promise<boolean> => {
      if (!currentOrgId || !deviceId) return false;

      setLoading(true);
      setLoadError(false);

      try {
        const data = await analyzersApi.getAnalyzersList(
          {
            orgId: currentOrgId,
            deviceId,
            keyword: debouncedSearchWord || undefined,
            sorting: `${sortKey} ${sortOrder}`,
            skipCount: page * rowsPerPage,
            maxResultCount: rowsPerPage,
          },
          signal
        );

        setRows(data.items ?? []);
        setTotalCount(data.totalCount);

        return true;
      } catch (error) {
        if (axios.isCancel(error)) return false;

        setRows([]);
        setTotalCount(0);
        setLoadError(true);
        showError(error instanceof Error ? error.message : String(error));

        return false;
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [
      currentOrgId,
      deviceId,
      debouncedSearchWord,
      page,
      rowsPerPage,
      sortKey,
      sortOrder,
      showError,
    ]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchAnalyzers(controller.signal);

    return () => controller.abort();
  }, [fetchAnalyzers]);

  useEffect(() => {
    if (!currentOrgId || !deviceId) return;

    const controller = new AbortController();

    fetchAllPages((paging) =>
      dataStreamsApi.getDataStreamsList(
        { orgId: currentOrgId, deviceId, ...paging },
        controller.signal
      )
    )
      .then((result) => {
        setDataStreamNames(
          Object.fromEntries(
            result.items.map((s) => [
              s.dataStreamId,
              s.displayName || s.dataStreamName || s.dataStreamId,
            ])
          )
        );
      })
      .catch((error) => {
        if (axios.isCancel(error)) return;

        console.error('[Analyzers tab] data stream lookup failed:', error);
      });

    return () => controller.abort();
  }, [currentOrgId, deviceId]);

  const isResolvingPage = usePageClamp({
    page,
    setPage,
    rowsPerPage,
    totalCount,
    itemCount: rows.length,
    loading,
  });

  const hasFilter = Boolean(debouncedSearchWord);

  const handleSearchChange = (value: string) => {
    setSearchWord(value);
  };

  const handleClearFilters = () => {
    setSearchWord('');
    setDebouncedSearchWord('');
    setPage(0);
  };

  const handleSort = (key: AnalyzerSortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }

    setPage(0);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setPage(0);
  };

  const handleRefresh = async () => {
    if (await fetchAnalyzers()) {
      showSuccess('Analyzers list refreshed');
    }
  };

  const handleRetry = () => {
    void fetchAnalyzers();
  };

  const handleAdd = (type: AnalyzerType) => {
    if (!hasPermission || !deviceId) return;

    navigate(`/devices/${deviceId}/analyzers/add?type=${type}`);
  };

  const handleEdit = (row: IAnalyzerItem) => {
    if (!getAnalyzerActions(row, hasPermission).edit.enabled || !deviceId)
      return;
    navigate(`/devices/${deviceId}/analyzers/${row.analyzerId}/edit`);
  };

  const handleToggleEnabled = (row: IAnalyzerItem) => {
    if (!hasPermission || togglingId) return;

    setToggleTarget(row);
  };

  const handleCloseToggleDialog = () => setToggleTarget(null);

  const handleConfirmToggle = async () => {
    if (!toggleTarget || !hasPermission || !currentOrgId || !deviceId) return;

    const row = toggleTarget;
    const action = row.isEnabled ? 'disable' : 'enable';
    const name = row.name || row.analyzerId;

    setToggleTarget(null);
    setTogglingId(row.analyzerId);

    try {
      await analyzersApi.postAnalyzerAction({
        orgId: currentOrgId,
        deviceId,
        analyzerId: row.analyzerId,
        action,
      });

      showSuccess(`Analyzer "${name}" ${action}d.`);

      await fetchAnalyzers();
    } catch (error) {
      showError(getApiErrorMessage(error, 'Failed to change status'));
    } finally {
      setTogglingId(null);
    }
  };

  const toggleDialogContent = toggleTarget?.isEnabled
    ? {
        title: 'Disable Analyzer',
        content: `Are you sure you want to disable analyzer "${toggleTarget.name ?? ''}"?`,
        confirmLabel: 'Disable',
      }
    : {
        title: 'Enable Analyzer',
        content: `Are you sure you want to enable analyzer "${toggleTarget?.name ?? ''}"?`,
        confirmLabel: 'Enable',
      };

  const deleteTargetName = deleteTarget?.name ?? '';
  const canConfirmDelete =
    Boolean(deleteTargetName.trim()) &&
    inputValue.trim() === deleteTargetName.trim();

  const handleOpenDelete = (row: IAnalyzerItem) => {
    if (!getAnalyzerActions(row, hasPermission).delete.enabled) return;
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
      await analyzersApi.deleteAnalyzer({
        orgId: currentOrgId,
        deviceId,
        analyzerId: deleteTarget.analyzerId,
      });

      showSuccess('Analyzer deleted successfully');
      fetchAnalyzers();
    } catch (error) {
      showError(getApiErrorMessage(error, 'Delete analyzer failed'));
    } finally {
      handleCloseDelete();
    }
  };

  return {
    hasPermission,
    loading: loading || isResolvingPage,
    hasError: loadError,
    rows,
    totalCount,
    dataStreamNames,
    hasFilter,
    searchWord,
    page,
    rowsPerPage,
    sortKey,
    sortOrder,
    deleteTarget,
    inputValue,
    deleteTargetName,
    canConfirmDelete,
    setPage,
    setInputValue,
    handleSearchChange,
    handleClearFilters,
    handleSort,
    handleRowsPerPageChange,
    handleRefresh,
    handleRetry,
    handleAdd,
    handleEdit,
    togglingId,
    toggleDialogOpen: Boolean(toggleTarget),
    toggleDialogContent,
    handleToggleEnabled,
    handleCloseToggleDialog,
    handleConfirmToggle,
    handleOpenDelete,
    handleCloseDelete,
    handleConfirmDelete,
  };
}
