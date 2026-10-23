import { apiPath } from '@shared/api/apiPath';
import axiosInstance from '@shared/api/axiosInstance';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import type {
  IDataStreamsLatestResponse,
  IDeviceCapabilityItem,
  IDeviceCapabilityResponse,
  IDeviceItem,
  IDeviceListResponse,
  IDeviceTelemetryConfigResponse,
} from '@/features/devices/api/devices.api.types';

dayjs.extend(utc);

const getDevices = async (
  params: {
    orgId: string;
    skipCount?: number;
    maxResultCount?: number;
    sorting?: string;
  },
  signal?: AbortSignal
): Promise<IDeviceListResponse> => {
  const { data } = await axiosInstance.get<IDeviceListResponse>(
    apiPath(`/api/v1/orgs/${params.orgId}/devices`),
    {
      params: {
        skipCount: params.skipCount,
        maxResultCount: params.maxResultCount,
        sorting: params.sorting,
      },
      signal,
    }
  );

  return data;
};

const getDeviceLatestData = async (
  params: {
    deviceId: string;
    orgId: string;
  },
  signal?: AbortSignal
): Promise<IDataStreamsLatestResponse> => {
  const { data } = await axiosInstance.get<IDataStreamsLatestResponse>(
    apiPath(
      `/api/v1/orgs/${params.orgId}/devices/${params.deviceId}/data-streams/values/latest`
    ),
    {
      validateStatus: (status) => status === 200 || status === 204,
      signal,
    }
  );

  return data;
};

const postDeviceStatus = async (params: {
  deviceId: string;
  status: string;
}): Promise<IDeviceItem> => {
  const { data } = await axiosInstance.post<IDeviceItem>(
    apiPath(`/api/v1/devices/${params.deviceId}:${params.status}`),
    {}
  );

  return data;
};

const postDevice = async (params: {
  orgId: string;
  deviceData: IDeviceItem;
}): Promise<IDeviceItem> => {
  const payload = {
    deviceId: params.deviceData.deviceId,
    hwModel: params.deviceData.hwModel,
    deviceName: params.deviceData.deviceName,
  };

  const { data } = await axiosInstance.post(
    apiPath(`/api/v1/orgs/${params.orgId}/devices`),
    payload
  );

  return data;
};

const patchDeviceById = async (params: {
  deviceId: string;
  deviceName: string;
}): Promise<IDeviceItem> => {
  const payload = {
    deviceName: params.deviceName,
  };

  const { data } = await axiosInstance.patch(
    apiPath(`/api/v1/devices/${params.deviceId}`),
    payload
  );

  return data;
};

const postCreateDevice = async (
  orgId: string,
  deviceId: string,
  hwModel: string
): Promise<void> => {
  await axiosInstance.post(apiPath(`/api/v1/orgs/${orgId}/devices`), {
    deviceId,
    hwModel,
  });
};

const deleteDevice = async (deviceId: string): Promise<void> => {
  await axiosInstance.delete(apiPath(`/api/v1/devices/${deviceId}`));
};

const getDeviceCapabilities = async (
  deviceId: string
): Promise<IDeviceCapabilityItem | null> => {
  const { data } = await axiosInstance.get<IDeviceCapabilityResponse>(
    apiPath(`/api/v1/devices/${deviceId}/capabilities`)
  );

  return data.data.deviceCapsDto[0] ?? null;
};

const getDeviceTelemetryConfigs = async (params: {
  deviceId: string;
  deviceName?: string;
}): Promise<IDeviceTelemetryConfigResponse[]> => {
  const { data } = await axiosInstance.get<
    IDeviceTelemetryConfigResponse[] | IDeviceTelemetryConfigResponse | null
  >(apiPath(`/api/v1/devices/${params.deviceId}/telemetry-configs`));

  if (!data) return [];

  return Array.isArray(data) ? data : [data];
};

const patchDeviceTelemetryConfigs = async (
  deviceId: string,
  payload: IDeviceTelemetryConfigResponse[]
): Promise<void> => {
  await axiosInstance.patch(
    apiPath(`/api/v1/devices/${deviceId}/telemetry-configs`),
    payload
  );
};

export const devicesApi = {
  getDevices,
  getDeviceLatestData,
  postDeviceStatus,
  postDevice,
  patchDeviceById,
  postCreateDevice,
  deleteDevice,
  getDeviceCapabilities,
  getDeviceTelemetryConfigs,
  patchDeviceTelemetryConfigs,
};
