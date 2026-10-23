import { apiPath } from '@shared/api/apiPath';
import axiosInstance from '@shared/api/axiosInstance';
import type { AxiosRequestConfig } from 'axios';

import type {
  ICreateStackConfigPayload,
  IDeleteStackFromDeviceParams,
  IDeploymentItem,
  IDeploymentListResponse,
  IDeployStackToDevicesPayload,
  IGetDeploymentsParams,
  IGetListStacksInDeviceParams,
  IGetStackConfigByIdParams,
  IGetStackConfigsParams,
  IStackActionPayload,
  IStackActionResponse,
  IStackConfigsItem,
  IStackConfigsListResponse,
  IUpdateStackConfigPayload,
} from './stacks.api.types';

const arrayParamsConfig = (
  params: Record<string, unknown>
): AxiosRequestConfig => ({
  params,
  paramsSerializer: {
    indexes: null,
  },
});

const getDeployments = async (
  params: IGetDeploymentsParams,
  signal?: AbortSignal
): Promise<IDeploymentListResponse> => {
  const { data } = await axiosInstance.get<IDeploymentListResponse>(
    apiPath(`/api/v1/orgs/${params.orgId}/stack-configs/deployments`),
    {
      ...arrayParamsConfig({
        stackRevisionId: params.stackRevisionId?.length
          ? params.stackRevisionId
          : undefined,
        stackNames: params.stackNames?.length ? params.stackNames : undefined,
        deviceIds: params.deviceIds?.length ? params.deviceIds : undefined,
        skipCount: params.skipCount,
        maxResultCount: params.maxResultCount,
        sorting: params.sorting,
      }),
      signal,
    }
  );

  return data;
};

const getStackConfigs = async (
  params: IGetStackConfigsParams,
  signal?: AbortSignal
): Promise<IStackConfigsListResponse> => {
  const { data } = await axiosInstance.get<IStackConfigsListResponse>(
    apiPath(`/api/v1/orgs/${params.orgId}/stack-configs`),
    {
      params: {
        stackName: params.stackName || undefined,
        type: params.type || undefined,
        skipCount: params.skipCount,
        maxResultCount: params.maxResultCount,
        sorting: params.sorting,
      },
      signal,
    }
  );

  return data;
};

const postStackConfig = async (
  params: ICreateStackConfigPayload
): Promise<IStackConfigsItem> => {
  const { data } = await axiosInstance.post<IStackConfigsItem>(
    apiPath(`/api/v1/orgs/${params.orgId}/stack-configs`),
    {
      stackName: params.stackName,
      type: params.type,
      composeFileContent: params.composeFileContent,
      environment: params.environment,
      description: params.description,
    }
  );

  return data;
};

const getStackConfigById = async (
  params: IGetStackConfigByIdParams,
  signal?: AbortSignal
): Promise<IStackConfigsItem> => {
  const { data } = await axiosInstance.get<IStackConfigsItem>(
    apiPath(
      `/api/v1/orgs/${params.orgId}/stack-configs/${params.stackConfigId}/revisions/${params.stackRevisionId}`
    ),
    { signal }
  );

  return data;
};

const patchStackConfigById = async (
  params: IUpdateStackConfigPayload
): Promise<IStackConfigsItem> => {
  const { data } = await axiosInstance.patch<IStackConfigsItem>(
    apiPath(
      `/api/v1/orgs/${params.orgId}/stack-configs/${params.stackConfigId}`
    ),
    {
      composeFileContent: params.composeFileContent,
      environment: params.environment,
      description: params.description,
    }
  );

  return data;
};

const deleteStackConfigById = async (
  params: IGetStackConfigByIdParams
): Promise<void> => {
  await axiosInstance.delete(
    apiPath(
      `/api/v1/orgs/${params.orgId}/stack-configs/${params.stackConfigId}/revisions/${params.stackRevisionId}`
    )
  );
};

const postStackAction = async (
  params: IStackActionPayload
): Promise<IStackActionResponse> => {
  const { data } = await axiosInstance.post<IStackActionResponse>(
    apiPath(
      `/api/v1/devices/${params.deviceId}/docker/stacks/commands:${params.action}`
    ),
    {
      stackConfigId: params.stackConfigId,
    }
  );

  return data;
};

const deleteStackFromDevice = async (
  params: IDeleteStackFromDeviceParams
): Promise<void> => {
  await axiosInstance.delete(
    apiPath(`/api/v1/devices/${params.deviceId}/docker/stacks`),
    {
      params: {
        stackConfigId: params.stackConfigId,
      },
    }
  );
};

const postDeployStackToDevices = async (
  params: IDeployStackToDevicesPayload
): Promise<IDeploymentItem> => {
  const { data } = await axiosInstance.post<IDeploymentItem>(
    apiPath(
      `/api/v1/orgs/${params.orgId}/stack-configs/${params.stackConfigId}/revisions/${params.stackRevisionId}:deploy`
    ),
    {
      deviceIds: params.deviceIds,
    }
  );

  return data;
};

const getListStacksInDevice = async (
  params: IGetListStacksInDeviceParams,
  signal?: AbortSignal
): Promise<IDeploymentListResponse> => {
  const { data } = await axiosInstance.get<IDeploymentListResponse>(
    apiPath(`/api/v1/devices/${params.deviceId}/docker/stacks`),
    {
      ...arrayParamsConfig({
        stackConfigId: params.stackConfigId || undefined,
        skipCount: params.skipCount,
        maxResultCount: params.maxResultCount,
        sorting: params.sorting,
      }),
      signal,
    }
  );

  return data;
};

export const stacksApi = {
  getDeployments,
  getStackConfigs,
  postStackConfig,
  getStackConfigById,
  patchStackConfigById,
  deleteStackConfigById,
  postStackAction,
  deleteStackFromDevice,
  postDeployStackToDevices,
  getListStacksInDevice,
};
