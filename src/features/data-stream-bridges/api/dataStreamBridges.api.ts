import { apiPath } from '@shared/api/apiPath';
import axiosInstance from '@shared/api/axiosInstance';
import { callApi } from '@shared/api/callApi';

import type {
  DataStreamBridgeAction,
  ICreateDataStreamBridgeRequest,
  IDataStreamBridgeDetail,
  IDataStreamBridgesList,
  IDataStreamBridgeSummary,
  IPatchDataStreamBridgeRequest,
  IUpdateDataStreamBridgeRequest,
} from './dataStreamBridges.api.types';

const BASE = (orgId: string) => `/api/v1/orgs/${orgId}/data-bridges`;

const getDataStreamBridgesList = async (
  params: {
    orgId: string;
    filter?: string;
    sorting?: string;
    skipCount?: number;
    maxResultCount?: number;
  },
  signal?: AbortSignal
): Promise<IDataStreamBridgesList> =>
  callApi('Get DataStream Bridges Data', async () => {
    const { data } = await axiosInstance.get<IDataStreamBridgesList>(
      apiPath(BASE(params.orgId)),
      {
        params: {
          filter: params.filter,
          sorting: params.sorting,
          skipCount: params.skipCount,
          maxResultCount: params.maxResultCount,
        },
        signal,
      }
    );

    return data;
  });

const getDataStreamBridgeById = async (
  params: { orgId: string; bridgeId: string },
  signal?: AbortSignal
): Promise<IDataStreamBridgeDetail> =>
  callApi('Get DataStream Bridge by id', async () => {
    const { data } = await axiosInstance.get<IDataStreamBridgeDetail>(
      `${apiPath(BASE(params.orgId))}/${params.bridgeId}`,
      { signal }
    );

    return data;
  });

const postDataStreamBridge = async (params: {
  orgId: string;
  data: ICreateDataStreamBridgeRequest;
}): Promise<IDataStreamBridgeSummary> =>
  callApi('Create DataStream Bridge', async () => {
    const { data } = await axiosInstance.post<IDataStreamBridgeSummary>(
      apiPath(BASE(params.orgId)),
      params.data
    );

    return data;
  });

const putDataStreamBridge = async (params: {
  orgId: string;
  bridgeId: string;
  data: IUpdateDataStreamBridgeRequest;
}): Promise<IDataStreamBridgeSummary> =>
  callApi('Update DataStream Bridge', async () => {
    const { data } = await axiosInstance.put<IDataStreamBridgeSummary>(
      `${apiPath(BASE(params.orgId))}/${params.bridgeId}`,
      params.data
    );

    return data;
  });

const patchDataStreamBridge = async (params: {
  orgId: string;
  bridgeId: string;
  data: IPatchDataStreamBridgeRequest;
}): Promise<IDataStreamBridgeSummary> =>
  callApi('Patch DataStream Bridge', async () => {
    const { data } = await axiosInstance.patch<IDataStreamBridgeSummary>(
      `${apiPath(BASE(params.orgId))}/${params.bridgeId}`,
      params.data
    );

    return data;
  });

const deleteDataStreamBridge = async (params: {
  orgId: string;
  bridgeId: string;
}): Promise<void> =>
  callApi('Delete DataStream Bridge', async () => {
    await axiosInstance.delete(
      `${apiPath(BASE(params.orgId))}/${params.bridgeId}`
    );
  });

const postDataStreamBridgeAction = async (params: {
  orgId: string;
  bridgeId: string;
  action: DataStreamBridgeAction;
}): Promise<void> =>
  callApi(
    params.action === 'enable'
      ? 'Enable DataStream Bridge'
      : 'Disable DataStream Bridge',
    async () => {
      await axiosInstance.post(
        `${apiPath(BASE(params.orgId))}/${params.bridgeId}:${params.action}`
      );
    }
  );

export const dataStreamBridgesApi = {
  getDataStreamBridgesList,
  getDataStreamBridgeById,
  postDataStreamBridge,
  putDataStreamBridge,
  patchDataStreamBridge,
  deleteDataStreamBridge,
  postDataStreamBridgeAction,
};
