import { apiPath } from '@shared/api/apiPath';
import axiosInstance from '@shared/api/axiosInstance';
import { callApi } from '@shared/api/callApi';

import type { AnalyzerAction } from '../domain/types';
import type {
  IAnalyzerItem,
  IAnalyzersList,
  ICreateAnalyzerRequest,
  IPatchAnalyzerRequest,
  IUpdateAnalyzerRequest,
} from './analyzers.api.types';

const BASE = (orgId: string, deviceId: string) =>
  `/api/v1/orgs/${orgId}/devices/${deviceId}/analyzers`;

const postAnalyzer = async (params: {
  orgId: string;
  deviceId: string;
  data: ICreateAnalyzerRequest;
}): Promise<IAnalyzerItem> =>
  callApi('Create device analyzer', async () => {
    const { data } = await axiosInstance.post<IAnalyzerItem>(
      apiPath(BASE(params.orgId, params.deviceId)),
      params.data
    );

    return data;
  });

const getAnalyzersList = async (
  params: {
    orgId: string;
    deviceId: string;
    keyword?: string;
    sorting?: string;
    skipCount?: number;
    maxResultCount?: number;
  },
  signal?: AbortSignal
): Promise<IAnalyzersList> =>
  callApi('List device analyzers', async () => {
    const { data } = await axiosInstance.get<IAnalyzersList>(
      apiPath(BASE(params.orgId, params.deviceId)),
      {
        params: {
          keyword: params.keyword,
          sorting: params.sorting,
          skipCount: params.skipCount,
          maxResultCount: params.maxResultCount,
        },
        signal,
      }
    );

    return data;
  });

const getAnalyzerById = async (
  params: { orgId: string; deviceId: string; analyzerId: string },
  signal?: AbortSignal
): Promise<IAnalyzerItem> =>
  callApi('Get a device analyzer', async () => {
    const { data } = await axiosInstance.get<IAnalyzerItem>(
      `${apiPath(BASE(params.orgId, params.deviceId))}/${params.analyzerId}`,
      { signal }
    );

    return data;
  });

const putAnalyzer = async (params: {
  orgId: string;
  deviceId: string;
  analyzerId: string;
  data: IUpdateAnalyzerRequest;
}): Promise<IAnalyzerItem> =>
  callApi('Update a device analyzer', async () => {
    const { data } = await axiosInstance.put<IAnalyzerItem>(
      `${apiPath(BASE(params.orgId, params.deviceId))}/${params.analyzerId}`,
      params.data
    );

    return data;
  });

const patchAnalyzer = async (params: {
  orgId: string;
  deviceId: string;
  analyzerId: string;
  data: IPatchAnalyzerRequest;
}): Promise<IAnalyzerItem> =>
  callApi('Partially update a device analyzer', async () => {
    const { data } = await axiosInstance.patch<IAnalyzerItem>(
      `${apiPath(BASE(params.orgId, params.deviceId))}/${params.analyzerId}`,
      params.data
    );

    return data;
  });

const deleteAnalyzer = async (params: {
  orgId: string;
  deviceId: string;
  analyzerId: string;
}): Promise<void> =>
  callApi('Delete a device analyzer', async () => {
    await axiosInstance.delete(
      `${apiPath(BASE(params.orgId, params.deviceId))}/${params.analyzerId}`
    );
  });

const postAnalyzerAction = async (params: {
  orgId: string;
  deviceId: string;
  analyzerId: string;
  action: AnalyzerAction;
}): Promise<void> =>
  callApi(
    params.action === 'enable' ? 'Enable an analyzer' : 'Disable an analyzer',
    async () => {
      await axiosInstance.post(
        `${apiPath(BASE(params.orgId, params.deviceId))}/${params.analyzerId}:${params.action}`
      );
    }
  );

export const analyzersApi = {
  postAnalyzer,
  getAnalyzersList,
  getAnalyzerById,
  putAnalyzer,
  patchAnalyzer,
  deleteAnalyzer,
  postAnalyzerAction,
};
