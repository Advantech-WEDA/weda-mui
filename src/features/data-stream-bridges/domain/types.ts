export type MqttQos = 0 | 1 | 2;

export type AssemblyOnTimeout = 'PublishPartial' | 'DropPartial';

export type BridgeRuntimeStatus =
  | 'Stopped'
  | 'Starting'
  | 'Running'
  | 'Faulted'
  | 'Stopping';

export type BridgeDisplayStatus = 'Running' | 'Error' | 'Disabled';

export function toBridgeDisplayStatus(row: {
  isEnabled: boolean;
  runtimeStatus: BridgeRuntimeStatus | null;
}): BridgeDisplayStatus | null {
  if (!row.isEnabled) return 'Disabled';

  switch (row.runtimeStatus) {
    case 'Faulted':
      return 'Error';

    case 'Stopped':
      return 'Disabled';

    case 'Running':
    case 'Starting':
    case 'Stopping':
      return 'Running';

    default:
      return null;
  }
}

export type TableHeaderSortKey =
  | 'Name'
  | 'IsEnabled'
  | 'CreationTime'
  | 'LastRuntimeStatus';

export type BindingDataType =
  | 'number'
  | 'double'
  | 'float'
  | 'decimal'
  | 'integer'
  | 'int'
  | 'long'
  | 'boolean'
  | 'bool'
  | 'datetime'
  | 'string';

export const qosOptions: { label: string; value: string }[] = [
  { label: '0', value: '0' },
  { label: '1', value: '1' },
  { label: '2', value: '2' },
];

export interface BridgeBindingRow {
  rowId: string;
  deviceId: string;
  dataStreamId: string;

  targetPath: string;
  sourceFieldName?: string | null;
  dataType?: string | null;
  requiredForAssembly?: boolean;
}

export interface DataStreamBridgeForm {
  name: string;
  mqttBrokerConfigId: string;
  outputTopic: string;
  qos: MqttQos;
  bindings: BridgeBindingRow[];
}

export type BridgeBindingRowErrors = {
  deviceId: string;
  dataStreamId: string;
  targetPath: string;
};

export type DataStreamBridgeFormErrors = {
  name: string;
  mqttBrokerConfigId: string;
  outputTopic: string;

  bindings: string;

  bindingRows: Record<string, BridgeBindingRowErrors>;
};

export type BasicField = 'name' | 'mqttBrokerConfigId' | 'outputTopic' | 'qos';

export type BindingField = 'deviceId' | 'dataStreamId' | 'targetPath';
