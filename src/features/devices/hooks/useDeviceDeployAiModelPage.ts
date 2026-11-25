import {
  buildDeploymentTargets,
  DEFAULT_DEPLOY_SETUP,
  type DeploySetup,
  getRunningContainerNames,
  isRestartContainerApply,
  parseEditionChecksum,
  useAIModelsStore,
  validateDeploySetup,
} from '@features/ai-models';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { usePageClamp } from '@shared/lib/usePageClamp';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import type {
  AiModelDeployTableRow,
  DeviceContainerNamesState,
} from '@/features/devices/domain/types';
import { useDeviceStore } from '@/features/devices/store/useDeviceStore';

const getSelectedEdition = (row: AiModelDeployTableRow) =>
  row.editions.find((edition) => edition.edition === row.selectedEdition);

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

  const [pageModelCount, setPageModelCount] = useState(0);

  const POST_AI_MODEL_DEPLOYMENT = useAIModelsStore(
    (s) => s.POST_AI_MODEL_DEPLOYMENT
  );
  const GET_DEVICE_CAPABILITIES = useDeviceStore(
    (s) => s.GET_DEVICE_CAPABILITIES
  );

  const [deploySetup, setDeploySetup] =
    useState<DeploySetup>(DEFAULT_DEPLOY_SETUP);
  const isRestartContainer = isRestartContainerApply(deploySetup.apply);
  const isChecksumVerify = deploySetup.validate === 'CHECKSUM_VERIFY';

  const deploySetupErrors = useMemo(() => {
    const { maxUsagePercent } = validateDeploySetup(deploySetup);
    return maxUsagePercent ? { maxUsagePercent } : {};
  }, [deploySetup]);

  const [containerByModelId, setContainerByModelId] = useState<
    Record<string, string>
  >({});
  const [deviceContainers, setDeviceContainers] =
    useState<DeviceContainerNamesState | null>(null);

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

        const deviceStateByEditionKey = new Map<string, string>();

        [...(deviceModelsResponse.items ?? [])]
          .sort((a, b) =>
            (a.updatedAt ?? a.createdAt).localeCompare(
              b.updatedAt ?? b.createdAt
            )
          )
          .forEach((item) => {
            deviceStateByEditionKey.set(
              `${item.modelId}::${item.edition}`,
              item.state
            );
          });

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
                fileSize: item.file?.fileSize ?? null,
                expectedChecksum: parseEditionChecksum(
                  item.file?.fileHash,
                  item.file?.hashAlg
                ).expectedChecksum,
                deviceState:
                  deviceStateByEditionKey.get(
                    `${model.modelId}::${item.edition}`
                  ) ?? null,
              }))
              .map((option) => ({
                ...option,
                disabled: option.deviceState !== null,
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
        setPageModelCount(modelItems.length);
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

  const containersFetchedRef = useRef(false);

  useEffect(() => {
    if (!isRestartContainer || !deviceId || containersFetchedRef.current) {
      return;
    }

    let ignore = false;
    let settled = false;

    containersFetchedRef.current = true;

    GET_DEVICE_CAPABILITIES(deviceId)
      .then((capabilities) => {
        if (ignore) return;
        settled = true;
        setDeviceContainers({
          status: 'loaded',
          names: getRunningContainerNames(capabilities?.data?.reported),
        });
      })
      .catch(() => {
        if (ignore) return;
        settled = true;
        containersFetchedRef.current = false;
        setDeviceContainers({ status: 'error' });
      });

    return () => {
      ignore = true;

      if (!settled) containersFetchedRef.current = false;
    };
  }, [isRestartContainer, deviceId, GET_DEVICE_CAPABILITIES]);

  const deviceContainersView: DeviceContainerNamesState | null =
    isRestartContainer && !deviceContainers
      ? { status: 'loading' }
      : deviceContainers;

  const handleDeploySetupChange = (patch: Partial<DeploySetup>) => {
    setDeploySetup((prev) => ({ ...prev, ...patch }));

    if (patch.apply && deviceContainers?.status === 'error') {
      setDeviceContainers(null);
    }
  };

  const handleContainerChange = (modelId: string, containerName: string) => {
    setContainerByModelId((prev) => ({ ...prev, [modelId]: containerName }));
  };

  const getRowSetup = useCallback(
    (row: AiModelDeployTableRow): DeploySetup => ({
      ...deploySetup,
      expectedChecksum: getSelectedEdition(row)?.expectedChecksum ?? '',
    }),
    [deploySetup]
  );

  const isRowReady = useCallback(
    (row: AiModelDeployTableRow) =>
      Object.keys(validateDeploySetup(getRowSetup(row))).length === 0 &&
      (!isRestartContainer || Boolean(containerByModelId[row.modelId])),
    [getRowSetup, isRestartContainer, containerByModelId]
  );

  const selectedRows = useMemo(
    () =>
      selectedModelIds
        .map((id) => aiModelTableRows.find((row) => row.modelId === id))
        .filter((row): row is AiModelDeployTableRow => Boolean(row)),
    [selectedModelIds, aiModelTableRows]
  );

  const [submitting, setSubmitting] = useState(false);

  const submittingRef = useRef(false);

  const canSubmit =
    hasPermission &&
    !submitting &&
    selectedRows.length > 0 &&
    selectedRows.every(isRowReady);

  const isResolvingPage = usePageClamp({
    page,
    setPage,
    rowsPerPage,
    totalCount,
    itemCount: pageModelCount,
    loading,
  });

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
  };

  const handleCancel = () => {
    if (submittingRef.current) return;

    handleConfirmCancel();
    navigate(`/devices/${deviceId}/ai-models`);
  };

  const handleSubmitConfirmOpen = () => {
    if (!hasPermission || submittingRef.current) return;

    setSubmitOpen(true);
  };

  const handleSubmit = async () => {
    if (!hasPermission || submittingRef.current) return;

    if (!currentOrgId) {
      showError('Organization is required');
      return;
    }

    if (!deviceId) {
      showError('Device is required');
      return;
    }

    if (selectedRows.length === 0) {
      showError('Please select at least one AI model');
      return;
    }

    if (!selectedRows.every(isRowReady)) {
      showError(
        'Please complete the deploy setup for the selected AI model(s)'
      );
      return;
    }

    const deployPayloads = selectedRows.map((row) => ({
      modelId: row.modelId,
      modelName: row.modelName,
      payload: {
        orgId: currentOrgId,
        modelId: row.modelId,
        edition: row.selectedEdition,
        targets: buildDeploymentTargets(getRowSetup(row), [deviceId], {
          [deviceId]: containerByModelId[row.modelId] ?? '',
        }),
      },
    }));

    const successList: string[] = [];
    const successModelIds: string[] = [];
    const failedList: { modelName: string; message: string }[] = [];

    submittingRef.current = true;
    setSubmitting(true);

    try {
      for (const item of deployPayloads) {
        try {
          await POST_AI_MODEL_DEPLOYMENT(item.payload);

          successList.push(item.modelName);
          successModelIds.push(item.modelId);
        } catch (error) {
          console.error('[DeployDeviceAiModel] Deploy failed:', {
            modelName: item.modelName,
            payload: item.payload,
            error,
          });

          failedList.push({
            modelName: item.modelName,
            message:
              error instanceof Error && error.message
                ? error.message
                : 'Deploy failed',
          });
        }
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }

    if (successList.length > 0) {
      showSuccess(`Deploy successfully: ${successList.join(', ')}`);
    }

    if (failedList.length > 0) {
      failedList.forEach(({ modelName, message }) => {
        showError(`Deploy failed (${modelName}): ${message}`);
      });

      setSelectedModelIds((prev) =>
        prev.filter((id) => !successModelIds.includes(id))
      );
      setSubmitOpen(false);
      return;
    }

    handleConfirmCancel();
    navigate(`/devices/${deviceId}/ai-models`);
  };

  return {
    cancelOpen,
    submitting,
    submitOpen,
    selectedModelIds,
    handleSelectModel,
    handleSelectAll,
    handleSubmit,
    handleCancel,
    handleConfirmCancel,
    handleSubmitConfirmOpen,
    setCancelOpen,
    canSubmit,

    deploySetup,
    deploySetupErrors,
    isRestartContainer,
    isChecksumVerify,
    containerByModelId,
    deviceContainers: deviceContainersView,
    handleDeploySetupChange,
    handleContainerChange,

    pageTitle,
    hasPermission,
    loading: loading || isResolvingPage,
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
