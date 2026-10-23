import { type SvgIcon } from '@shared/ui';
import type { ComponentProps } from 'react';

import type { ActivationAction } from '../domain/devicePolicy';

type SvgIconName = ComponentProps<typeof SvgIcon>['name'];

export const ACTIVATION_ACTION_ICON_MAP: Record<ActivationAction, SvgIconName> =
  {
    activate: 'CheckCircleOutlined',
    deactivate: 'BlockOutlined',
  };
