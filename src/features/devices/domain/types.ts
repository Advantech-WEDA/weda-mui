import type {
  DeploymentDeviceState,
  DeploymentStatusGroup,
} from '@features/ai-models';
export type TableHeaderSortKey = 'deviceId' | 'deviceName' | 'hwModel';

export type Status = 'Registered' | 'Activated' | 'Deactivated';

export type Connectivity = 'Connected' | 'Disconnected';

export type CollectionFilter = 'all' | 'enabled' | 'disabled';

export const LATEST_DATA_REFRESH_INTERVAL = 120000; // 2 minutes

export const AI_MODELS_REFRESH_INTERVAL = 5000; // 5 seconds

export const CONTAINER_STACKS_REFRESH_INTERVAL = 5000; // 5 seconds

export const TELEMETRY_REFRESH_INTERVAL = 5000; // 5 seconds

export function formatTelemetryName(name: string): string {
  return name
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export const MIN_TELEMETRY_FREQUENCY_MS = 1000;

export const MAX_TELEMETRY_FREQUENCY_MS = 86_400_000;

export interface IDeviceTelemetryTableItem {
  key: string;

  telemetryName: string;

  telemetryKey: string;

  value: string | number | boolean | undefined;

  lastUpdated: string | null;

  collectionEnabled: boolean;

  frequency: number;

  transmissionEnabled: boolean;
}

export interface StatusDialogContent {
  title: string;
  content: string;
  confirmLabel: string;
}

export interface DeviceAiModelRow {
  id: string;
  deviceId: string | null;
  modelId: string;
  modelName: string;
  edition: string;
  state: DeploymentDeviceState;
  statusGroup: DeploymentStatusGroup;
  dateModified: string | null;
  dateCreated: string;
  rejectedReason: string | null;
  isDeleted: boolean;
}

export interface DeviceAiModelRowActions {
  retry: boolean;
  delete: boolean;
}

export const DEVICE_AI_MODEL_ROW_ACTION_MAP: Record<
  DeploymentStatusGroup,
  DeviceAiModelRowActions
> = {
  InProgress: { retry: false, delete: true },
  Completed: { retry: false, delete: true },
  Failed: { retry: true, delete: true },
  Cancelled: { retry: false, delete: true },
};

export interface AiModelEditionOption {
  edition: string;
  fileName: string | null;
  disabled: boolean;
}

export interface AiModelDeployTableRow {
  modelId: string;
  modelName: string;
  editions: AiModelEditionOption[];
  selectedEdition: string;
}
