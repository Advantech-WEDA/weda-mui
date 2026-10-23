import {
  type IDeviceTelemetryTableItem,
  MAX_TELEMETRY_FREQUENCY_MS,
  MIN_TELEMETRY_FREQUENCY_MS,
} from '../domain/types';
import type {
  IDataStreamsLatestResponse,
  IDeviceTelemetryConfigResponse,
  IDeviceTelemetryReport,
  IDeviceTelemetrySensor,
} from './devices.api.types';

const getSensorReport = (
  sensor: IDeviceTelemetrySensor
): IDeviceTelemetryReport | undefined => sensor.report ?? sensor.config;

export function buildTelemetryTableRows(
  telemetryConfigs: IDeviceTelemetryConfigResponse[],
  latestData: IDataStreamsLatestResponse | undefined
): IDeviceTelemetryTableItem[] {
  const sensors = telemetryConfigs.flatMap((item) => item?.sensors ?? []);

  const dataStreamMap = new Map(
    (latestData?.dataStreams ?? []).map((stream) => [
      stream.dataStreamName,
      stream,
    ])
  );

  return sensors.map((sensor) => {
    const stream = dataStreamMap.get(sensor.name);
    const report = getSensorReport(sensor);
    const value = stream?.dataObject?.value;

    return {
      key: sensor.name,
      telemetryName: sensor.sensorInfo?.displayName ?? sensor.name,
      telemetryKey: sensor.name,

      value: (typeof value === 'object' ? JSON.stringify(value) : value) as
        | string
        | number
        | boolean
        | undefined,

      lastUpdated: stream?.dataObject?.timestamp ?? null,

      collectionEnabled: report?.enabled ?? false,

      frequency: report?.interval ?? MIN_TELEMETRY_FREQUENCY_MS,

      transmissionEnabled: report?.enabled ?? false,
    };
  });
}

export function applyTelemetryRowToConfigs(
  telemetryConfigs: IDeviceTelemetryConfigResponse[],
  row: IDeviceTelemetryTableItem
): IDeviceTelemetryConfigResponse[] {
  return telemetryConfigs.map((config) => ({
    enabled: config.enabled ?? true,
    deviceName: config.deviceName,
    sensors: (config.sensors ?? []).map((sensor) => {
      const { config: legacyConfig, ...rest } = sensor;
      const current = sensor.report ??
        legacyConfig ?? {
          enabled: false,
          interval: MIN_TELEMETRY_FREQUENCY_MS,
        };

      if (sensor.name !== row.telemetryKey) {
        return { ...rest, report: current };
      }

      return {
        ...rest,
        report: {
          ...current,
          enabled: row.collectionEnabled,
          interval: Math.min(
            MAX_TELEMETRY_FREQUENCY_MS,
            Math.max(MIN_TELEMETRY_FREQUENCY_MS, row.frequency)
          ),
        },
      };
    }),
  }));
}
