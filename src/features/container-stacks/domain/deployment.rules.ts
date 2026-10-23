import type { Action, DeploymentAction } from './types';

export const getDeploymentActions = (status?: string): DeploymentAction[] => {
  switch (status?.toLowerCase()) {
    case 'running':
      return ['stop', 'pause', 'restart', 'remove'];

    case 'paused':
      return ['resume', 'stop', 'restart', 'remove'];

    case 'exited':
      return ['start', 'restart', 'remove'];

    case 'retry':
      return ['remove'];

    case 'error':
      return ['restart', 'redeploy', 'remove'];

    default:
      return ['remove'];
  }
};

export const isRemoveAction = (action: DeploymentAction) => action === 'remove';

export const isRedeployAction = (action: DeploymentAction) =>
  action === 'redeploy';

export const isDeploymentApiAction = (
  action: DeploymentAction
): action is Action => {
  return action !== 'remove' && action !== 'redeploy';
};
