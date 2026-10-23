import { useDeviceStore } from '@features/devices';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  type DeploymentStatusGroup,
  type EditionDeploymentDeviceRow,
  getDeploymentStatusGroup,
} from '../domain/types';
import { useAIModelsStore } from '../store/useAIModelsStore';

export const DEPLOYMENTS_REFRESH_INTERVAL = 5000; // 5 seconds

export function useEditionDeploymentsTab() {
  const navigate = useAppNavigate();
  const { modelId, edition } = useParams<{
    tenant: string;
    modelId: string;
    edition: string;
  }>();
  const decodedEdition = edition ? decodeURIComponent(edition) : undefined;

  const [selectedDevice, setSelectedDevice] = useState<{
    deviceId: string;
    deviceName: string;
  } | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const [searchWord, setSearchWord] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<DeploymentStatusGroup | ''>(
    ''
  );

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [fetchedKey, setFetchedKey] = useState<string | null>(null);

  const currentKey = `${modelId ?? ''}-${decodedEdition ?? ''}`;
  const isEditionMismatch = fetchedKey !== currentKey;

  const hasPermission = useManagementPermission().canManageAiModels;
  const canDelete =
    inputValue.trim() === (selectedDevice?.deviceName ?? '').trim();

  const { showError, showSuccess } = useNotification();
  const { currentOrgId } = useOrgContentStore();

  const loading = useAIModelsStore((s) => s.loading);

  const aiModelEditionDeploymentsList = useAIModelsStore(
    (s) => s.aiModelEditionDeploymentsList
  );
  const editionDeploymentItems = useMemo(
    () =>
      isEditionMismatch ? [] : (aiModelEditionDeploymentsList?.items ?? []),
    [aiModelEditionDeploymentsList, isEditionMismatch]
  );

  const deviceItems = useDeviceStore((s) => s.deviceItems);

  const GET_AI_MODEL_EDITION_DEPLOYMENTS = useAIModelsStore(
    (s) => s.GET_AI_MODEL_EDITION_DEPLOYMENTS
  );
  const GET_ALL_DEVICES = useDeviceStore((s) => s.GET_ALL_DEVICES);
  const POST_AI_MODEL_DEPLOYMENT = useAIModelsStore(
    (s) => s.POST_AI_MODEL_DEPLOYMENT
  );
  const DELETE_AI_MODEL_FROM_DEVICE = useAIModelsStore(
    (s) => s.DELETE_AI_MODEL_FROM_DEVICE
  );

  const fetchDeployments = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      if (!currentOrgId) {
        showError('No Org Id');
        return;
      }

      if (!modelId || !decodedEdition) return;

      try {
        await GET_ALL_DEVICES({ orgId: currentOrgId }, signal);
      } catch (error) {
        if (axios.isCancel(error)) return;

        throw error;
      }

      try {
        await GET_AI_MODEL_EDITION_DEPLOYMENTS(
          {
            orgId: currentOrgId,
            modelId,
            edition: decodedEdition,
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
          setHasFetchedOnce(true);
          setLastUpdated(new Date());
          setFetchedKey(`${modelId}-${decodedEdition}`);
        }
      }
    },
    [
      currentOrgId,
      modelId,
      decodedEdition,
      page,
      rowsPerPage,
      GET_AI_MODEL_EDITION_DEPLOYMENTS,
      GET_ALL_DEVICES,
      showError,
    ]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchDeployments(controller.signal);

    return () => controller.abort();
  }, [fetchDeployments]);

  useEffect(() => {
    const controller = new AbortController();

    const intervalId = setInterval(() => {
      fetchDeployments(controller.signal);
    }, DEPLOYMENTS_REFRESH_INTERVAL);

    return () => {
      clearInterval(intervalId);
      controller.abort();
    };
  }, [fetchDeployments]);

  const rows = useMemo<EditionDeploymentDeviceRow[]>(() => {
    if (editionDeploymentItems.length === 0) return [];

    return editionDeploymentItems
      .filter((item) => item.deviceId)
      .filter((item) => {
        const deviceName =
          deviceItems.find((device) => device.deviceId === item.deviceId)
            ?.deviceName ?? '';

        const matchSearchWord =
          !searchWord ||
          deviceName.toLowerCase().includes(searchWord.toLowerCase());

        const matchStatusFilter =
          !statusFilter ||
          getDeploymentStatusGroup(item.state) === statusFilter;

        return matchSearchWord && matchStatusFilter;
      })
      .map((item) => ({
        id: item.deviceDeploymentId,
        deviceId: item.deviceId ?? '-',
        deviceName:
          deviceItems.find((device) => device.deviceId === item.deviceId)
            ?.deviceName ?? '-',
        state: item.state,
        statusGroup: getDeploymentStatusGroup(item.state),
        dateModified: item.updatedAt ?? item.lastTransitionTime,
        dateCreated: item.createdAt,
        rejectedReason: item.rejectedReason,
      }));
  }, [editionDeploymentItems, deviceItems, searchWord, statusFilter]);

  const pagedRows = rows;

  const hasFilter = Boolean(searchWord || statusFilter);

  const visibleTotalCount = hasFilter
    ? rows.length
    : (aiModelEditionDeploymentsList?.totalCount ?? 0);

  const statusCounts = useMemo<
    Partial<Record<DeploymentStatusGroup, number>>
  >(() => {
    const counts: Partial<Record<DeploymentStatusGroup, number>> = {};

    editionDeploymentItems.forEach((item) => {
      const group = getDeploymentStatusGroup(item.state);

      counts[group] = (counts[group] ?? 0) + 1;
    });

    return counts;
  }, [editionDeploymentItems]);

  const handleRefresh = async () => {
    try {
      await fetchDeployments();

      showSuccess('Deployment list refreshed');

      setPage(0);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Refresh deployment list failed';

      showError(message);
    }
  };

  const handleAdd = () => {
    if (!hasPermission || !modelId || !decodedEdition) return;

    navigate(
      `/ai-models/${modelId}/editions/${encodeURIComponent(decodedEdition)}/deploy`
    );
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
    setSelectedDevice(null);
    setInputValue('');
  };

  const handleOpenDelete = (row: EditionDeploymentDeviceRow) => {
    setSelectedDevice({ deviceId: row.deviceId, deviceName: row.deviceName });
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (
      !selectedDevice ||
      !hasPermission ||
      !currentOrgId ||
      !modelId ||
      !decodedEdition ||
      !canDelete
    )
      return;

    try {
      await DELETE_AI_MODEL_FROM_DEVICE({
        deviceId: selectedDevice.deviceId,
        modelId,
        edition: decodedEdition,
      });

      showSuccess('Deployment deleted successfully');

      fetchDeployments();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Delete deployment failed';

      showError(message);
      console.error('[Delete deployment] failed:', message);
    } finally {
      handleClose();
    }
  };

  const handleRetry = async (deviceId: string) => {
    if (!hasPermission || !currentOrgId || !modelId || !decodedEdition) return;

    try {
      await POST_AI_MODEL_DEPLOYMENT({
        orgId: currentOrgId,
        modelId,
        edition: decodedEdition,
        targets: [{ deviceIdList: [deviceId] }],
      });

      showSuccess('Deployment retried successfully');

      fetchDeployments();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Retry deployment failed';

      showError(message);
      console.error('[Retry deployment] failed:', message);
    }
  };

  return {
    hasPermission,
    lastUpdated,
    pagedRows,
    statusCounts,
    statusFilter,
    searchWord,
    page,
    rowsPerPage,
    visibleTotalCount,
    tableLoading: (loading && !hasFetchedOnce) || isEditionMismatch,
    hasFilter,
    deleteOpen,
    selectedDeviceName: selectedDevice?.deviceName,
    inputValue,
    canDelete,
    setPage,
    setRowsPerPage,
    setInputValue,
    handleSearchChange,
    handleStatusFilterChange,
    handleClearFilters,
    handleRefresh,
    handleAdd,
    handleClose,
    handleOpenDelete,
    handleConfirmDelete,
    handleRetry,
  };
}
