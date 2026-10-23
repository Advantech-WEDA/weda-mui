import {
  buildCardOptions,
  type StatusCardOption,
  type Tone,
  type ToneAppearance,
} from '@shared/ui';

import type {
  DeploymentDeviceState,
  DeploymentStatusGroup,
} from '@/features/ai-models/domain/types';
import { getDeploymentStatusGroup } from '@/features/ai-models/domain/types';

export interface StatusChipProps {
  label?: string;
  tone?: Tone;
  appearance?: ToneAppearance;
}

const STATUS_CHIPS: Record<
  DeploymentStatusGroup,
  { label: string; tone: Tone }
> = {
  InProgress: { label: 'Deploying', tone: 'info' },
  Completed: { label: 'Deployed', tone: 'success' },
  Failed: { label: 'Rejected', tone: 'error' },
  Cancelled: { label: 'Deleted', tone: 'neutral' },
};

export function editionDeploymentStatusChipProps(
  statusGroup?: DeploymentStatusGroup | null
): StatusChipProps {
  const entry = statusGroup ? STATUS_CHIPS[statusGroup] : undefined;

  return entry ? { ...entry, appearance: 'filled' } : {};
}

const STATUS_CARD_CONFIG: Record<
  DeploymentStatusGroup,
  { label: string; cardColor: string; cardBorderColor: string; cardBg: string }
> = {
  InProgress: {
    label: 'Deploying',
    cardColor: 'var(--text-primary)',
    cardBorderColor: 'var(--_components-paper-outlineBorder)',
    cardBg: 'var(--_components-paper-elevation-0)',
  },
  Completed: {
    label: 'Deployed',
    cardColor: 'var(--success-main)',
    cardBorderColor: 'var(--_components-paper-outlineBorder)',
    cardBg: 'var(--_components-alert-success-background)',
  },
  Failed: {
    label: 'Rejected',
    cardColor: 'var(--error-main)',
    cardBorderColor: 'var(--_components-paper-outlineBorder)',
    cardBg: 'var(--_components-alert-error-background)',
  },
  Cancelled: {
    label: 'Deleted',
    cardColor: 'var(--text-primary)',
    cardBorderColor: 'var(--_components-paper-outlineBorder)',
    cardBg: 'var(--_components-paper-elevation-0)',
  },
};

export const editionDeploymentStatusOptions: StatusCardOption<DeploymentStatusGroup>[] =
  buildCardOptions(STATUS_CARD_CONFIG, (config) => ({
    label: config.label,
    color: config.cardColor,
    bg: config.cardBg,
    borderColor: config.cardBorderColor,
  }));

const DEPLOYMENT_DEVICE_STATE_LABELS: Record<DeploymentDeviceState, string> = {
  SENT: 'Sent',
  SERVERFILEPATH_OBTAINED: 'Server path obtained',
  EDGERECEIVED: 'Received by edge',
  MODEL_STORAGE_CHECKED: 'Storage checked',
  CAPACITY_CHECKED: 'Capacity checked',
  DOWNLOADING: 'Downloading',
  VERIFYING: 'Verifying',
  STAGING: 'Staging',
  VALIDATED: 'Validated',
  DEPLOYED: 'Deployed',
  REJECTED: 'Rejected',
  DELETED: 'Deleted',
};

export function editionDeploymentStateChipProps(
  state?: DeploymentDeviceState | null
): StatusChipProps {
  if (!state) return {};

  const group = getDeploymentStatusGroup(state);

  return {
    label: DEPLOYMENT_DEVICE_STATE_LABELS[state] ?? state,
    tone: STATUS_CHIPS[group].tone,
    appearance: 'filled',
  };
}
