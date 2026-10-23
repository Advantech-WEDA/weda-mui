import {
  type DeploymentStatusGroup,
  getDeploymentStatusGroup,
  type IAiModelDeviceDeploymentsResponse,
  type IGetAiModelDeviceDeploymentsParams,
  useAIModelsStore,
} from '@features/ai-models';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  AI_MODELS_REFRESH_INTERVAL,
  type DeviceAiModelRow,
} from '../domain/types';

interface Input {
  aiModelDeviceDeploymentsList: IAiModelDeviceDeploymentsResponse | null;
  loading: boolean;
  rowsPerPage: number;
  onRowsPerPageChange: (rows: number) => void;
  onFetchDeviceAiModels: (
    params: Omit<IGetAiModelDeviceDeploymentsParams, 'deviceId'>,
    signal?: AbortSignal
  ) => Promise<unknown>;
}

type InitialLoadPhase = 'waiting' | 'loading' | 'done';

const getEditionKey = (modelId: string, edition: string): string =>
  `${modelId}::${edition}`;

export function useDeviceAiModelsTab({
  aiModelDeviceDeploymentsList,
  loading,
  rowsPerPage,
  onRowsPerPageChange: setRowsPerPage,
  onFetchDeviceAiModels,
}: Input) {
  const navigate = useAppNavigate();
  const { deviceId } = useParams<{
    tenant: string;
    deviceId: string;
  }>();

  const hasLoadedThisDevice = useAIModelsStore(
    (s) => deviceId !== undefined && deviceId in s.deviceAiModelsMap
  );
  const [initialLoadPhase, setInitialLoadPhase] = useState<InitialLoadPhase>(
    () => (loading ? 'loading' : hasLoadedThisDevice ? 'done' : 'waiting')
  );
  if (initialLoadPhase === 'waiting' && loading) {
    setInitialLoadPhase('loading');
  } else if (initialLoadPhase === 'loading' && !loading) {
    setInitialLoadPhase('done');
  }

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<DeviceAiModelRow | null>(null);
  const [inputValue, setInputValue] = useState('');

  const [retryOpen, setRetryOpen] = useState(false);
  const [selectedRetryRow, setSelectedRetryRow] =
    useState<DeviceAiModelRow | null>(null);

  const [searchWord, setSearchWord] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<DeploymentStatusGroup | ''>(
    ''
  );

  const [page, setPage] = useState(0);

  const pollTimerRef = useRef<number | null>(null);
  const isPollingRef = useRef(false);

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const hasPermission = useManagementPermission().canManageAiModels;
  const canDelete = inputValue.trim() === (selectedRow?.modelName ?? '').trim();

  const { showError, showSuccess } = useNotification();
  const { currentOrgId } = useOrgContentStore();

  const deviceAiModelItems = useMemo(
    () => aiModelDeviceDeploymentsList?.items ?? [],
    [aiModelDeviceDeploymentsList]
  );

  const POST_AI_MODEL_DEPLOYMENT = useAIModelsStore(
    (s) => s.POST_AI_MODEL_DEPLOYMENT
  );
  const DELETE_AI_MODEL_FROM_DEVICE = useAIModelsStore(
    (s) => s.DELETE_AI_MODEL_FROM_DEVICE
  );
  const GET_AI_MODEL_EDITION = useAIModelsStore((s) => s.GET_AI_MODEL_EDITION);

  const [deletedEditionKeys, setDeletedEditionKeys] = useState<Set<string>>(
    new Set()
  );
  const checkedEditionKeysRef = useRef<Set<string>>(new Set());

  const fetchDeviceAiModels = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      try {
        await onFetchDeviceAiModels(
          {
            skipCount: page * rowsPerPage,
            maxResultCount: rowsPerPage,
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
    [onFetchDeviceAiModels, showError, page, rowsPerPage]
  );

  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    fetchDeviceAiModels();
  }, [fetchDeviceAiModels]);

  useEffect(() => {
    setLastUpdated(new Date());

    const controller = new AbortController();

    pollTimerRef.current = window.setInterval(() => {
      isPollingRef.current = true;
      fetchDeviceAiModels(controller.signal).finally(() => {
        isPollingRef.current = false;
      });
    }, AI_MODELS_REFRESH_INTERVAL);

    return () => {
      if (pollTimerRef.current) {
        window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }

      controller.abort();
    };
  }, [fetchDeviceAiModels]);

  const rows = useMemo<DeviceAiModelRow[]>(() => {
    if (deviceAiModelItems.length === 0) return [];

    return deviceAiModelItems
      .filter((item) => item.modelId && item.edition)
      .filter((item) => {
        const lowerSearchWord = searchWord.toLowerCase();
        const matchSearchWord =
          !searchWord ||
          (item.modelName ?? '').toLowerCase().includes(lowerSearchWord) ||
          (item.edition ?? '').toLowerCase().includes(lowerSearchWord);

        const matchStatusFilter =
          !statusFilter ||
          getDeploymentStatusGroup(item.state) === statusFilter;

        return matchSearchWord && matchStatusFilter;
      })
      .map((item) => ({
        id: item.deviceDeploymentId,
        deviceId: item.deviceId,
        modelId: item.modelId ?? '-',
        modelName: item.modelName ?? '-',
        edition: item.edition ?? '-',
        state: item.state,
        statusGroup: getDeploymentStatusGroup(item.state),
        dateModified: item.updatedAt,
        dateCreated: item.createdAt,
        rejectedReason: item.rejectedReason,
        isDeleted: deletedEditionKeys.has(
          getEditionKey(item.modelId ?? '-', item.edition ?? '-')
        ),
      }));
  }, [deviceAiModelItems, searchWord, statusFilter, deletedEditionKeys]);

  useEffect(() => {
    if (!currentOrgId) return;

    rows.forEach((row) => {
      const key = getEditionKey(row.modelId, row.edition);

      if (checkedEditionKeysRef.current.has(key)) return;
      checkedEditionKeysRef.current.add(key);

      GET_AI_MODEL_EDITION({
        orgId: currentOrgId,
        modelId: row.modelId,
        edition: row.edition,
      }).catch(() => {
        setDeletedEditionKeys((prev) => new Set(prev).add(key));
      });
    });
  }, [rows, currentOrgId, GET_AI_MODEL_EDITION]);

  const pagedRows = rows;

  const hasFilter = Boolean(searchWord || statusFilter);

  const visibleTotalCount = hasFilter
    ? rows.length
    : (aiModelDeviceDeploymentsList?.totalCount ?? 0);

  const statusCounts = useMemo<
    Partial<Record<DeploymentStatusGroup, number>>
  >(() => {
    const counts: Partial<Record<DeploymentStatusGroup, number>> = {};

    deviceAiModelItems.forEach((item) => {
      const group = getDeploymentStatusGroup(item.state);

      counts[group] = (counts[group] ?? 0) + 1;
    });

    return counts;
  }, [deviceAiModelItems]);

  const handleRefresh = async () => {
    await fetchDeviceAiModels();

    showSuccess('AI Models list refreshed');

    setPage(0);
  };

  const handleDeploy = () => {
    if (!hasPermission) return;
    navigate(`/devices/${deviceId}/ai-model/deploy`);
  };

  const handleClearFilters = () => {
    setSearchWord('');
    setStatusFilter('');
  };

  const handleSearchChange = (value: string) => {
    setSearchWord(value);
  };

  const handleStatusFilterChange = (value: DeploymentStatusGroup | '') => {
    setStatusFilter(value);
  };

  const handleClose = () => {
    setDeleteOpen(false);
    setSelectedRow(null);
    setInputValue('');
  };

  const handleOpenDelete = (row: DeviceAiModelRow) => {
    setSelectedRow(row);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRow || !hasPermission || !deviceId || !canDelete) return;

    try {
      await DELETE_AI_MODEL_FROM_DEVICE({
        deviceId,
        modelId: selectedRow.modelId,
        edition: selectedRow.edition,
      });

      showSuccess('AI model deleted from device successfully');

      fetchDeviceAiModels();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Delete AI model from device failed';

      showError(message);
      console.error('[Delete AI model from device] failed:', message);
    } finally {
      handleClose();
    }
  };

  const handleOpenRetry = (row: DeviceAiModelRow) => {
    setSelectedRetryRow(row);
    setRetryOpen(true);
  };

  const handleCloseRetry = () => {
    setRetryOpen(false);
    setSelectedRetryRow(null);
  };

  const handleConfirmRetry = async () => {
    if (!selectedRetryRow || !hasPermission || !currentOrgId || !deviceId)
      return;

    try {
      await POST_AI_MODEL_DEPLOYMENT({
        orgId: currentOrgId,
        modelId: selectedRetryRow.modelId,
        edition: selectedRetryRow.edition,
        targets: [{ deviceIdList: [deviceId] }],
      });

      showSuccess('Deployment retried successfully');

      fetchDeviceAiModels();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Retry deployment failed';

      showError(message);
      console.error('[Retry AI model deployment] failed:', message);
    } finally {
      handleCloseRetry();
    }
  };

  return {
    hasPermission,

    loading: initialLoadPhase !== 'done' || (loading && !isPollingRef.current),
    lastUpdated,
    pagedRows,
    statusCounts,
    statusFilter,
    searchWord,
    page,
    rowsPerPage,
    hasFilter,
    visibleTotalCount,
    deleteOpen,
    retryOpen,
    selectedRow,
    selectedRetryRow,
    inputValue,
    canDelete,
    setPage,
    setRowsPerPage,
    setInputValue,
    handleSearchChange,
    handleStatusFilterChange,
    handleClearFilters,
    handleRefresh,
    handleDeploy,
    handleClose,
    handleOpenDelete,
    handleConfirmDelete,
    handleOpenRetry,
    handleCloseRetry,
    handleConfirmRetry,
  };
}
