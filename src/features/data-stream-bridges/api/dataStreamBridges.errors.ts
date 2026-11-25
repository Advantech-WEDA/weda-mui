import type { IDataStreamItem } from '@features/data-streams';
import type { IDeviceItem } from '@features/devices';
import type { IMqttBrokerListItem } from '@features/mqtt-brokers';
import { ApiError } from '@shared/api/ApiError';

import { toTargetJsonPath } from '../domain/dataStreamBridge.rules';
import type {
  BindingField,
  BridgeBindingRow,
  DataStreamBridgeForm,
  DataStreamBridgeFormErrors,
} from '../domain/types';

export function fillBridgeErrorPlaceholders(
  message: string,
  brokerEndpoint: string | null | undefined
): string {
  if (!brokerEndpoint) return message;

  return message.replace(/\{endpoint\}/gi, brokerEndpoint);
}

type BasicErrorField = 'name' | 'mqttBrokerConfigId' | 'outputTopic';

export interface BridgeSubmitContext {
  form: DataStreamBridgeForm;
  brokers: IMqttBrokerListItem[];
  devices: IDeviceItem[];
  streamsByDevice: Record<string, IDataStreamItem[]>;
}

const BASIC_FIELD_BY_BACKEND_FIELD: Record<string, BasicErrorField> = {
  name: 'name',
  bridgename: 'name',
  mqttbrokerconfigid: 'mqttBrokerConfigId',
  brokerconfigid: 'mqttBrokerConfigId',
  mqttconfigid: 'mqttBrokerConfigId',
  mqttbrokerconfigname: 'mqttBrokerConfigId',
  brokerconfigname: 'mqttBrokerConfigId',
  outputtopic: 'outputTopic',
  topic: 'outputTopic',
};

const BINDING_FIELD_BY_BACKEND_FIELD: Record<string, BindingField> = {
  deviceid: 'deviceId',
  devicename: 'deviceId',
  datastreamid: 'dataStreamId',
  datastreamname: 'dataStreamId',
  targetjsonpath: 'targetPath',
  targetpath: 'targetPath',
};

const FIELD_BY_PLACEHOLDER: Record<string, BasicErrorField | 'bindings'> = {
  bridgename: 'name',
  name: 'name',
  outputtopic: 'outputTopic',
  topic: 'outputTopic',
  mqttbrokerconfigid: 'mqttBrokerConfigId',
  brokerconfigid: 'mqttBrokerConfigId',
  mqttconfigid: 'mqttBrokerConfigId',
  brokerconfigname: 'mqttBrokerConfigId',
  mqttbrokerconfigname: 'mqttBrokerConfigId',
  endpoint: 'mqttBrokerConfigId',
  brokerendpoint: 'mqttBrokerConfigId',
  deviceid: 'bindings',
  devicename: 'bindings',
  datastreamid: 'bindings',
  datastreamname: 'bindings',
  targetjsonpath: 'bindings',
  targetpath: 'bindings',
};

const FIELD_BY_CODE_KEYWORD: [RegExp, BasicErrorField | 'bindings'][] = [
  [/broker|mqttconfig/i, 'mqttBrokerConfigId'],
  [/topic|outputschema/i, 'outputTopic'],
  [/binding|datastream|device|targetpath|jsonpath/i, 'bindings'],
  [/name/i, 'name'],
];

const PLACEHOLDER_PATTERN = /\{(\w+)\}/g;

const findBroker = (ctx: BridgeSubmitContext) =>
  ctx.brokers.find((b) => b.mqttConfigId === ctx.form.mqttBrokerConfigId);

function rowPlaceholderValues(
  ctx: BridgeSubmitContext,
  row: BridgeBindingRow | undefined
): Record<string, string> {
  if (!row) return {};

  const device = ctx.devices.find((d) => d.deviceId === row.deviceId);
  const stream = ctx.streamsByDevice[row.deviceId]?.find(
    (s) => s.dataStreamId === row.dataStreamId
  );

  return {
    deviceid: device?.deviceName || row.deviceId,
    devicename: device?.deviceName || row.deviceId,
    datastreamid: stream?.dataStreamName || row.dataStreamId,
    datastreamname: stream?.dataStreamName || row.dataStreamId,
    targetjsonpath: toTargetJsonPath(row.targetPath),
    targetpath: toTargetJsonPath(row.targetPath),
  };
}

