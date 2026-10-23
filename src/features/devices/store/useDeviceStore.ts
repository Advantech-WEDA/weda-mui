import { extractErrorMessage } from '@shared/api/extractErrorMessage';
import { fetchAllPages, MAX_PAGE_SIZE } from '@shared/api/fetchAllPages';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import axios from 'axios';
import { create } from 'zustand';

import { devicesApi } from '@/features/devices/api/devices.api';
import type {
  IDataStreamsLatestResponse,
  IDeviceCapabilityItem,
  IDeviceItem,
  IDeviceListResponse,
  IDeviceTelemetryConfigResponse,
} from '@/features/devices/api/devices.api.types';
import {
  applyTelemetryRowToConfigs,
  buildTelemetryTableRows,
} from '@/features/devices/api/telemetryTable.mapper';
import type { IDeviceTelemetryTableItem } from '@/features/devices/domain/types';

interface IDeviceState {
  totalCount: number;
  loading: boolean;
  latestLoading: boolean;
  telemetryTableLoading: boolean;
  deviceItems: IDeviceItem[];
  deviceLatestMap: Record<string, IDataStreamsLatestResponse>;

  telemetryTableItems: IDeviceTelemetryTableItem[];
  telemetryConfigs: IDeviceTelemetryConfigResponse[];
  GET_DEVICES: (
    params: {
      orgId: string;
      skipCount?: number;
      maxResultCount?: number;
      sorting?: string;
    },
    signal?: AbortSignal
  ) => Promise<IDeviceListResponse>;

  GET_ALL_DEVICES: (
    params: {
      orgId: string;
      sorting?: string;
    },
    signal?: AbortSignal
  ) => Promise<IDeviceListResponse>;

  GET_DEVICE_LATEST_DATA: (
    params: {
      deviceId: string;
    },
    signal?: AbortSignal
  ) => Promise<IDataStreamsLatestResponse>;

  GET_DEVICES_LATEST_DATA_BATCH: (
    deviceIds: string[],
    signal?: AbortSignal
  ) => Promise<IDataStreamsLatestResponse[]>;

  POST_DEVICE_STATUS: (params: {
    deviceId: string;
    status: string;
  }) => Promise<IDeviceItem>;

  POST_DEVICE: (params: {
    orgId: string;
    deviceData: IDeviceItem;
  }) => Promise<IDeviceItem>;

  PATCH_DEVICE_BY_ID: (params: {
    deviceId: string;
    deviceName: string;
  }) => Promise<IDeviceItem>;

  POST_CREATE_DEVICE: (
    orgId: string,
    deviceId: string,
    hwModel: string
  ) => Promise<void>;

  DELETE_DEVICES: (params: { deviceId: string }) => Promise<void>;

  GET_DEVICE_CAPABILITIES: (
    deviceId: string
  ) => Promise<IDeviceCapabilityItem | null>;

  GET_DEVICE_TELEMETRY_CONFIGS: (
    deviceId: string
  ) => Promise<IDeviceTelemetryConfigResponse[]>;

  GET_DEVICE_TELEMETRY_TABLE: (
    deviceId: string,
    latestData?: IDataStreamsLatestResponse
  ) => Promise<IDeviceTelemetryTableItem[]>;

  UPDATE_LOCAL_TELEMETRY_ROW: (
    key: string,
    updates: Partial<IDeviceTelemetryTableItem>
  ) => void;

  SAVE_DEVICE_TELEMETRY_ROW: (
    deviceId: string,
    row: IDeviceTelemetryTableItem,
    previousRow: IDeviceTelemetryTableItem | null
  ) => Promise<void>;
}

const getErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { detail?: string })?.detail || fallbackMessage
    );
  }

  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  return fallbackMessage;
};

