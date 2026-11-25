import type { Action, DeploymentAction, StackDeploymentStatus } from './types';

const RUNNING_ACTIONS: DeploymentAction[] = [
  'stop',
  'pause',
  'restart',
  'remove',
];

export const STACK_STATUS_ACTION_MAP: Record<
  StackDeploymentStatus,
  DeploymentAction[]
> = {
  unknown: ['remove'],
  pending: ['remove'],
  deploying: ['remove'],
  awaitingDeployedStatus: ['remove'],
  running: RUNNING_ACTIONS,
  deployed: RUNNING_ACTIONS,
  completed: ['remove'],
  exited: ['start', 'restart', 'remove'],
  paused: ['resume', 'stop', 'restart', 'remove'],
  stopped: ['start', 'restart', 'remove'],
  removing: [],
  awaitingRemovedStatus: [],
  awaitingCleanup: [],
  retry: ['remove'],
  error: ['redeploy', 'remove'],
};

const STACK_STATUS_ACTIONS_BY_LOWER_CASE = new Map<string, DeploymentAction[]>(
  Object.entries(STACK_STATUS_ACTION_MAP).map(([status, actions]) => [
    status.toLowerCase(),
    actions,
  ])
);

export const getDeploymentActions = (status?: string): DeploymentAction[] =>
  STACK_STATUS_ACTIONS_BY_LOWER_CASE.get(status?.toLowerCase() ?? '') ?? [
    'remove',
  ];

export const isRemoveAction = (action: DeploymentAction) => action === 'remove';

export const isRedeployAction = (action: DeploymentAction) =>
  action === 'redeploy';

export const isDeploymentApiAction = (
  action: DeploymentAction
): action is Action => {
  return action !== 'remove' && action !== 'redeploy';
};
