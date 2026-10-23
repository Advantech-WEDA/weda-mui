import type {
  AppChipStyle,
  StatusCardOption,
  Tone,
  ToneAppearance,
} from '@shared/ui';

import type { Connectivity, Status } from '../domain/types';

export interface StatusChipProps {
  label?: string;
  tone?: Tone;
  appearance?: ToneAppearance;

  config?: AppChipStyle;
}

const STATUS_LABELS: Record<Status, string> = {
  Registered: 'Registered',
  Activated: 'Activated',
  Deactivated: 'Deactivated',
};

const STATUS_CHIP_TONES: Record<Status, Tone> = {
  Registered: 'info',
  Activated: 'success',
  Deactivated: 'error',
};

const STATUS_CARD_TONES: Record<Status, Tone> = {
  Registered: 'neutral',
  Activated: 'success',
  Deactivated: 'error',
};

const STATUSES = Object.keys(STATUS_LABELS) as Status[];

export const statusOptions: StatusCardOption<Status>[] = STATUSES.map(
  (value) => ({
    value,
    label: STATUS_LABELS[value],
    tone: STATUS_CARD_TONES[value],
  })
);

export function deviceStatusChipProps(status?: string): StatusChipProps {
  const tone = STATUS_CHIP_TONES[status as Status];

  return tone
    ? { label: STATUS_LABELS[status as Status], tone, appearance: 'filled' }
    : {};
}

const CONNECTED_CHIP: AppChipStyle = {
  label: 'Connected',
  color: 'var(--success-main, #2E7D32)',
  backgroundColor: 'var(--_components-paper-elevation-0, #FFF)',
  borderColor: 'var(--success-main, #2E7D32)',
};

export function connectivityChipProps(
  connectivity?: Connectivity
): StatusChipProps {
  if (connectivity === 'Connected') return { config: CONNECTED_CHIP };

  if (connectivity === 'Disconnected') {
    return { label: 'Disconnected', tone: 'neutral', appearance: 'outlined' };
  }

  return {};
}
