import {
  type IGetAiModelDeviceDeploymentsParams,
  useAIModelsStore,
} from '@features/ai-models';
import {
  type IGetListStacksInDeviceParams,
  useDeploymentsStore,
} from '@features/container-stacks';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import {
  useHasManagementPermission,
  useManagementPermission,
} from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import type {
  IDataStreamsLatestResponse,
  IDeviceCapabilityItem,
  IDeviceItem,
} from '../api/devices.api.types';
import {
  buildActivationSuccessMsg,
  buildStatusDialogContent,
  canChangeActivation,
  getActivationAction,
  isDeviceOperational,
  isWedaNode,
  supportsTelemetryConfig,
} from '../domain/devicePolicy';
import { useDeviceStore } from '../store/useDeviceStore';

const TAB_PATH_TO_VALUE: Record<string, string> = {
  overview: 'Overview',
  information: 'Information',
  telemetry: 'Telemetry',
  'container-stacks': 'ContainerStacks',
  'ai-models': 'AiModels',
};

const TAB_VALUE_TO_PATH: Record<string, string> = {
  Overview: 'overview',
  Information: 'information',
  Telemetry: 'telemetry',
  ContainerStacks: 'container-stacks',
  AiModels: 'ai-models',
};

export function useDeviceDetailPage() {
  const navigate = useAppNavigate();
  const { deviceId, tab: tabParam } = useParams<{
    deviceId: string;
    tenant: string;
    tab: string;
  }>();

  const tab = (tabParam && TAB_PATH_TO_VALUE[tabParam]) || 'Overview';

  const [statusOpen, setStatusOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const { currentOrgId } = useOrgContentStore();
  const [deploymentsRowsPerPage, setDeploymentsRowsPerPage] = useState(20);
  const [aiModelsRowsPerPage, setAiModelsRowsPerPage] = useState(20);
  const hasPermission = useHasManagementPermission();
  const hasDeletePermission = useManagementPermission().canDeleteDevices;
  const { showError, showSuccess } = useNotification();

  const POST_DEVICE_STATUS = useDeviceStore((s) => s.POST_DEVICE_STATUS);
  const DELETE_DEVICES = useDeviceStore((s) => s.DELETE_DEVICES);

  const deviceItems = useDeviceStore((s) => s.deviceItems);
  const GET_ALL_DEVICES = useDeviceStore((s) => s.GET_ALL_DEVICES);

  const currentDevice = useMemo(
    () => deviceItems.find((f) => f.deviceId === deviceId),
    [deviceItems, deviceId]
  );

  const canDelete =
    inputValue.trim() === (currentDevice?.deviceName ?? '').trim();

  const statusDialogContent = buildStatusDialogContent(
    currentDevice ?? null,
    'detail'
  );

  const [devicesReady, setDevicesReady] = useState(false);

  const isTabDisabled =
    !devicesReady || !isDeviceOperational(currentDevice?.status);

  const isNodeTabDisabled =
    isTabDisabled || !currentDevice || !isWedaNode(currentDevice);
  const isTelemetryTabDisabled =
    isTabDisabled || !currentDevice || !supportsTelemetryConfig(currentDevice);

  const [deviceLatestData, setDeviceLatestData] =
    useState<IDataStreamsLatestResponse | null>(null);
  const [capabilityItems, setCapabilityItems] =
    useState<IDeviceCapabilityItem | null>(null);

  const GET_DEVICE_LATEST_DATA = useDeviceStore(
    (s) => s.GET_DEVICE_LATEST_DATA
  );
  const GET_DEVICE_CAPABILITIES = useDeviceStore(
    (s) => s.GET_DEVICE_CAPABILITIES
  );
  const GET_LIST_STACKS_IN_DEVICE = useDeploymentsStore(
    (s) => s.GET_LIST_STACKS_IN_DEVICE
  );
  const GET_DEVICE_AI_MODELS = useAIModelsStore((s) => s.GET_DEVICE_AI_MODELS);
  const GET_DEVICE_TELEMETRY_TABLE = useDeviceStore(
    (s) => s.GET_DEVICE_TELEMETRY_TABLE
  );

  const latestLoading = useDeviceStore((s) => s.latestLoading);
  const deploymentItems = useDeploymentsStore((s) => s.deploymentItems);
  const rawDeploymentLoading = useDeploymentsStore((s) => s.loading);
  const deploymentLoading = !devicesReady || rawDeploymentLoading;
  const deploymentTotalCount = useDeploymentsStore((s) => s.totalCount);
  const telemetryTableLoading = useDeviceStore((s) => s.telemetryTableLoading);
  const aiModelDeviceDeploymentsList = useAIModelsStore(
    (s) => s.aiModelDeviceDeploymentsList
  );
  const aiModelsLoading = useAIModelsStore((s) => s.loading);

  const fetchDeployments = useCallback(
    (
      params: Omit<IGetListStacksInDeviceParams, 'deviceId'>,
      signal?: AbortSignal
    ) => {
      if (!deviceId) return Promise.reject(new Error('No Device ID'));

      return GET_LIST_STACKS_IN_DEVICE({ deviceId, ...params }, signal);
    },
    [deviceId, GET_LIST_STACKS_IN_DEVICE]
  );

  const fetchTelemetryTable = useCallback(
    (latestData?: IDataStreamsLatestResponse) => {
      if (!deviceId) return Promise.reject(new Error('No Device ID'));

      return GET_DEVICE_TELEMETRY_TABLE(deviceId, latestData);
    },
    [deviceId, GET_DEVICE_TELEMETRY_TABLE]
  );

  const fetchDeviceAiModels = useCallback(
    (
      params: Omit<IGetAiModelDeviceDeploymentsParams, 'deviceId'>,
      signal?: AbortSignal
    ) => {
      if (!deviceId) return Promise.reject(new Error('No Device ID'));

      return GET_DEVICE_AI_MODELS({ deviceId, ...params }, signal);
    },
    [deviceId, GET_DEVICE_AI_MODELS]
  );

  useEffect(() => {
    let ignore = false;

    const fetchLatestDataByDeviceId = async () => {
      if (!deviceId) return;

      try {
        const result = await GET_DEVICE_LATEST_DATA({ deviceId });

        if (ignore) return;

        setDeviceLatestData(result);

        if (!isTelemetryTabDisabled) {
          fetchTelemetryTable(result).catch((error) => {
            console.error('[GET_DEVICE_TELEMETRY_TABLE] failed:', error);
          });
        }
      } catch (error) {
        if (ignore) return;

        console.error('[Device latest data] Fetch failed:', error);
        setDeviceLatestData(null);
      }
    };

    fetchLatestDataByDeviceId();

    return () => {
      ignore = true;
    };
  }, [
    GET_DEVICE_LATEST_DATA,
    deviceId,
    fetchTelemetryTable,
    isTelemetryTabDisabled,
  ]);

  useEffect(() => {
    if (isTelemetryTabDisabled) return;

    let ignore = false;

    const fetchCapabilities = async () => {
      if (!deviceId) return;

      try {
        const result = await GET_DEVICE_CAPABILITIES(deviceId);

        if (ignore) return;

        setCapabilityItems(result);
      } catch (error) {
        if (ignore) return;

        console.error('[Device capability] Fetch failed:', error);
        setCapabilityItems(null);
      }
    };

    fetchCapabilities();

    return () => {
      ignore = true;
    };
  }, [GET_DEVICE_CAPABILITIES, deviceId, isTelemetryTabDisabled]);

  useEffect(() => {
    if (isNodeTabDisabled) return;

    const controller = new AbortController();

    fetchDeployments(
      {
        skipCount: 0,
        maxResultCount: deploymentsRowsPerPage,
        sorting: 'createdAt asc',
      },
      controller.signal
    ).catch((error) => {
      if (axios.isCancel(error)) return;

      console.error('[GET_LIST_STACKS_IN_DEVICE] failed:', error);
    });

    return () => controller.abort();
  }, [deviceId, fetchDeployments, isNodeTabDisabled, deploymentsRowsPerPage]);

  useEffect(() => {
    if (isNodeTabDisabled) return;

    const controller = new AbortController();

    fetchDeviceAiModels(
      {
        skipCount: 0,
        maxResultCount: aiModelsRowsPerPage,
      },
      controller.signal
    ).catch((error) => {
      if (axios.isCancel(error)) return;

      console.error('[GET_DEVICE_AI_MODELS] failed:', error);
    });

    return () => controller.abort();
  }, [fetchDeviceAiModels, isNodeTabDisabled, aiModelsRowsPerPage]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchDevices = async () => {
      setDevicesReady(false);

      try {
        await GET_ALL_DEVICES({ orgId: currentOrgId }, controller.signal);
      } catch (error) {
        if (axios.isCancel(error)) return;

        console.error('[GET_ALL_DEVICES] failed:', error);
      } finally {
        if (!controller.signal.aborted) {
          setDevicesReady(true);
        }
      }
    };

    fetchDevices();

    return () => controller.abort();
  }, [currentOrgId, GET_ALL_DEVICES]);

  const handleEdit = useCallback(
    (device: IDeviceItem | undefined) => {
      if (!hasPermission) return;
      if (!device?.deviceId) return;
      navigate(`/devices/${device.deviceId}/edit`, {
        state: {
          device,
        },
      });
    },
    [navigate, hasPermission]
  );

  const handleChangeTab = (value: string) => {
    if (!deviceId) return;

    navigate(`/devices/${deviceId}/${TAB_VALUE_TO_PATH[value] ?? 'overview'}`);
  };

  const handleStatusConfirmOpen = () => {
    setStatusOpen(true);
  };

  const handleDeleteConfirmOpen = () => {
    setDeleteOpen(true);
  };

  const handleCloseDialog = () => {
    setStatusOpen(false);
    setDeleteOpen(false);
  };

  const handleActivationStatus = async () => {
    if (!deviceId || !hasPermission) return;

    const status = getActivationAction(currentDevice?.status);

    try {
      await POST_DEVICE_STATUS({
        deviceId,
        status,
      });
      handleCloseDialog();

      showSuccess(buildActivationSuccessMsg(status));

      navigate('/devices');
    } catch (error) {
      handleCloseDialog();
      showError(
        error instanceof Error ? error.message : 'Update device status failed'
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!deviceId || !hasDeletePermission || !currentOrgId) return;

    try {
      await DELETE_DEVICES({
        deviceId: deviceId,
      });

      showSuccess('Device deleted successfully');
      handleCloseDialog();
      navigate('/devices');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Delete device failed';
      showError(message);
      console.error('[Delete device] failed:', message);
    }
  };

  return {
    tab,
    statusOpen,
    deleteOpen,
    inputValue,
    setInputValue,
    hasPermission,
    hasDeletePermission,
    currentDevice,
    canDelete,
    statusDialogContent,

    canChangeActivation: canChangeActivation(currentDevice?.status),
    isNodeTabDisabled,
    isTelemetryTabDisabled,
    deviceLatestData,
    capabilityItems,
    latestLoading,
    deploymentItems,
    deploymentLoading,
    deploymentTotalCount,
    telemetryTableLoading,
    aiModelDeviceDeploymentsList,
    aiModelsLoading,
    deploymentsRowsPerPage,
    setDeploymentsRowsPerPage,
    aiModelsRowsPerPage,
    setAiModelsRowsPerPage,
    fetchDeployments,
    fetchTelemetryTable,
    fetchDeviceAiModels,

    handleChangeTab,
    handleEdit,
    handleStatusConfirmOpen,
    handleDeleteConfirmOpen,
    handleCloseDialog,
    handleActivationStatus,
    handleConfirmDelete,
  };
}
