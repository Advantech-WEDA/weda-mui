import { apiPath } from '@shared/api/apiPath';
import axiosInstance from '@shared/api/axiosInstance';
import { callApi } from '@shared/api/callApi';

import type {
  ICreateMqttBrokerRequest,
  IMqttBrokerDetail,
  IMqttBrokersList,
  IUpdateMqttBrokerCredentialsRequest,
  IUpdateMqttBrokerRequest,
} from './mqttBrokers.api.types';

const BASE = (orgId: string) =>
  `/api/v1/orgs/${orgId}/data-bridges/mqtt-broker-configs`;

const getMqttBrokersList = async (
  params: {
    orgId: string;
    filter?: string;
    sorting?: string;
    skipCount?: number;
    maxResultCount?: number;
  },
  signal?: AbortSignal
): Promise<IMqttBrokersList> =>
  callApi('Get MQTT Brokers Data', async () => {
    const { data } = await axiosInstance.get<IMqttBrokersList>(
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

const getMqttBrokerById = async (
  params: { orgId: string; mqttConfigId: string },
  signal?: AbortSignal
): Promise<IMqttBrokerDetail> =>
  callApi('Get MQTT broker by id', async () => {
    const { data } = await axiosInstance.get<IMqttBrokerDetail>(
      `${apiPath(BASE(params.orgId))}/${params.mqttConfigId}`,
      { signal }
    );

    return data;
  });

const postMqttBroker = async (params: {
  orgId: string;
  data: ICreateMqttBrokerRequest;
}): Promise<IMqttBrokerDetail> =>
  callApi('Create MQTT broker', async () => {
    const { data } = await axiosInstance.post<IMqttBrokerDetail>(
      apiPath(BASE(params.orgId)),
      params.data
    );

    return data;
  });

const putMqttBroker = async (params: {
  orgId: string;
  mqttConfigId: string;
  data: IUpdateMqttBrokerRequest;
}): Promise<IMqttBrokerDetail> =>
  callApi('Update MQTT broker', async () => {
    const { data } = await axiosInstance.put<IMqttBrokerDetail>(
      `${apiPath(BASE(params.orgId))}/${params.mqttConfigId}`,
      params.data
    );

    return data;
  });

const deleteMqttBroker = async (params: {
  orgId: string;
  mqttConfigId: string;
}): Promise<void> =>
  callApi('Delete MQTT broker', async () => {
    await axiosInstance.delete(
      `${apiPath(BASE(params.orgId))}/${params.mqttConfigId}`
    );
  });

const patchMqttBrokerCredentials = async (params: {
  orgId: string;
  mqttConfigId: string;
  data: IUpdateMqttBrokerCredentialsRequest;
}): Promise<void> =>
  callApi('Update MQTT broker credentials', async () => {
    await axiosInstance.patch(
      `${apiPath(BASE(params.orgId))}/${params.mqttConfigId}/credentials`,
      params.data
    );
  });

export const mqttBrokersApi = {
  getMqttBrokersList,
  getMqttBrokerById,
  postMqttBroker,
  putMqttBroker,
  deleteMqttBroker,
  patchMqttBrokerCredentials,
};
