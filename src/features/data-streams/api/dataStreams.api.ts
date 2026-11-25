import { apiPath } from '@shared/api/apiPath';
import axiosInstance from '@shared/api/axiosInstance';
import { callApi } from '@shared/api/callApi';

import type { DataStreamManagedBy } from '../domain/types';
import type {
  ICreateDataStreamRequest,
  IDataStreamHistorical,
  IDataStreamItem,
  IDataStreamLatestValue,
  IDataStreamsList,
  IDeviceDataStreamsLatest,
  IPatchDataStreamRequest,
  IUpdateDataStreamRequest,
} from './dataStreams.api.types';

const BASE = (orgId: string, deviceId: string) =>
  `/api/v1/orgs/${orgId}/devices/${deviceId}/data-streams`;

const getDataStreamsList = async (
  params: {
    orgId: string;
    deviceId: string;

    managedBy?: DataStreamManagedBy;
    sorting?: string;
    skipCount?: number;

    maxResultCount?: number;
  },
  signal?: AbortSignal
): Promise<IDataStreamsList> =>
  callApi('Get Data Streams', async () => {
    const { data } = await axiosInstance.get<IDataStreamsList>(
      apiPath(BASE(params.orgId, params.deviceId)),
      {
        params: {
          managedBy: params.managedBy,
          sorting: params.sorting,
          skipCount: params.skipCount,
          maxResultCount: params.maxResultCount,
        },
        signal,
      }
    );

    return data;
  });

const postDataStream = async (params: {
  orgId: string;
  deviceId: string;
  data: ICreateDataStreamRequest;
}): Promise<IDataStreamItem> =>
  callApi('Create Data Stream', async () => {
    const { data } = await axiosInstance.post<IDataStreamItem>(
      apiPath(BASE(params.orgId, params.deviceId)),
      params.data
    );

    return data;
  });

const getDataStreamsLatest = async (
  params: { orgId: string; deviceId: string },
  signal?: AbortSignal
): Promise<IDeviceDataStreamsLatest | null> =>
  callApi('Get Data Streams Latest', async () => {
    const { data, status } = await axiosInstance.get<IDeviceDataStreamsLatest>(
      `${apiPath(BASE(params.orgId, params.deviceId))}/values/latest`,
      {
        validateStatus: (s) => s === 200 || s === 204,
        signal,
      }
    );

    return status === 204 ? null : data;
  });

const getDataStreamLatest = async (
  params: { orgId: string; deviceId: string; dataStreamId: string },
  signal?: AbortSignal
): Promise<IDataStreamLatestValue | null> =>
  callApi('Get Data Stream Latest', async () => {
    const { data, status } = await axiosInstance.get<IDataStreamLatestValue>(
      `${apiPath(BASE(params.orgId, params.deviceId))}/${params.dataStreamId}/values/latest`,
      {
        validateStatus: (s) => s === 200 || s === 204,
        signal,
      }
    );

    return status === 204 ? null : data;
  });

const getDataStreamHistorical = async (
  params: {
    orgId: string;
    deviceId: string;
    dataStreamId: string;

    start: string;

    end: string;

    cursor?: number;

    limit?: number;
  },
  signal?: AbortSignal
): Promise<IDataStreamHistorical> =>
  callApi('Get Data Stream Historical', async () => {
    const { data } = await axiosInstance.get<IDataStreamHistorical>(
      `${apiPath(BASE(params.orgId, params.deviceId))}/${params.dataStreamId}/values/historical`,
      {
        params: {
          start: params.start,
          end: params.end,
          cursor: params.cursor,
          limit: params.limit,
        },
        signal,
      }
    );

    return data;
  });

const getDataStreamBlob = async (
  params: {
    orgId: string;
    deviceId: string;
    dataStreamId: string;
    blobKey: string;
  },
  signal?: AbortSignal
): Promise<Blob> =>
  callApi('Get Data Stream Blob', async () => {
    const blobPath = params.blobKey
      .split('/')
      .map(encodeURIComponent)
      .join('/');

    const { data } = await axiosInstance.get<Blob>(
      `${apiPath(BASE(params.orgId, params.deviceId))}/${params.dataStreamId}/blobs/${blobPath}`,
      { responseType: 'blob', signal }
    );

    return data;
  });

const getDataStreamById = async (
  params: { orgId: string; deviceId: string; dataStreamId: string },
  signal?: AbortSignal
): Promise<IDataStreamItem> =>
  callApi('Get Data Stream by id', async () => {
    const { data } = await axiosInstance.get<IDataStreamItem>(
      `${apiPath(BASE(params.orgId, params.deviceId))}/${params.dataStreamId}`,
      { signal }
    );

    return data;
  });

const putDataStream = async (params: {
  orgId: string;
  deviceId: string;
  dataStreamId: string;
  data: IUpdateDataStreamRequest;
}): Promise<IDataStreamItem> =>
  callApi('Update Data Stream', async () => {
    const { data } = await axiosInstance.put<IDataStreamItem>(
      `${apiPath(BASE(params.orgId, params.deviceId))}/${params.dataStreamId}`,
      params.data
    );

    return data;
  });

const patchDataStream = async (params: {
  orgId: string;
  deviceId: string;
  dataStreamId: string;
  data: IPatchDataStreamRequest;
}): Promise<IDataStreamItem> =>
  callApi('Patch Data Stream', async () => {
    const { data } = await axiosInstance.patch<IDataStreamItem>(
      `${apiPath(BASE(params.orgId, params.deviceId))}/${params.dataStreamId}`,
      params.data
    );

    return data;
  });

const deleteDataStream = async (params: {
  orgId: string;
  deviceId: string;
  dataStreamId: string;
}): Promise<void> =>
  callApi('Delete Data Stream', async () => {
    await axiosInstance.delete(
      `${apiPath(BASE(params.orgId, params.deviceId))}/${params.dataStreamId}`
    );
  });

export const dataStreamsApi = {
  getDataStreamsList,
  getDataStreamById,
  postDataStream,
  putDataStream,
  patchDataStream,
  deleteDataStream,
  getDataStreamsLatest,
  getDataStreamLatest,
  getDataStreamHistorical,
  getDataStreamBlob,
};