export const useDeviceStore = create<IDeviceState>()((set, get) => ({
  totalCount: 0,
  loading: false,
  latestLoading: false,
  telemetryTableLoading: false,
  deviceItems: [],
  telemetryTableItems: [],
  telemetryConfigs: [],
  deviceLatestMap: {},
  async GET_DEVICES(params, signal): Promise<IDeviceListResponse> {
    try {
      set({ loading: true });

      const data = await devicesApi.getDevices(params, signal);

      set({
        totalCount: data.totalCount,
        deviceItems: data.items,
        loading: false,
      });

      return data;
    } catch (error: unknown) {
      if (axios.isCancel(error)) {
        throw error;
      }

      set({ loading: false });

      const errorMessage = extractErrorMessage(
        error,
        '[Get devices of one organization] Fetch failed'
      );

      return Promise.reject(new Error(errorMessage));
    }
  },

  async GET_ALL_DEVICES(params, signal): Promise<IDeviceListResponse> {
    try {
      set({ loading: true });

      const data = await fetchAllPages(
        (page) => devicesApi.getDevices({ ...params, ...page }, signal),
        MAX_PAGE_SIZE
      );

      set({
        totalCount: data.totalCount,
        deviceItems: data.items,
        loading: false,
      });

      return data;
    } catch (error: unknown) {
      if (axios.isCancel(error)) {
        throw error;
      }

      set({ loading: false });

      const errorMessage = extractErrorMessage(
        error,
        '[Get all devices of one organization] Fetch failed'
      );

      return Promise.reject(new Error(errorMessage));
    }
  },
  async GET_DEVICE_LATEST_DATA(
    params,
    signal
  ): Promise<IDataStreamsLatestResponse> {
    const { currentOrgId } = useOrgContentStore.getState();

    if (!currentOrgId) {
      set({ latestLoading: false });
      return Promise.reject(new Error('No currentOrgId'));
    }

    set({ latestLoading: true });

    try {
      const latestData = await devicesApi.getDeviceLatestData(
        {
          deviceId: params.deviceId,
          orgId: currentOrgId,
        },
        signal
      );

      set((state) => ({
        deviceLatestMap: {
          ...state.deviceLatestMap,
          [params.deviceId]: latestData,
        },
      }));

      return latestData;
    } catch (error: unknown) {
      if (axios.isCancel(error)) {
        throw error;
      }

      const errorMessage = extractErrorMessage(
        error,
        '[Get device latest telemetry snapshot] Fetch failed'
      );

      return Promise.reject(new Error(errorMessage));
    } finally {
      set({ latestLoading: false });
    }
  },
  async GET_DEVICES_LATEST_DATA_BATCH(
    deviceIds,
    signal
  ): Promise<IDataStreamsLatestResponse[]> {
    if (!deviceIds.length) return [];

    const { currentOrgId } = useOrgContentStore.getState();

    if (!currentOrgId) return [];

    set({ latestLoading: true });

    try {
      const results = await Promise.allSettled(
        deviceIds.map((deviceId) =>
          devicesApi
            .getDeviceLatestData({ deviceId, orgId: currentOrgId }, signal)
            .then((latestData) => ({ deviceId, latestData }))
        )
      );

      const fulfilled = results
        .filter(
          (
            result
          ): result is PromiseFulfilledResult<{
            deviceId: string;
            latestData: IDataStreamsLatestResponse;
          }> => result.status === 'fulfilled'
        )
        .map((result) => result.value);

      if (!fulfilled.length) return [];

      set((state) => {
        const deviceLatestMap = { ...state.deviceLatestMap };

        fulfilled.forEach(({ deviceId, latestData }) => {
          deviceLatestMap[deviceId] = latestData;
        });

        return { deviceLatestMap };
      });

      return fulfilled.map(({ latestData }) => latestData);
    } finally {
      set({ latestLoading: false });
    }
  },
  async POST_DEVICE_STATUS(params): Promise<IDeviceItem> {
    try {
      set({ loading: true });

      const data = await devicesApi.postDeviceStatus(params);

      const updatedDeviceItems = get().deviceItems.map((item) => {
        if (item.deviceId !== params.deviceId) {
          return item;
        }

        return {
          ...item,
          status: data.status,
        };
      });

      set({
        loading: false,
        deviceItems: updatedDeviceItems,
      });

      return data;
    } catch (error: unknown) {
      set({ loading: false });

      const errorMessage = extractErrorMessage(
        error,
        '[Update device status] Fetch failed'
      );

      console.error(errorMessage, error);

      return Promise.reject(new Error(errorMessage));
    }
  },

  async POST_DEVICE(params: {
    orgId: string;
    deviceData: IDeviceItem;
  }): Promise<IDeviceItem> {
    if (!params.orgId) {
      set({
        loading: false,
      });
      return Promise.reject(new Error('[Create device] orgId is required'));
    }

    try {
      set({
        loading: true,
      });

      const data = await devicesApi.postDevice(params);

      set({
        loading: false,
      });
      return data;
    } catch (error: unknown) {
      set({ loading: false });

      const errorMessage = extractErrorMessage(
        error,
        '[Create device] Fetch failed'
      );

      console.error(errorMessage, error);
      return Promise.reject(new Error(errorMessage));
    }
  },

  async PATCH_DEVICE_BY_ID(params: {
    deviceId: string;
    deviceName: string;
  }): Promise<IDeviceItem> {
    if (!params.deviceId) {
      set({
        loading: false,
      });

      return Promise.reject(new Error('[Update device] deviceId is required'));
    }

    try {
      set({
        loading: true,
      });

      const data = await devicesApi.patchDeviceById(params);

      set({
        loading: false,
      });

      return data;
    } catch (error: unknown) {
      set({ loading: false });

      const errorMessage = extractErrorMessage(
        error,
        '[Update device] Fetch failed'
      );

      console.error(errorMessage, error);
      return Promise.reject(new Error(errorMessage));
    }
  },

  async POST_CREATE_DEVICE(orgId, deviceId, hwModel): Promise<void> {
    try {
      await devicesApi.postCreateDevice(orgId, deviceId, hwModel);
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(
        error,
        '[Link or create one device to one organization] Fetch failed'
      );

      console.error(errorMessage, error);
      return Promise.reject(new Error(errorMessage));
    }
  },

  async DELETE_DEVICES(params): Promise<void> {
    try {
      set({ loading: true });

      await devicesApi.deleteDevice(params.deviceId);

      const { deviceLatestMap, deviceItems, totalCount } = get();

      const updatedMap = { ...deviceLatestMap };
      delete updatedMap[params.deviceId];

      const updatedItems = deviceItems.filter(
        (item) => item.deviceId !== params.deviceId
      );
      const newTotalCount = Math.max(0, totalCount - 1);

      set({
        loading: false,
        totalCount: newTotalCount,
        deviceItems: updatedItems,
        deviceLatestMap: updatedMap,
      });
    } catch (error: unknown) {
      set({ loading: false });

      const errorMessage = extractErrorMessage(
        error,
        '[Delete device] Fetch failed'
      );

      console.error(errorMessage, error);
      return Promise.reject(new Error(errorMessage));
    }
  },

  async GET_DEVICE_CAPABILITIES(
    deviceId
  ): Promise<IDeviceCapabilityItem | null> {
    try {
      const data = await devicesApi.getDeviceCapabilities(deviceId);

      return data;
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(
        error,
        '[Get device capabilities] Fetch failed'
      );

      console.error(errorMessage, error);

      return Promise.reject(new Error(errorMessage));
    }
  },

  async GET_DEVICE_TELEMETRY_CONFIGS(
    deviceId: string
  ): Promise<IDeviceTelemetryConfigResponse[]> {
    try {
      const data = await devicesApi.getDeviceTelemetryConfigs({ deviceId });

      set({
        telemetryConfigs: data,
      });

      return data;
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(
        error,
        '[Get device telemetry configs] Fetch failed'
      );

      console.error(errorMessage, error);
      set({ telemetryConfigs: [] });
      return Promise.reject(new Error(errorMessage));
    }
  },

  async GET_DEVICE_TELEMETRY_TABLE(
    deviceId: string,
    latestData?: IDataStreamsLatestResponse
  ): Promise<IDeviceTelemetryTableItem[]> {
    set({ telemetryTableLoading: true });

    try {
      const latestDataPromise: Promise<IDataStreamsLatestResponse> = latestData
        ? Promise.resolve(latestData)
        : get().GET_DEVICE_LATEST_DATA({ deviceId });

      const [telemetryConfigs, resolvedLatestData] = await Promise.all([
        get().GET_DEVICE_TELEMETRY_CONFIGS(deviceId),
        latestDataPromise,
      ]);

      const tableItems = buildTelemetryTableRows(
        telemetryConfigs,
        resolvedLatestData
      );

      set({
        telemetryTableItems: tableItems,
      });

      return tableItems;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(
        error,
        '[Get telemetry table data] Fetch failed'
      );

      console.error(errorMessage, error);
      set({ telemetryTableItems: [] });
      return Promise.reject(new Error(errorMessage));
    } finally {
      set({ telemetryTableLoading: false });
    }
  },

  UPDATE_LOCAL_TELEMETRY_ROW(key, updates) {
    set((state) => ({
      telemetryTableItems: state.telemetryTableItems.map((item) =>
        item.key === key ? { ...item, ...updates } : item
      ),
    }));
  },

  async SAVE_DEVICE_TELEMETRY_ROW(
    deviceId: string,
    row: IDeviceTelemetryTableItem,
    previousRow: IDeviceTelemetryTableItem | null
  ): Promise<void> {
    const rollback = () => {
      if (!previousRow) return;

      get().UPDATE_LOCAL_TELEMETRY_ROW(previousRow.key, {
        collectionEnabled: previousRow.collectionEnabled,
        frequency: previousRow.frequency,
      });
    };

    const payload = applyTelemetryRowToConfigs(get().telemetryConfigs, row);

    try {
      await devicesApi.patchDeviceTelemetryConfigs(deviceId, payload);
    } catch (error: unknown) {
      rollback();

      const errorMessage = extractErrorMessage(
        error,
        '[Patch device telemetry configs] Fetch failed'
      );

      console.error(errorMessage, error);

      return Promise.reject(new Error(errorMessage));
    }
  },
}));
