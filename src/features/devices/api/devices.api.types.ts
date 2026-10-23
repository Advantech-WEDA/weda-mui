export interface IDeviceItem {
  deviceId: string;
  deviceName: string;

  hwModel: string | null;
  parentDeviceId?: string | null;

  type?: string;
  connectivity?: IDeviceConnectivity;
  orgId: string;
  status: string;
  createdAt: string;
  lastSeen?: string;
  latestData?: IDataStreamsLatestResponse;
}

export interface IDeviceConnectivity {
  state: 'Connected' | 'Abnormal' | 'Disconnected' | 'Unknown';
  updatedAt: string | null;
}

export interface IDeviceListResponse {
  items: IDeviceItem[];
  totalCount: number;
}

export interface IDataStreamLatestItem {
  dataStreamId: string;
  dataStreamName: string;
  dataType: string;
  displayName: string;
  unitDisplay: string;

  dataObject: {
    timestamp: string;
    value: unknown;
  } | null;
}

export interface IDataStreamsLatestResponse {
  deviceId: string;
  time: string;
  dataStreams: IDataStreamLatestItem[];
}

export interface IDeviceDataResponse {
  items: {
    deviceId: string;
    time: string;
    dataObjects: IDeviceData;
    dataTypes: string[];
  }[];
  nextCursor: number;
  hasMore: boolean;
  totalCount: number;
}

export interface IDeviceData {
  cpuUsage: number | null;
  memoryCached: number | null;
  diskRootTotal: number | null;
  cpuLoad1m: number | null;
  cpuLoad5m: number | null;
  memoryUsed: number | null;
  diskRootUsed: number | null;
  cpuLoad15m: number | null;
  memoryAvailable: number | null;
  memoryTotal: number | null;
  diskRootUsagePercent: number | null;
  gpioIsSupported: boolean | null;
  diskRootAvailable: number | null;
}

export interface IDeviceCapabilityResponse {
  cmd: string;
  seqId: number;

  data: {
    deviceCapsDto: IDeviceCapabilityItem[];
  };
}

export interface IDeviceCapabilityItem {
  createdAt: string;
  groupId: string;
  deviceId: string;
  data: {
    reported: Record<string, unknown>;
    desired: Record<string, unknown>;
  };
}

export interface IDeviceTelemetryConfigResponse {
  enabled: boolean;
  deviceName: string;
  sensors: IDeviceTelemetrySensor[];

  status?: string | null;
  appliedAt?: string | null;
  errorMessage?: string | null;
  updatedAt?: string | null;
}

export interface IDeviceTelemetryReport {
  enabled: boolean;
  interval: number;
  record?: boolean;
}

export interface IDeviceTelemetrySensor {
  name: string;

  report?: IDeviceTelemetryReport;
  config?: IDeviceTelemetryReport;
  sensorInfo?: {
    schema: string;
    displayName: string;
    description: string;
  };
  parameters?: unknown;
  unit?: string | null;

  transformPipeline?: unknown;
  dspPipeline?: unknown;
  thresholds?: unknown;
}

export interface IDeviceTelemetryLatestResponse {
  deviceId: string;

  time: string;

  dataObjects: Record<string, unknown>;

  dataTypes: string[];
}
