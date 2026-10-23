export type TableHeaderSortKey = 'modelName' | 'createdAt' | 'createdBy';

export type Status =
  | 'Pending'
  | 'Uploading'
  | 'Verifying'
  | 'Uploaded'
  | 'UploadFailed'
  | 'VerifyFailed'
  | 'Interrupted';

export type StatusGroup = 'InProgress' | 'Uploaded' | 'Interrupted' | 'Error';

export const STATUS_GROUP_MAP: Record<Status, StatusGroup> = {
  Pending: 'InProgress',
  Uploading: 'InProgress',
  Verifying: 'InProgress',
  Uploaded: 'Uploaded',
  UploadFailed: 'Error',
  VerifyFailed: 'Error',
  Interrupted: 'Interrupted',
};

export type DeploymentDeviceState =
  | 'SENT'
  | 'SERVERFILEPATH_OBTAINED'
  | 'EDGERECEIVED'
  | 'MODEL_STORAGE_CHECKED'
  | 'CAPACITY_CHECKED'
  | 'DOWNLOADING'
  | 'VERIFYING'
  | 'STAGING'
  | 'VALIDATED'
  | 'DEPLOYED'
  | 'REJECTED'
  | 'DELETED';

export type DeploymentStatusGroup =
  | 'InProgress'
  | 'Completed'
  | 'Failed'
  | 'Cancelled';

export const DEPLOYMENT_DEVICE_STATE_GROUP_MAP: Record<
  DeploymentDeviceState,
  DeploymentStatusGroup
> = {
  SENT: 'InProgress',
  SERVERFILEPATH_OBTAINED: 'InProgress',
  EDGERECEIVED: 'InProgress',
  MODEL_STORAGE_CHECKED: 'InProgress',
  CAPACITY_CHECKED: 'InProgress',
  DOWNLOADING: 'InProgress',
  VERIFYING: 'InProgress',
  STAGING: 'InProgress',
  VALIDATED: 'InProgress',
  DEPLOYED: 'Completed',
  REJECTED: 'Failed',
  DELETED: 'Cancelled',
};

export const getDeploymentStatusGroup = (
  state: string | null | undefined
): DeploymentStatusGroup =>
  (state &&
    DEPLOYMENT_DEVICE_STATE_GROUP_MAP[state as DeploymentDeviceState]) ||
  'InProgress';

export const isDeployAgainSelectable = (
  statusGroup: DeploymentStatusGroup
): boolean => statusGroup === 'Failed' || statusGroup === 'Cancelled';

export interface EditionDeploymentDeviceRow {
  id: string;
  deviceId: string;
  deviceName: string;
  state: DeploymentDeviceState;
  statusGroup: DeploymentStatusGroup;
  dateModified: string | null;
  dateCreated: string;
  rejectedReason: string | null;
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
