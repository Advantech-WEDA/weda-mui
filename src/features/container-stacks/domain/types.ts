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

export type StackDeploymentStatus =
  | 'unknown'
  | 'pending'
  | 'deploying'
  | 'awaitingDeployedStatus'
  | 'running'
  | 'deployed'
  | 'completed'
  | 'exited'
  | 'paused'
  | 'stopped'
  | 'removing'
  | 'awaitingRemovedStatus'
  | 'awaitingCleanup'
  | 'retry'
  | 'error';

export const STACK_STATUS_CARD_MAP: Record<StackDeploymentStatus, Status> = {
  unknown: 'pending',
  pending: 'pending',
  deploying: 'deploying',
  awaitingDeployedStatus: 'deploying',
  removing: 'deploying',
  awaitingRemovedStatus: 'deploying',
  awaitingCleanup: 'deploying',
  running: 'running',
  deployed: 'running',
  completed: 'running',
  paused: 'paused',
  error: 'error',
  exited: 'exited',
  stopped: 'exited',
  retry: 'retry',
};

const STACK_STATUS_CARD_BY_LOWER_CASE = new Map<string, Status>(
  Object.entries(STACK_STATUS_CARD_MAP).map(([status, card]) => [
    status.toLowerCase(),
    card,
  ])
);

export const getStackStatusCard = (status?: string | null): Status =>
  STACK_STATUS_CARD_BY_LOWER_CASE.get(status?.toLowerCase() ?? '') ?? 'pending';

export const countStackStatusCards = (
  items: { status?: string | null }[]
): Record<Status, number> => {
  const counts: Record<Status, number> = {
    pending: 0,
    deploying: 0,
    running: 0,
    paused: 0,
    error: 0,
    exited: 0,
    retry: 0,
  };

  items.forEach((item) => {
    counts[getStackStatusCard(item.status)] += 1;
  });

  return counts;
};

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
