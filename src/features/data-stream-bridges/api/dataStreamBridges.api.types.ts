import type {
  AssemblyOnTimeout,
  BindingDataType,
  BridgeRuntimeStatus,
  MqttQos,
} from '../domain/types';

export interface IDataStreamBridgeAssemblyPolicy {
  queueLimit?: number;

  timeoutSeconds?: number;
  onTimeout: AssemblyOnTimeout;
}

export interface IDataStreamBridgeBinding {
  deviceId: string;

  dataStreamId: string;

  sourceFieldName?: string | null;

  targetJsonPath: string;

  dataType?: BindingDataType | string | null;

  requiredForAssembly?: boolean;
}

export interface IDataStreamBridgeListItem {
  bridgeId: string;
  name: string | null;
  isEnabled: boolean;
  mqttBrokerConfigName: string | null;
  hasStoredBrokerCredentials: boolean;
  brokerEndpoint: string | null;
  runtimeStatus: BridgeRuntimeStatus | null;

  outputTopic?: string | null;

  qos?: MqttQos | null;

  dataStreamCount?: number | null;

  creationTime?: string | null;
}

export interface IDataStreamBridgesList {
  items: IDataStreamBridgeListItem[];
  totalCount: number;
}

export interface IDataStreamBridgeMqttDetail {
  mqttConfigId: string;
  mqttBrokerConfigName: string | null;
  hasStoredBrokerCredentials: boolean;
  brokerEndpoint: string | null;
  authType: string | null;
  keepAliveInterval: string | null;
  reconnectInterval: string | null;
  outputTopic: string | null;
  qos: MqttQos;
}

export interface IDataStreamBridgeRuntimeFault {
  code: string | null;
  message: string | null;
  willRetry: boolean;
  maxRetryAttempts: number;
}

export interface IDataStreamBridgeRuntimeState {
  status: BridgeRuntimeStatus | null;

  lastPublishTime: string | null;

  queueDepth: number;

  fault: IDataStreamBridgeRuntimeFault | null;
}

export interface IDataStreamBridgeDetail {
  bridgeId: string;
  name: string | null;
  isEnabled: boolean;
  mqtt: IDataStreamBridgeMqttDetail;
  assemblyPolicy: IDataStreamBridgeAssemblyPolicy;
  bindings: IDataStreamBridgeBinding[] | null;
  runtimeState: IDataStreamBridgeRuntimeState;

  creationTime?: string | null;
}

export interface ICreateDataStreamBridgeRequest {
  name: string;
  mqtt: {
    mqttBrokerConfigId: string;

    outputTopic: string;

    qos?: MqttQos;
  };

  bindings: IDataStreamBridgeBinding[];
  assemblyPolicy?: IDataStreamBridgeAssemblyPolicy;
}

export interface IDataStreamBridgeSummary {
  bridgeId: string;
  name: string | null;
  isEnabled: boolean;
  mqttConfigId: string;
  mqttBrokerConfigName: string | null;
  hasStoredBrokerCredentials: boolean;
  brokerEndpoint: string | null;
  outputTopic: string | null;
}

export type IUpdateDataStreamBridgeRequest = ICreateDataStreamBridgeRequest;

export interface IPatchDataStreamBridgeRequest {
  name?: string | null;
  mqtt?: {
    mqttBrokerConfigId?: string | null;
    outputTopic?: string | null;
    qos?: MqttQos | null;
  };
  assemblyPolicy?: {
    queueLimit?: number | null;
    timeoutSeconds?: number | null;
    onTimeout?: AssemblyOnTimeout | null;
  };
  bindings?: IDataStreamBridgeBinding[] | null;
}

export type DataStreamBridgeAction = 'enable' | 'disable';
