import { fetchAllPages, MAX_PAGE_SIZE } from '@shared/api/fetchAllPages';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { usePageClamp } from '@shared/lib/usePageClamp';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { type SortOrder, useNotification } from '@shared/ui';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

import { dataStreamBridgesApi } from '@/features/data-stream-bridges/api/dataStreamBridges.api';
import type { IDataStreamBridgeListItem } from '@/features/data-stream-bridges/api/dataStreamBridges.api.types';
import { fillBridgeErrorPlaceholders } from '@/features/data-stream-bridges/api/dataStreamBridges.errors';
import { mergeBridgeDetailIntoListItem } from '@/features/data-stream-bridges/api/dataStreamBridges.mapper';
import { bridgeToggleDialogContent } from '@/features/data-stream-bridges/components/bridgeToggleDialog';
import {
  type BridgeDisplayStatus,
  type TableHeaderSortKey,
  toBridgeDisplayStatus,
} from '@/features/data-stream-bridges/domain/types';

const SEARCH_DEBOUNCE_MS = 300;

export function useDataStreamBridgesPage() {
  const navigate = useAppNavigate();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [sortKey, setSortKey] = useState<TableHeaderSortKey>('Name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [searchWord, setSearchWord] = useState('');
  const [debouncedSearchWord, setDebouncedSearchWord] = useState('');

  const [statusFilter, setStatusFilter] = useState<BridgeDisplayStatus | ''>(
    ''
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [toggleTarget, setToggleTarget] =
    useState<IDataStreamBridgeListItem | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { showError, showSuccess } = useNotification();

  const hasPermission = useManagementPermission().canManageDataStreamBridges;

  const { currentOrgId } = useOrgContentStore();

  const [selectedItem, setSelectedItem] =
    useState<IDataStreamBridgeListItem | null>(null);

  const [rows, setRows] = useState<IDataStreamBridgeListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState<
    Partial<Record<BridgeDisplayStatus, number>>
  >({});
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchWord(searchWord.trim());
      setPage(0);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchWord]);

  const fetchBridges = useCallback(
    async (signal?: AbortSignal): Promise<boolean> => {
      setLoading(true);
      setLoadError(false);

      try {
        const { items: searched } = await fetchAllPages(
          (paging) =>
            dataStreamBridgesApi.getDataStreamBridgesList(
              {
                orgId: currentOrgId,
                filter: debouncedSearchWord || undefined,
                sorting: `${sortKey} ${sortOrder}`,
                ...paging,
              },
              signal
            ),
          MAX_PAGE_SIZE
        );

        const counts: Partial<Record<BridgeDisplayStatus, number>> = {};
        for (const row of searched) {
          const status = toBridgeDisplayStatus(row);
          if (status) counts[status] = (counts[status] ?? 0) + 1;
        }

        const matched = statusFilter
          ? searched.filter(
              (row) => toBridgeDisplayStatus(row) === statusFilter
            )
          : searched;
        const total = matched.length;
        const pageRows = matched.slice(
          page * rowsPerPage,
          (page + 1) * rowsPerPage
        );

        const details = await Promise.allSettled(
          pageRows.map((row) =>
            dataStreamBridgesApi.getDataStreamBridgeById(
              { orgId: currentOrgId, bridgeId: row.bridgeId },
              signal
            )
          )
        );

        if (signal?.aborted) return false;

        setStatusCounts(counts);
        setTotalCount(total);
        setRows(
          pageRows.map((row, index) => {
            const result = details[index];

            return result.status === 'fulfilled'
              ? mergeBridgeDetailIntoListItem(row, result.value)
              : row;
          })
        );

        return true;
      } catch (error) {
        if (axios.isCancel(error)) return false;

        setRows([]);
        setTotalCount(0);
        setStatusCounts({});
        setLoadError(true);
        showError(
          error instanceof Error
            ? error.message
            : 'Failed to load DataStream bridges'
        );
        return false;
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [
      currentOrgId,
      debouncedSearchWord,
      sortKey,
      sortOrder,
      statusFilter,
      page,
      rowsPerPage,
      showError,
    ]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchBridges(controller.signal);

    return () => controller.abort();
  }, [fetchBridges]);

  const isResolvingPage = usePageClamp({
    page,
    setPage,
    rowsPerPage,
    totalCount,
    itemCount: rows.length,
    loading,
  });

  const handleClearFilters = () => {
    setSearchWord('');
    setDebouncedSearchWord('');
    setStatusFilter('');
    setSortKey('Name');
    setSortOrder('asc');
    setPage(0);
  };

  const handleSort = (key: TableHeaderSortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      setPage(0);

      return;
    }

    setSortKey(key);
    setSortOrder('asc');
    setPage(0);
  };

  const handleStatusFilterChange = (value: BridgeDisplayStatus | '') => {
    setStatusFilter(value);
    setPage(0);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedItem(null);
    setInputValue('');
  };

  const handleOpenDeleteDialog = (row: IDataStreamBridgeListItem) => {
    setSelectedItem(row);
    setInputValue('');
    setDeleteDialogOpen(true);
  };

  const canDelete = inputValue.trim() === (selectedItem?.name ?? '').trim();

  const handleConfirmDelete = async () => {
    if (!selectedItem || !hasPermission || !canDelete) return;

    try {
      await dataStreamBridgesApi.deleteDataStreamBridge({
        orgId: currentOrgId,
        bridgeId: selectedItem.bridgeId,
      });

      showSuccess('DataStream bridge deleted successfully');

      await fetchBridges();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Delete DataStream bridge failed';

      showError(message);
      console.error('[Delete DataStream bridge] failed:', message);
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleOpenToggleDialog = (row: IDataStreamBridgeListItem) => {
    if (!hasPermission) return;

    setToggleTarget(row);
  };

  const handleCloseToggleDialog = () => setToggleTarget(null);

  const handleConfirmToggle = async () => {
    if (!toggleTarget || !hasPermission) return;

    const row = toggleTarget;
    const action = row.isEnabled ? 'disable' : 'enable';

    setToggleTarget(null);
    setTogglingId(row.bridgeId);

    try {
      await dataStreamBridgesApi.postDataStreamBridgeAction({
        orgId: currentOrgId,
        bridgeId: row.bridgeId,
        action,
      });

      showSuccess(
        `DataStream bridge [${row.name ?? row.bridgeId}] ${action}d successfully`
      );

      await fetchBridges();
    } catch (err: unknown) {
      showError(
        err instanceof Error
          ? fillBridgeErrorPlaceholders(err.message, row.brokerEndpoint)
          : `Failed to ${action} DataStream bridge`
      );
    } finally {
      setTogglingId(null);
    }
  };

  const toggleDialogContent = bridgeToggleDialogContent(
    toggleTarget?.name ?? '',
    toggleTarget?.isEnabled ?? false
  );

  const handleAdd = () => {
    if (!hasPermission) return;

    navigate('/data-stream-bridges/add');
  };

  const handleEdit = useCallback(
    (bridgeId: string) => {
      if (!hasPermission) return;

      navigate(`/data-stream-bridges/${bridgeId}/edit`);
    },
    [hasPermission, navigate]
  );

  const handleRefresh = async () => {
    const isFetched = await fetchBridges();

    if (!isFetched) return;

    showSuccess('DataStream bridge list refreshed');
    setPage(0);
  };

  const tableSectionProps = {
    rows,
    totalCount,
    page,
    rowsPerPage,
    sortKey,
    sortOrder,
    loading: loading || isResolvingPage,
    hasError: loadError,
    hasFilter: !!debouncedSearchWord || !!statusFilter,
    hasPermission,
    togglingId,
    onSort: handleSort,

    onRetry: () => {
      void fetchBridges();
    },
    onClearAll: handleClearFilters,
    onPageChange: (newPage: number) => setPage(newPage),
    onRowsPerPageChange: (rows: number) => {
      setRowsPerPage(rows);
      setPage(0);
    },
    onToggleEnabled: handleOpenToggleDialog,
    onDelete: handleOpenDeleteDialog,
    onEdit: handleEdit,
    onAdd: handleAdd,
  };

  return {
    hasPermission,
    searchWord,
    setSearchWord,
    statusFilter,
    statusCounts,
    handleStatusFilterChange,
    handleAdd,
    handleClearFilters,
    handleRefresh,
    loading,
    tableSectionProps,

    deleteDialogOpen,
    selectedItem,
    inputValue,
    setInputValue,
    canDelete,
    handleCloseDeleteDialog,
    handleConfirmDelete,

    toggleDialogOpen: !!toggleTarget,
    toggleDialogContent,
    handleCloseToggleDialog,
    handleConfirmToggle,
  };
}
