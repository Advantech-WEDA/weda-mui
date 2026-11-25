import type { SelectOption, StatusCardOption, Tone } from '@shared/ui';

import type { BridgeDisplayStatus } from '../domain/types';

const STATUS_CHIP_TONES: Record<BridgeDisplayStatus, Tone> = {
  Running: 'success',
  Error: 'error',
  Disabled: 'neutral',
};

const CARD_STATUSES: { value: BridgeDisplayStatus; tone: Tone }[] = [
  { value: 'Running', tone: 'success' },
  { value: 'Error', tone: 'error' },
  { value: 'Disabled', tone: 'neutral' },
];

const CARD_BORDER =
  'var(--_components-paper-outlineBorder, rgba(0, 0, 0, 0.12))';

export const bridgeStatusCardOptions: StatusCardOption<BridgeDisplayStatus>[] =
  CARD_STATUSES.map(({ value, tone }) => ({
    value,
    label: value,
    tone,
    borderColor: CARD_BORDER,
  }));

export const bridgeStatusFilterOptions: SelectOption[] = (
  Object.keys(STATUS_CHIP_TONES) as BridgeDisplayStatus[]
).map((value) => ({ label: value, value }));

export function bridgeStatusChipProps(status: BridgeDisplayStatus | null) {
  return status
    ? {
        label: status,
        tone: STATUS_CHIP_TONES[status],
        appearance: 'tinted' as const,
      }
    : {};
}
