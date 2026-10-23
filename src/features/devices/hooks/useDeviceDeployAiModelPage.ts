import {
  DEFAULT_AI_MODEL_DEPLOYMENT_TASKS,
  getDeploymentStatusGroup,
  type IAiModelDeploymentTask,
  useAIModelsStore,
} from '@features/ai-models';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { AiModelDeployTableRow } from '@/features/devices/domain/types';
import { useDeviceStore } from '@/features/devices/store/useDeviceStore';
export function useDeviceDeployAiModelPage() {
  const navigate = useAppNavigate();

  const { deviceId } = useParams<{
    deviceId: string;
    tenant: string;
  }>();

  const { currentOrgId } = useOrgContentStore();

  const { showError, showSuccess } = useNotification();
  const hasPermission = useManagementPermission().canManageAiModels;

  const [cancelOpen, setCancelOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);

  const [aiModelTableRows, setAiModelTableRows] = useState<
    AiModelDeployTableRow[]
  >([]);

  const [totalCount, setTotalCount] = useState(0);

  const POST_AI_MODEL_DEPLOYMENT = useAIModelsStore(
    (s) => s.POST_AI_MODEL_DEPLOYMENT
  );

  const [searchWord, setSearchWord] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const deviceItems = useDeviceStore((s) => s.deviceItems);
  const loading = useAIModelsStore((s) => s.loading);
  const GET_ALL_DEVICES = useDeviceStore((s) => s.GET_ALL_DEVICES);
  const GET_AI_MODELS = useAIModelsStore((s) => s.GET_AI_MODELS);
  const GET_ALL_AI_MODEL_EDITIONS = useAIModelsStore(
    (s) => s.GET_ALL_AI_MODEL_EDITIONS
  );
  const GET_ALL_DEVICE_AI_MODELS = useAIModelsStore(
    (s) => s.GET_ALL_DEVICE_AI_MODELS
  );

  const pageTitle = `Deploy AI Model(s) to "${deviceItems.find((f) => f.deviceId === deviceId)?.deviceName ?? deviceId}"`;

  const fetchDevices = useCallback(
    async (signal?: AbortSignal) => {
      if (!currentOrgId) return;

      try {
        await GET_ALL_DEVICES({ orgId: currentOrgId }, signal);
      } catch (error) {
        if (axios.isCancel(error)) return;

        console.error('[GET_ALL_DEVICES] failed:', error);
      }
    },
    [currentOrgId, GET_ALL_DEVICES]
  );

  const fetchAiModelTableRows = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      if (!currentOrgId || !deviceId) {
        showError('No Org ID');
        return;
      }

      try {
        const [modelsResponse, deviceModelsResponse] = await Promise.all([
          GET_AI_MODELS(
            {
              orgId: currentOrgId,
              skipCount: page * rowsPerPage,
              maxResultCount: rowsPerPage,
            },
            signal
          ),
          GET_ALL_DEVICE_AI_MODELS({ deviceId }, signal),
        ]);

        const deployedOrPendingEditionKeys = new Set(
          (deviceModelsResponse.items ?? [])
            .filter((item) => {
              const group = getDeploymentStatusGroup(item.state);

              return group === 'Completed' || group === 'InProgress';
            })
            .map((item) => `${item.modelId}::${item.edition}`)
        );

        const modelItems = modelsResponse.items ?? [];

        const editionsResponses = await Promise.all(
          modelItems.map((model) =>
            GET_ALL_AI_MODEL_EDITIONS(
              {
                orgId: currentOrgId,
                modelId: model.modelId,
                status: 'Uploaded',
              },
              signal
            )
          )
        );

        const newRows = modelItems
          .map((model, index) => {
            const editionItems = editionsResponses[index]?.items ?? [];

            const editions = editionItems
              .filter((item): item is typeof item & { edition: string } =>
                Boolean(item.edition)
              )
              .map((item) => ({
                edition: item.edition,
                fileName: item.file?.fileName ?? null,
                disabled: deployedOrPendingEditionKeys.has(
                  `${model.modelId}::${item.edition}`
                ),
              }));

            if (editions.length === 0) return null;

            const defaultEdition =
              editions.find((edition) => !edition.disabled) ?? editions[0];

            return {
              modelId: model.modelId,
              modelName: model.modelName ?? '-',
              editions,
              selectedEdition: defaultEdition.edition,
            };
          })
          .filter((row): row is AiModelDeployTableRow => row !== null);

        setAiModelTableRows(newRows);
        setTotalCount(modelsResponse.totalCount);
      } catch (error) {
        if (axios.isCancel(error)) return;

        const message = error instanceof Error ? error.message : String(error);

        showError(message);
      }
    },
    [
      currentOrgId,
      deviceId,
      page,
      rowsPerPage,
      GET_AI_MODELS,
      GET_ALL_AI_MODEL_EDITIONS,
      GET_ALL_DEVICE_AI_MODELS,
      showError,
    ]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchDevices(controller.signal);

    (async () => {
      await fetchAiModelTableRows(controller.signal);
    })();

    return () => controller.abort();
  }, [fetchDevices, fetchAiModelTableRows]);

  const rows = useMemo(() => {
    const keyword = searchWord.trim().toLowerCase();

    return (aiModelTableRows ?? []).filter((item) => {
      const modelName = item.modelName?.toLowerCase() ?? '';

      return !keyword || modelName.includes(keyword);
    });
  }, [aiModelTableRows, searchWord]);

  const pagedRows = rows;

  const hasFilter = Boolean(searchWord);

  const visibleTotalCount = hasFilter ? rows.length : totalCount;

  const pageModelIds = useMemo(() => {
    return pagedRows
      .filter((item) => item.editions.some((edition) => !edition.disabled))
      .map((item) => item.modelId);
  }, [pagedRows]);

  const handleClearFilters = () => {
    setSearchWord('');
  };

  const handleSearchChange = (value: string) => {
    setSearchWord(value);
  };

  const handleEditionChange = (modelId: string, edition: string) => {
    setAiModelTableRows((prev) =>
      prev.map((row) =>
        row.modelId === modelId ? { ...row, selectedEdition: edition } : row
      )
    );
  };

  const handleSelectModel = (modelId: string) => {
    setSelectedModelIds((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleSelectAll = (modelIds: string[]) => {
    const isAllSelected = modelIds.every((id) => selectedModelIds.includes(id));

    setSelectedModelIds((prev) =>
      isAllSelected
        ? prev.filter((id) => !modelIds.includes(id))
        : [...new Set([...prev, ...modelIds])]
    );
  };

  const handleConfirmCancel = () => {
    setCancelOpen(false);
    setSubmitOpen(false);
    setAiModelTableRows([]);
    setSelectedModelIds([]);
  };

  const handleCancel = () => {
    handleConfirmCancel();
    navigate(`/devices/${deviceId}/ai-models`);
  };

  const handleSubmitConfirmOpen = () => {
    if (!hasPermission) return;

    setSubmitOpen(true);
  };

  const handleSubmit = async () => {
    if (!hasPermission) return;

    if (!currentOrgId) {
      showError('Organization is required');
      return;
    }

    if (!deviceId) {
      showError('Device is required');
      return;
    }

    if (selectedModelIds.length === 0) {
      showError('Please select at least one AI model');
      return;
    }

    const deployPayloads = selectedModelIds
      .map((selectedId) => {
        const row = aiModelTableRows.find(
          (item) => item.modelId === selectedId
        );

        if (!row) return null;

        return {
          modelName: row.modelName,
          payload: {
            orgId: currentOrgId,
            modelId: row.modelId,
            edition: row.selectedEdition,
            targets: [
              {
                deviceIdList: [deviceId],
                tasks: DEFAULT_AI_MODEL_DEPLOYMENT_TASKS,
              },
            ],
          },
        };
      })
      .filter(
        (
          item
        ): item is {
          modelName: string;
          payload: {
            orgId: string;
            modelId: string;
            edition: string;
            targets: {
              deviceIdList: string[];
              tasks: IAiModelDeploymentTask[];
            }[];
          };
        } => item !== null
      );

    const successList: string[] = [];
    const failedList: string[] = [];

    for (const item of deployPayloads) {
      try {
        await POST_AI_MODEL_DEPLOYMENT(item.payload);

        successList.push(item.modelName);
      } catch (error) {
        console.error('[DeployDeviceAiModel] Deploy failed:', {
          modelName: item.modelName,
          payload: item.payload,
          error,
        });

        failedList.push(item.modelName);
      }
    }

    if (successList.length > 0) {
      showSuccess(`Deploy successfully: ${successList.join(', ')}`);
    }

    if (failedList.length > 0) {
      showError(`Deploy failed: ${failedList.join(', ')}`);
      return;
    }

    handleConfirmCancel();
    navigate(`/devices/${deviceId}/ai-models`);
  };

  return {
    cancelOpen,
    submitOpen,
    selectedModelIds,
    handleSelectModel,
    handleSelectAll,
    handleSubmit,
    handleCancel,
    handleConfirmCancel,
    handleSubmitConfirmOpen,
    setCancelOpen,

    pageTitle,
    hasPermission,
    loading,
    pagedRows,
    pageModelIds,
    searchWord,
    page,
    rowsPerPage,
    visibleTotalCount,
    hasFilter,
    setPage,
    setRowsPerPage,
    handleSearchChange,
    handleClearFilters,
    handleEditionChange,
  };
}
