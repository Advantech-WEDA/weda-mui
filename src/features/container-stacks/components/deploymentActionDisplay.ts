import { type SvgIcon } from '@shared/ui';
import type { ComponentProps } from 'react';

import type { DeploymentAction } from '../domain/types';

type SvgIconName = ComponentProps<typeof SvgIcon>['name'];

export const DEPLOYMENT_ACTION_LABEL_MAP: Record<DeploymentAction, string> = {
  start: 'Start',
  stop: 'Stop',
  pause: 'Pause',
  resume: 'Resume',
  restart: 'Restart',
  redeploy: 'Redeploy',
  remove: 'Remove',
};

export const DEPLOYMENT_ACTION_ICON_MAP: Record<DeploymentAction, SvgIconName> =
  {
    start: 'PlayCircleOutlined',
    stop: 'StopCircleOutlined',
    pause: 'PauseCircleOutlined',
    resume: 'RestartAltOutlined',
    restart: 'RestartAltOutlined',
    redeploy: 'InstallDesktopOutlined',
    remove: 'DeleteOutlined',
  };