function placeholderValues(
  ctx: BridgeSubmitContext,
  row?: BridgeBindingRow
): Record<string, string> {
  const broker = findBroker(ctx);
  const brokerName = broker?.name || ctx.form.mqttBrokerConfigId;
  const name = ctx.form.name.trim();
  const outputTopic = ctx.form.outputTopic.trim();

  return {
    bridgename: name,
    name,
    outputtopic: outputTopic,
    topic: outputTopic,
    mqttbrokerconfigid: brokerName,
    brokerconfigid: brokerName,
    mqttconfigid: brokerName,
    brokerconfigname: brokerName,
    mqttbrokerconfigname: brokerName,
    endpoint: broker?.brokerEndpoint || brokerName,
    brokerendpoint: broker?.brokerEndpoint || brokerName,

    ...rowPlaceholderValues(
      ctx,
      row ?? (ctx.form.bindings.length === 1 ? ctx.form.bindings[0] : undefined)
    ),
  };
}

function fillPlaceholders(
  message: string,
  ctx: BridgeSubmitContext,
  row?: BridgeBindingRow
): string {
  const values = placeholderValues(ctx, row);

  return message.replace(PLACEHOLDER_PATTERN, (match, key: string) => {
    const value = values[key.toLowerCase()];
    return value ? value : match;
  });
}

function parseBindingField(
  backendField: string
): { index: number | null; field: string } | null {
  const match = /bindings(?:\[(\d+)\])?(?:\.(\w+))?$/i.exec(backendField);
  if (!match) return null;

  return {
    index: match[1] !== undefined ? Number(match[1]) : null,
    field: (match[2] ?? '').toLowerCase(),
  };
}

export function getBridgeSubmitErrorMessage(
  error: unknown,
  fallback: string,
  ctx: BridgeSubmitContext
): string {
  return fillPlaceholders(getRawApiErrorMessage(error, fallback), ctx);
}

export function getRawApiErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (error instanceof ApiError && error.backendMessage) {
    return error.backendMessage;
  }

  return (error instanceof Error && error.message) || fallback;
}

export function getBridgeSubmitFieldErrors(
  error: unknown,
  ctx: BridgeSubmitContext
): Partial<DataStreamBridgeFormErrors> {
  if (!(error instanceof ApiError)) return {};

  const result: Partial<DataStreamBridgeFormErrors> = {};
  const fallbackMessage = fillPlaceholders(error.message, ctx);

  const setField = (field: BasicErrorField | 'bindings', message: string) => {
    if (!result[field]) result[field] = message;
  };

  for (const [backendField, rawMessage] of Object.entries(error.fieldErrors)) {
    const binding = parseBindingField(backendField);

    if (binding) {
      const row =
        binding.index !== null ? ctx.form.bindings[binding.index] : undefined;
      const message = fillPlaceholders(rawMessage || error.message, ctx, row);
      const rowField = BINDING_FIELD_BY_BACKEND_FIELD[binding.field];

      if (row && rowField) {
        const rows = { ...(result.bindingRows ?? {}) };
        const current = rows[row.rowId] ?? {
          deviceId: '',
          dataStreamId: '',
          targetPath: '',
        };
        rows[row.rowId] = { ...current, [rowField]: message };
        result.bindingRows = rows;
      }

      setField('bindings', message);
      continue;
    }

    const lastSegment = backendField.split('.').pop()?.toLowerCase() ?? '';
    const field = BASIC_FIELD_BY_BACKEND_FIELD[lastSegment];
    if (field) {
      setField(
        field,
        rawMessage ? fillPlaceholders(rawMessage, ctx) : fallbackMessage
      );
    }
  }

  if (Object.keys(result).length > 0) return result;

  if (error.code) {
    const codeField = FIELD_BY_CODE_KEYWORD.find(([pattern]) =>
      pattern.test(error.code ?? '')
    )?.[1];

    if (codeField) {
      setField(codeField, fallbackMessage);
      return result;
    }
  }

  for (const [, key] of error.message.matchAll(PLACEHOLDER_PATTERN)) {
    const field = FIELD_BY_PLACEHOLDER[key.toLowerCase()];
    if (field) {
      setField(field, fallbackMessage);
      break;
    }
  }

  return result;
}
