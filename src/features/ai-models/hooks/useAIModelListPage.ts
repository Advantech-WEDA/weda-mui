import { fetchAllPages, MAX_PAGE_SIZE } from '@shared/api/fetchAllPages';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import type { SortOrder } from '@shared/ui';
import { useNotification } from '@shared/ui';
import { isAxiosError, isCancel } from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { aiModelsApi } from '@/features/ai-models/api/aiModels.api';
import type {
  AiModelEditionWithDeviceCount,
  AiModelWithEditions,
} from '@/features/ai-models/api/aiModels.api.types';
import {
  type IAiModelEditionListItem,
  type IAiModelItem,
  type UploadStatus,
} from '@/features/ai-models/api/aiModels.api.types';
import {
  STATUS_GROUP_MAP,
  type StatusGroup,
  type TableHeaderSortKey,
} from '@/features/ai-models/domain/types';
import { useAIModelsStore } from '@/features/ai-models/store/useAIModelsStore';
import {
  getEffectiveEditionStatus,
  useEditionStatusStore,
} from '@/features/ai-models/store/useEditionStatusStore';

export function useAIModelListPage() {
  const navigate = useAppNavigate();

  const [searchWord, setSearchWord] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<IAiModelItem | null>(null);
  const [selectedEdition, setSelectedEdition] =
    useState<IAiModelEditionListItem | null>(null);
  const editionDeleteDialogOpen = selectedEdition !== null;
  const [editionInputValue, setEditionInputValue] = useState<string>('');
  const [sortKey, setSortKey] = useState<TableHeaderSortKey>('modelName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [statusFilter, setStatusFilter] = useState<StatusGroup | ''>('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const deleteDialogOpen = selectedItem !== null;
  const [inputValue, setInputValue] = useState<string>('');

  const [editionsByModel, setEditionsByModel] = useState<
    Record<string, AiModelEditionWithDeviceCount[]>
  >({});

  const { currentOrgId } = useOrgContentStore();
  const hasPermission = useManagementPermission().canManageAiModels;

  const { showError, showSuccess } = useNotification();

  const [isFetchingList, setIsFetchingList] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const aiModelItems = useAIModelsStore((s) => s.aiModelItems);

  const [totalCount, setTotalCount] = useState(0);

  const canDelete =
    inputValue.trim() === (selectedItem?.modelName ?? '').trim();
  const canDeleteEdition =
    editionInputValue.trim() === (selectedEdition?.edition ?? '').trim();

  const editionStatusUpdates = useEditionStatusStore((s) => s.statusUpdates);

  const statusCounts = useMemo<Partial<Record<StatusGroup, number>>>(() => {
    const counts: Partial<Record<StatusGroup, number>> = {};

    Object.values(editionsByModel)
      .flat()
      .forEach((edition) => {
        const status = getEffectiveEditionStatus(edition, editionStatusUpdates);

        if (!status) return;

        const group = STATUS_GROUP_MAP[status];
        counts[group] = (counts[group] ?? 0) + 1;
      });

    return counts;
  }, [editionsByModel, editionStatusUpdates]);

  const GET_AI_MODELS = useAIModelsStore((s) => s.GET_AI_MODELS);
  const DELETE_AI_MODEL = useAIModelsStore((s) => s.DELETE_AI_MODEL);
  const GET_ALL_AI_MODEL_EDITION_DEPLOYMENTS = useAIModelsStore(
    (s) => s.GET_ALL_AI_MODEL_EDITION_DEPLOYMENTS
  );
  const DELETE_AI_MODEL_EDITION = useAIModelsStore(
    (s) => s.DELETE_AI_MODEL_EDITION
  );

  const fetchDeployedDeviceCount = useCallback(
    async (
      modelId: string,
      edition: string,
      signal?: AbortSignal
    ): Promise<number> => {
      if (!currentOrgId) return 0;

      try {
        const data = await GET_ALL_AI_MODEL_EDITION_DEPLOYMENTS(
          {
            orgId: currentOrgId,
            modelId,
            state: 'DEPLOYED',
            edition,
          },
          signal
        );

        return data.totalCount ?? 0;
      } catch (error) {
        if (isCancel(error)) throw error;

        console.error(
          `[Get AI model edition deployments] modelId=${modelId} edition=${edition} failed`,
          error
        );

        return 0;
      }
    },
    [currentOrgId, GET_ALL_AI_MODEL_EDITION_DEPLOYMENTS]
  );

  const getUploadStatus = useCallback(
    async (
      modelId: string,
      edition: string,
      uploadId: string | null,
      signal?: AbortSignal
    ): Promise<UploadStatus> => {
      if (!currentOrgId || !uploadId) return 'Pending';

      try {
        const { status } = await aiModelsApi.getAiModelUploadStatus(
          {
            orgId: currentOrgId,
            modelId,
            edition,
            uploadId,
          },
          signal
        );

        return status;
      } catch (error) {
        if (isCancel(error)) throw error;

        if (isAxiosError(error) && error.response?.status === 404) {
          return 'Pending';
        }

        console.error(
          `[Get AI model upload status] modelId=${modelId} edition=${edition} failed`,
          error
        );

        return 'Pending';
      }
    },
    [currentOrgId]
  );

  const fetchEditionUploadId = useCallback(
    async (
      modelId: string,
      edition: string,
      signal?: AbortSignal
    ): Promise<string | null> => {
      if (!currentOrgId) return null;

      try {
        const detail = await aiModelsApi.getAiModelEdition(
          {
            orgId: currentOrgId,
            modelId,
            edition,
          },
          signal
        );

        return detail.uploadId;
      } catch (error) {
        if (isCancel(error)) throw error;

        console.error(
          `[Get AI model edition] modelId=${modelId} edition=${edition} failed`,
          error
        );

        return null;
      }
    },
    [currentOrgId]
  );

  const fetchEditionsForModels = useCallback(
    async (models: IAiModelItem[], signal?: AbortSignal): Promise<void> => {
      if (signal?.aborted) return;

      if (!currentOrgId || models.length === 0) {
        setEditionsByModel({});
        return;
      }

      const entries = await Promise.all(
        models.map(async (model) => {
          try {
            const data = await fetchAllPages(
              (page) =>
                aiModelsApi.getAiModelEditions(
                  {
                    orgId: currentOrgId,
                    modelId: model.modelId,
                    sorting: `edition ${sortOrder}`,
                    ...page,
                  },
                  signal
                ),
              MAX_PAGE_SIZE
            );

            const items = data.items ?? [];

            const editions: AiModelEditionWithDeviceCount[] = await Promise.all(
              items.map(async (edition) => {
                const [deployedDeviceCount, uploadId] = await Promise.all([
                  edition.edition
                    ? fetchDeployedDeviceCount(
                        model.modelId,
                        edition.edition,
                        signal
                      )
                    : 0,
                  edition.status === 'Pending' && edition.edition
                    ? fetchEditionUploadId(
                        model.modelId,
                        edition.edition,
                        signal
                      )
                    : edition.uploadId,
                ]);

                const status =
                  edition.status === 'Pending' && edition.edition
                    ? await getUploadStatus(
                        model.modelId,
                        edition.edition,
                        uploadId,
                        signal
                      )
                    : edition.status;

                return { ...edition, uploadId, status, deployedDeviceCount };
              })
            );

            return [model.modelId, editions] as const;
          } catch (error) {
            if (isCancel(error)) throw error;

            console.error(
              `[Get AI model editions] modelId=${model.modelId} failed`,
              error
            );

            return [model.modelId, []] as const;
          }
        })
      );
      if (signal?.aborted) return;

      setEditionsByModel(Object.fromEntries(entries));
    },
    [
      currentOrgId,
      sortOrder,
      fetchDeployedDeviceCount,
      fetchEditionUploadId,
      getUploadStatus,
    ]
  );

  const fetchAiModelsList = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      if (!currentOrgId) {
        showError('No Org ID');
        return;
      }

      setIsFetchingList(true);

      try {
        const data = await GET_AI_MODELS(
          {
            orgId: currentOrgId,
            skipCount: page * rowsPerPage,
            maxResultCount: rowsPerPage,
            sorting: `${sortKey} ${sortOrder}`,
          },
          signal
        );

        await fetchEditionsForModels(data.items ?? [], signal);

        if (signal?.aborted) return;

        setLoadError(false);
        setTotalCount(data.totalCount);
      } catch (error) {
        if (isCancel(error)) return;

        const message = error instanceof Error ? error.message : String(error);
        setLoadError(true);
        showError(message);
      } finally {
        if (!signal?.aborted) {
          setIsFetchingList(false);
        }
      }
    },
    [
      currentOrgId,
      showError,
      GET_AI_MODELS,
      page,
      rowsPerPage,
      sortKey,
      sortOrder,
      fetchEditionsForModels,
    ]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchAiModelsList(controller.signal);

    return () => controller.abort();
  }, [fetchAiModelsList]);

  const handleRetryFetch = useCallback(() => {
    fetchAiModelsList();
  }, [fetchAiModelsList]);

  const rows = useMemo<AiModelWithEditions[]>(() => {
    const keyword = searchWord.trim().toLowerCase();

    return aiModelItems
      .filter((item) => {
        if (!keyword) return true;

        const modelName = item.modelName?.toLowerCase() ?? '';
        if (modelName.includes(keyword)) return true;

        const editions = editionsByModel[item.modelId] ?? [];
        return editions.some((edition) =>
          (edition.edition ?? '').toLowerCase().includes(keyword)
        );
      })
      .map((item) => {
        const modelName = item.modelName?.toLowerCase() ?? '';
        const modelNameMatchesKeyword = !keyword || modelName.includes(keyword);

        const editions = editionsByModel[item.modelId] ?? [];

        const keywordFilteredEditions = modelNameMatchesKeyword
          ? editions
          : editions.filter((edition) =>
              (edition.edition ?? '').toLowerCase().includes(keyword)
            );

        return {
          ...item,
          editions: statusFilter
            ? keywordFilteredEditions.filter((edition) => {
                const status = getEffectiveEditionStatus(
                  edition,
                  editionStatusUpdates
                );

                return status && STATUS_GROUP_MAP[status] === statusFilter;
              })
            : keywordFilteredEditions,
        };
      })
      .filter((item) => !statusFilter || item.editions.length > 0);
  }, [
    searchWord,
    statusFilter,
    aiModelItems,
    editionsByModel,
    editionStatusUpdates,
  ]);

  const hasFilter = Boolean(searchWord || statusFilter);

  const pagedRows = rows;

  const visibleTotalCount = hasFilter ? rows.length : totalCount;

  const handleClearFilters = () => {
    setSearchWord('');
    setStatusFilter('');
  };

  const handleCloseDialog = () => {
    setSelectedItem(null);
    setInputValue('');
  };

  const handleCloseEditionDialog = () => {
    setSelectedEdition(null);
    setEditionInputValue('');
  };

  const handleAdd = () => {
    if (!hasPermission) return;

    navigate('/ai-models/add');
  };

  const handleDeploy = useCallback(
    (modelId: string, edition: string) => {
      if (!hasPermission) return;

      navigate(
        `/ai-models/${modelId}/editions/${encodeURIComponent(edition)}/deploy`
      );
    },
    [navigate, hasPermission]
  );

  const handleEdit = useCallback(
    (modelId: string) => {
      if (!hasPermission) return;
      navigate(`/ai-models/${modelId}/edit`);
    },
    [navigate, hasPermission]
  );

  const handleEditEdition = useCallback(
    (modelId: string, edition: string) => {
      if (!hasPermission) return;

      navigate(
        `/ai-models/${modelId}/editions/${encodeURIComponent(edition)}/edit`
      );
    },
    [navigate, hasPermission]
  );

  const handleRefresh = async () => {
    try {
      await fetchAiModelsList();

      showSuccess('AI Models list refreshed');

      setPage(0);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Refresh AI Models list failed';

      showError(message);
    }
  };

  const handleStatusCardChange = (value: StatusGroup | '') => {
    setStatusFilter(value);
    setSearchWord('');
  };

  const handleStatusFilterChange = (value: StatusGroup | '') => {
    setStatusFilter(value);
  };

  const handleOpenDelete = (row: IAiModelItem) => {
    setSelectedItem(row);
    setInputValue('');
  };

  const handleOpenDeleteEdition = (edition: IAiModelEditionListItem) => {
    setSelectedEdition(edition);
    setEditionInputValue('');
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem || !hasPermission || !canDelete) return;

    try {
      await DELETE_AI_MODEL({
        orgId: selectedItem.orgId,
        modelId: selectedItem.modelId,
      });

      showSuccess('AI model deleted successfully');

      fetchAiModelsList();

      handleCloseDialog();
    } catch (err: unknown) {
      let message = 'Delete AI model failed';

      if (err instanceof Error) {
        message = err.message;
      }

      showError(message);
      console.error('[Delete AI model] failed:', message);
    } finally {
      handleCloseDialog();
    }
  };

  const handleConfirmDeleteEdition = async () => {
    if (
      !selectedEdition ||
      !selectedEdition.edition ||
      !hasPermission ||
      !canDeleteEdition
    )
      return;

    try {
      await DELETE_AI_MODEL_EDITION({
        orgId: selectedEdition.orgId,
        modelId: selectedEdition.modelId,
        edition: selectedEdition.edition,
      });

      showSuccess('AI model edition deleted successfully');

      fetchAiModelsList();

      handleCloseEditionDialog();
    } catch (err: unknown) {
      let message = 'Delete AI model edition failed';

      if (err instanceof Error) {
        message = err.message;
      }

      showError(message);
      console.error('[Delete AI model edition] failed:', message);
    } finally {
      handleCloseEditionDialog();
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchWord(value);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setPage(0);
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

  return {
    searchWord,
    statusFilter,
    hasFilter,
    selectedItem,
    selectedEdition,
    page,
    rowsPerPage,
    sortKey,
    sortOrder,
    deleteDialogOpen,
    inputValue,
    setInputValue,
    canDelete,
    editionDeleteDialogOpen,
    editionInputValue,
    setEditionInputValue,
    canDeleteEdition,
    hasPermission,
    loading: isFetchingList,
    loadError,
    pagedRows,
    rows,
    visibleTotalCount,
    statusCounts,
    handleClearFilters,
    handleRetryFetch,
    handleStatusCardChange,
    handleStatusFilterChange,
    handleAdd,
    handleDeploy,
    handleEdit,
    handleEditEdition,
    handleRefresh,
    handleOpenDelete,
    handleConfirmDelete,
    handleCloseDialog,
    handleOpenDeleteEdition,
    handleConfirmDeleteEdition,
    handleCloseEditionDialog,
    handleSearchChange,
    handlePageChange,
    handleRowsPerPageChange,
    handleSort,
  };
}
