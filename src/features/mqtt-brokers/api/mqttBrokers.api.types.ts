import type { MqttAuthType, MqttProtocolVersion } from '../domain/types';

export interface IMqttBrokerCredentials {
  username: string;
  password: string;
}

export interface IMqttBrokerDataStreamBridgeRef {
  bridgeId: string;
  name: string | null;
}

export interface IMqttBrokerListItem {
  mqttConfigId: string;
  name: string | null;
  brokerEndpoint: string | null;
  hasStoredCredentials: boolean;
  isInUse: boolean;

  mqttProtocolVersion?: MqttProtocolVersion | null;

  dataStreamBridges?: IMqttBrokerDataStreamBridgeRef[] | null;

  lastModificationTime?: string | null;

  creationTime?: string | null;
}

export interface IMqttBrokersList {
  items: IMqttBrokerListItem[];
  totalCount: number;
}

export interface IMqttBrokerDetail {
  mqttConfigId: string;
  name: string | null;
  brokerEndpoint: string | null;
  authType: MqttAuthType | null;
  keepAliveInterval: string | null;
  reconnectInterval: string | null;
  mqttProtocolVersion: MqttProtocolVersion | null;
  hasStoredCredentials: boolean;
  isInUse: boolean;
}

export interface ICreateMqttBrokerRequest {
  name: string;
  brokerEndpoint: string;
  authType: MqttAuthType;
  brokerCredentials?: IMqttBrokerCredentials;
  keepAliveInterval?: string | null;
  reconnectInterval?: string | null;
  mqttProtocolVersion?: MqttProtocolVersion;
  checkConnection?: boolean;
}

export interface IUpdateMqttBrokerRequest {
  name: string;
  brokerEndpoint: string;
  keepAliveInterval?: string | null;
  reconnectInterval?: string | null;
  mqttProtocolVersion?: MqttProtocolVersion;
  checkConnection?: boolean;
}

export interface IUpdateMqttBrokerCredentialsRequest {
  authType: MqttAuthType;
  brokerCredentials: IMqttBrokerCredentials;
  checkConnection?: boolean;
}
