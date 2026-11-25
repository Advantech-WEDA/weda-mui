import {
  fromTargetJsonPath,
  nextRowId,
  toTargetJsonPath,
} from '../domain/dataStreamBridge.rules';
import type { DataStreamBridgeForm } from '../domain/types';
import type {
  ICreateDataStreamBridgeRequest,
  IDataStreamBridgeAssemblyPolicy,
  IDataStreamBridgeDetail,
  IDataStreamBridgeListItem,
} from './dataStreamBridges.api.types';

export function bridgeDetailToForm(
  detail: IDataStreamBridgeDetail
): DataStreamBridgeForm {
  return {
    name: detail.name ?? '',
    mqttBrokerConfigId: detail.mqtt?.mqttConfigId ?? '',
    outputTopic: detail.mqtt?.outputTopic ?? '',
    qos: detail.mqtt?.qos ?? 0,
    bindings: (detail.bindings ?? []).map((binding) => ({
      rowId: nextRowId(),
      deviceId: binding.deviceId,
      dataStreamId: binding.dataStreamId,
      targetPath: fromTargetJsonPath(binding.targetJsonPath),
      sourceFieldName: binding.sourceFieldName,
      dataType: binding.dataType,
      requiredForAssembly: binding.requiredForAssembly,
    })),
  };
}

export function formToBridgeRequest(
  form: DataStreamBridgeForm,
  assemblyPolicy?: IDataStreamBridgeAssemblyPolicy
): ICreateDataStreamBridgeRequest {
  return {
    name: form.name.trim(),
    mqtt: {
      mqttBrokerConfigId: form.mqttBrokerConfigId,
      outputTopic: form.outputTopic.trim(),
      qos: form.qos,
    },
    bindings: form.bindings.map((row) => ({
      deviceId: row.deviceId,
      dataStreamId: row.dataStreamId,
      targetJsonPath: toTargetJsonPath(row.targetPath),

      sourceFieldName: row.sourceFieldName ?? undefined,
      dataType: row.dataType ?? undefined,
      requiredForAssembly: row.requiredForAssembly,
    })),

    ...(assemblyPolicy ? { assemblyPolicy } : {}),
  };
}

export function mergeBridgeDetailIntoListItem(
  row: IDataStreamBridgeListItem,
  detail: IDataStreamBridgeDetail
): IDataStreamBridgeListItem {
  return {
    ...row,
    outputTopic: detail.mqtt?.outputTopic ?? row.outputTopic,
    qos: detail.mqtt?.qos ?? row.qos,
    dataStreamCount: detail.bindings?.length ?? 0,
    creationTime: detail.creationTime ?? row.creationTime,
  };
}
