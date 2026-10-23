export type TableHeaderSortKey = 'createdAt';

export const DEFAULT_STACK_TYPE = 'compose';

export type Status =
  | 'pending' //
  | 'deploying' //
  | 'running' //
  | 'paused' //
  | 'error' //
  | 'exited' //
  | 'retry';

export type Action =
  | 'start'
  | 'stop'
  | 'resume'
  | 'restart'
  | 'pause'
  | 'remove'
  | 'redeploy';

export type Connectivity = 'Connected' | 'Disconnected';

export const DEPLOYMENTS_REFRESH_INTERVAL = 5000; // 5 seconds

export interface IStackErrors {
  stackName: boolean;
  type: boolean;
  stackFile: { type: boolean; message: string };
}

export interface IEnvironmentVariable {
  id: string;
  key: string;
  value: string;
}

export interface DeploymentDeviceRow {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceStatus: string;
  deviceCreationTime: string;
  status: string;
  dateModified: string;
  dateCreated: string;
  containers: DeploymentContainerRow[];
  stackName: string;
  version: string;
}

export interface DeploymentContainerRow {
  id: string;
  name: string;
  state: string;
  error: string | null;
}

export interface StackVersionItem {
  stackRevisionId: string;
  version: number;
}

export interface ContainerStackTableRow {
  stackConfigId: string;
  stackName: string;
  type: string;
  orgId: string;
  selectedVersion: number;
  versions: StackVersionItem[];
  currentVersion: StackVersionItem;
}

export type DeploymentAction =
  | 'start'
  | 'stop'
  | 'pause'
  | 'resume'
  | 'restart'
  | 'redeploy'
  | 'remove';
