import {
  isDeviceOperational,
  isWedaNode,
  type Status,
  type TableHeaderSortKey,
  useDeviceStore,
} from '@features/devices';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { type SortOrder, useNotification } from '@shared/ui';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  DEFAULT_AI_MODEL_DEPLOYMENT_TASKS,
  type DeployDeviceRow,
} from '../api/aiModels.api.types';
import { getDeploymentStatusGroup } from '../domain/types';
import { useAIModelsStore } from '../store/useAIModelsStore';

const LATEST_DATA_REFRESH_INTERVAL = 2 * 60 * 1000; // 2 minutes

const getDeployErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  return fallbackMessage;
};

export function useDeployEditionPage() {
  const navigate = useAppNavigate();
  const { modelId, edition } = useParams<{
    tenant: string;
    modelId: string;
    edition: string;
  }>();
  const decodedEdition = edition ? decodeURIComponent(edition) : undefined;

  const { currentOrgId } = useOrgContentStore();

  const { showError, showSuccess } = useNotification();
  const hasPermission = useManagementPermission().canManageAiModels;

  const POST_AI_MODEL_DEPLOYMENT = useAIModelsStore(
    (s) => s.POST_AI_MODEL_DEPLOYMENT
  );

  const [cancelOpen, setCancelOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);

  const [searchWord, setSearchWord] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [sortKey, setSortKey] = useState<TableHeaderSortKey>('deviceId');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const latestTimerRef = useRef<number | null>(null);

  const loading = useDeviceStore((s) => s.loading);
  const totalCount = useDeviceStore((s) => s.totalCount);
  const deviceItems = useDeviceStore((s) => s.deviceItems);
  const deviceLatestMap = useDeviceStore((s) => s.deviceLatestMap);

  const aiModelEditionDeploymentsList = useAIModelsStore(
    (s) => s.aiModelEditionDeploymentsList
  );
  const deviceAiModelsMap = useAIModelsStore((s) => s.deviceAiModelsMap);

  const GET_DEVICES = useDeviceStore((s) => s.GET_DEVICES);
  const GET_DEVICE_LATEST_DATA = useDeviceStore(
    (s) => s.GET_DEVICE_LATEST_DATA
  );
  const GET_ALL_AI_MODEL_EDITION_DEPLOYMENTS = useAIModelsStore(
    (s) => s.GET_ALL_AI_MODEL_EDITION_DEPLOYMENTS
  );
  const GET_ALL_DEVICE_AI_MODELS = useAIModelsStore(
    (s) => s.GET_ALL_DEVICE_AI_MODELS
  );

  const pageTitle = decodedEdition
    ? `Deploy "${decodedEdition}" to Device(s)`
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

  const fetchDeviceAiModelsByDeviceIds = useCallback(
    async (ids: string[], signal?: AbortSignal) => {
      if (!ids.length) return;

      const results = await Promise.allSettled(
        ids.map((deviceId) => GET_ALL_DEVICE_AI_MODELS({ deviceId }, signal))
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
        console.warn('[Device AI models failed]', failedItems);
      }
    },
    [GET_ALL_DEVICE_AI_MODELS]
  );

  const clearLatestPolling = useCallback(() => {
    if (latestTimerRef.current) {
      window.clearInterval(latestTimerRef.current);
      latestTimerRef.current = null;
    }
  }, []);

  const fetchGetDevices = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      if (!currentOrgId || !modelId || !decodedEdition) {
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

        await GET_ALL_AI_MODEL_EDITION_DEPLOYMENTS(
          { orgId: currentOrgId, modelId, edition: decodedEdition },
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
      modelId,
      decodedEdition,
      page,
      rowsPerPage,
      sortKey,
      sortOrder,
      showError,
      GET_DEVICES,
      GET_ALL_AI_MODEL_EDITION_DEPLOYMENTS,
    ]
  );

  const rows = useMemo(() => {
    const keyword = searchWord.trim().toLowerCase();

    return (deviceItems ?? [])
      .map((item) => {
        const latestData = deviceLatestMap[item.deviceId];

        return {
          ...item,
          lastSeen: latestData?.time,
          latestData,
        };
      })
      .filter((item) => {
        const deviceName = item.deviceName?.toLowerCase() ?? '';

        const matchKeyword = !keyword || deviceName.includes(keyword);
        const matchStatus = !statusFilter || item.status === statusFilter;

        return matchKeyword && matchStatus;
      });
  }, [deviceItems, deviceLatestMap, searchWord, statusFilter]);

  const hasFilter = Boolean(searchWord || statusFilter);

  const pagedRows = rows;

  const isDeploymentStatusLoading = aiModelEditionDeploymentsList === null;

  const deploymentStatusByDeviceId = useMemo(() => {
    const items = aiModelEditionDeploymentsList?.items ?? [];
    return new Map(
      items
        .filter((item) => item.deviceId)
        .map((item) => [
          item.deviceId as string,
          getDeploymentStatusGroup(item.state),
        ])
    );
  }, [aiModelEditionDeploymentsList]);

  const displayRows: DeployDeviceRow[] = useMemo(() => {
    return pagedRows.map((device) => {
      const deployedEditions = Array.from(
        new Set(
          (deviceAiModelsMap[device.deviceId] ?? [])
            .filter((item) => item.state === 'DEPLOYED' && item.edition)
            .map((item) => item.edition as string)
        )
      ).join(', ');

      return {
        ...device,
        lastSeen: deviceLatestMap[device.deviceId]?.time ?? null,
        latestData: deviceLatestMap[device.deviceId] ?? null,
        deploymentStatus:
          deploymentStatusByDeviceId.get(device.deviceId) ?? null,
        deployedEditions: deployedEditions || undefined,
      };
    });
  }, [
    pagedRows,
    deviceLatestMap,
    deploymentStatusByDeviceId,
    deviceAiModelsMap,
  ]);

  const deployedOrPendingDeviceIds = useMemo(
    () =>
      new Set(
        Array.from(deploymentStatusByDeviceId.entries())
          .filter(
            ([, group]) => group === 'Completed' || group === 'InProgress'
          )
          .map(([deviceId]) => deviceId)
      ),
    [deploymentStatusByDeviceId]
  );

  const isDeviceDisabled = useCallback(
    (
      device: Pick<
        DeployDeviceRow,
        'deviceId' | 'status' | 'hwModel' | 'parentDeviceId'
      >
    ) => {
      return (
        !isWedaNode(device) ||
        !isDeviceOperational(device.status) ||
        deployedOrPendingDeviceIds.has(device.deviceId)
      );
    },
    [deployedOrPendingDeviceIds]
  );

  const selectableDeviceIds = useMemo(() => {
    return displayRows
      .filter((row) => !isDeviceDisabled(row))
      .map((row) => row.deviceId)
      .filter((deviceId): deviceId is string => Boolean(deviceId));
  }, [displayRows, isDeviceDisabled]);

  const visibleDeviceIds = useMemo(() => {
    return pagedRows
      .map((item) => item.deviceId)
      .filter((deviceId): deviceId is string => Boolean(deviceId));
  }, [pagedRows]);

  const visibleDeviceIdsKey = useMemo(() => {
    return visibleDeviceIds.join(',');
  }, [visibleDeviceIds]);

  const aiModelEligibleDeviceIds = useMemo(() => {
    return pagedRows
      .filter((item) => isWedaNode(item) && isDeviceOperational(item.status))
      .map((item) => item.deviceId)
      .filter((deviceId): deviceId is string => Boolean(deviceId));
  }, [pagedRows]);

  const aiModelEligibleDeviceIdsKey = useMemo(() => {
    return aiModelEligibleDeviceIds.join(',');
  }, [aiModelEligibleDeviceIds]);

  useEffect(() => {
    const controller = new AbortController();

    fetchGetDevices(controller.signal);

    return () => {
      clearLatestPolling();
      controller.abort();
    };
  }, [clearLatestPolling, fetchGetDevices]);

  useEffect(() => {
    clearLatestPolling();

    const ids = visibleDeviceIdsKey ? visibleDeviceIdsKey.split(',') : [];
    const aiModelIds = aiModelEligibleDeviceIdsKey
      ? aiModelEligibleDeviceIdsKey.split(',')
      : [];

    if (!ids.length) return;

    const controller = new AbortController();

    fetchLatestDataByDeviceIds(ids, controller.signal);
    fetchDeviceAiModelsByDeviceIds(aiModelIds, controller.signal);

    latestTimerRef.current = window.setInterval(() => {
      fetchLatestDataByDeviceIds(ids, controller.signal);
      fetchDeviceAiModelsByDeviceIds(aiModelIds, controller.signal);
    }, LATEST_DATA_REFRESH_INTERVAL);

    return () => {
      clearLatestPolling();
      controller.abort();
    };
  }, [
    visibleDeviceIdsKey,
    aiModelEligibleDeviceIdsKey,
    fetchLatestDataByDeviceIds,
    fetchDeviceAiModelsByDeviceIds,
    clearLatestPolling,
  ]);

  const handleClearFilters = () => {
    setSearchWord('');
    setStatusFilter('');
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

  const validateSubmit = useCallback(() => {
    if (!hasPermission) return false;

    if (!currentOrgId) {
      showError('Organization is required');
      return false;
    }

    if (!modelId || !decodedEdition) {
      showError('AI model edition is required');
      return false;
    }

    if (selectedDeviceIds.length === 0) {
      showError('Please select devices');
      return false;
    }

    return true;
  }, [
    hasPermission,
    currentOrgId,
    modelId,
    decodedEdition,
    selectedDeviceIds,
    showError,
  ]);

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

      await POST_AI_MODEL_DEPLOYMENT({
        orgId: currentOrgId!,
        modelId: modelId!,
        edition: decodedEdition!,
        targets: [
          {
            deviceIdList: selectedDeviceIds,
            tasks: DEFAULT_AI_MODEL_DEPLOYMENT_TASKS,
          },
        ],
      });

      closeDialogs();

      showSuccess('Success: Deployment task(s) created.');

      navigate(`/ai-models/${modelId}/editions/${edition}/deployment`);
    } catch (error) {
      const message = getDeployErrorMessage(error, 'Deploy failed');

      showError(message);
      console.error('[DeployEdition] Deploy failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) return;

    closeDialogs();
    navigate(`/ai-models/${modelId}/editions/${edition}/deployment`);
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
    loading: loading || isDeploymentStatusLoading,
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
    visibleTotalCount: hasFilter ? rows.length : totalCount,
    hasFilter,
    setPage,
    setRowsPerPage,
    handleSearchChange,
    handleStatusFilterChange,
    handleSort,
    handleClearFilters,
  };
}
