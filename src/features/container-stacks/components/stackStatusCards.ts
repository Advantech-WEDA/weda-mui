import { buildCardOptions, type StatusCardOption } from '@shared/ui';

import type { Status } from '../domain/types';

const STATUS_CARD_CONFIG = {
  pending: {
    label: 'Pending',
    cardColor: 'var(--text-primary, rgba(0, 0, 0, 0.87))',
    cardBorderColor:
      'var(--_components-paper-outlineBorder, rgba(0, 0, 0, 0.12))',
    cardBg: 'var(--_components-paper-elevation-0, #FFF)',
  },
  deploying: {
    label: 'Deploying',
    cardColor: 'var(--text-primary, rgba(0, 0, 0, 0.87))',
    cardBorderColor:
      'var(--_components-paper-outlineBorder, rgba(0, 0, 0, 0.12))',
    cardBg: 'var(--_components-paper-elevation-0, #FFF)',
  },
  running: {
    label: 'Running',
    cardColor: 'var(--success-main, #2E7D32)',
    cardBorderColor:
      'var(--_components-paper-outlineBorder, rgba(0, 0, 0, 0.12))',
    cardBg: 'var(--_components-alert-success-background, #EDF7ED)',
  },

  paused: {
    label: 'Paused',
    cardColor: 'var(--warning-main, #EF6C00)',
    cardBg: 'var(--_components-alert-warning-background, #FFF4E5)',
    cardBorderColor:
      'var(--_components-paper-outlineBorder, rgba(0, 0, 0, 0.12))',
  },

  error: {
    label: 'Error',
    cardColor: 'var(--error-main, #D32F2F)',
    cardBg: 'var(--_components-alert-error-background, #FDEDED)',
    cardBorderColor:
      'var(--_components-paper-outlineBorder, rgba(0, 0, 0, 0.12))',
  },
  exited: {
    label: 'Exited',
    cardColor: 'var(--text-primary, rgba(0, 0, 0, 0.87))',
    cardBorderColor:
      'var(--_components-paper-outlineBorder, rgba(0, 0, 0, 0.12))',
    cardBg: 'var(--_components-paper-elevation-0, #FFF)',
  },
  retry: {
    label: 'Retrying',
    cardColor: 'var(--text-primary, rgba(0, 0, 0, 0.87))',
    cardBorderColor:
      'var(--_components-paper-outlineBorder, rgba(0, 0, 0, 0.12))',
    cardBg: 'var(--_components-paper-elevation-0, #FFF)',
  },
} as const;

export const statusOptions: StatusCardOption<Status>[] = buildCardOptions(
  STATUS_CARD_CONFIG,
  (config) => ({
    label: config.label,
    color: config.cardColor,
    bg: config.cardBg,
    borderColor: config.cardBorderColor,
  })
);
