import {
  buildCardOptions,
  type StatusCardOption,
  type Tone,
  type ToneAppearance,
} from '@shared/ui';

import type { Status, StatusGroup } from '@/features/ai-models/domain/types';

export interface StatusChipProps {
  label?: string;
  tone?: Tone;
  appearance?: ToneAppearance;
}

const STATUS_CHIPS: Record<Status, { label: string; tone: Tone }> = {
  Pending: { label: 'Pending', tone: 'info' },
  Uploading: { label: 'Uploading', tone: 'info' },
  Verifying: { label: 'Verifying', tone: 'info' },
  Uploaded: { label: 'Uploaded', tone: 'success' },
  UploadFailed: { label: 'Upload failed', tone: 'error' },
  VerifyFailed: { label: 'Verify failed', tone: 'error' },
  Interrupted: { label: 'Interrupted', tone: 'warning' },
};

export function uploadStatusChipProps(status?: Status | null): StatusChipProps {
  const entry = status ? STATUS_CHIPS[status] : undefined;

  return entry ? { ...entry, appearance: 'filled' } : {};
}

const STATUS_CARD_CONFIG: Record<
  StatusGroup,
  { label: string; cardColor: string; cardBorderColor: string; cardBg: string }
> = {
  InProgress: {
    label: 'In progress',
    cardColor: 'var(--text-primary, rgba(0, 0, 0, 0.87))',
    cardBorderColor:
      'var(--_components-paper-outlineBorder, rgba(0, 0, 0, 0.12))',
    cardBg: 'var(--_components-paper-elevation-0, #FFF)',
  },
  Uploaded: {
    label: 'Uploaded',
    cardColor: 'var(--success-main, #2E7D32)',
    cardBorderColor:
      'var(--_components-paper-outlineBorder, rgba(0, 0, 0, 0.12))',
    cardBg: 'var(--_components-alert-success-background, #EDF7ED)',
  },
  Interrupted: {
    label: 'Interrupted',
    cardColor: 'var(--warning-main, #EF6C00)',
    cardBorderColor:
      'var(--_components-paper-outlineBorder, rgba(0, 0, 0, 0.12))',
    cardBg: 'var(--_components-alert-warning-background, #FFF4E5)',
  },
  Error: {
    label: 'Error',
    cardColor: 'var(--error-main, #D32F2F)',
    cardBorderColor:
      'var(--_components-paper-outlineBorder, rgba(0, 0, 0, 0.12))',
    cardBg: 'var(--_components-alert-error-background, #FDEDED)',
  },
};

export const statusOptions: StatusCardOption<StatusGroup>[] = buildCardOptions(
  STATUS_CARD_CONFIG,
  (config) => ({
    label: config.label,
    color: config.cardColor,
    bg: config.cardBg,
    borderColor: config.cardBorderColor,
  })
);
