import type { AppChipStyle, Tone, ToneAppearance } from '@shared/ui';

export interface StatusChipProps {
  label?: string;
  tone?: Tone;
  appearance?: ToneAppearance;

  config?: AppChipStyle;
}

type ToneEntry = { label: string; tone: Tone };

const DEPLOYMENT_STATUS_TONES: Record<string, ToneEntry> = {
  running: { label: 'Running', tone: 'success' },
  deploying: { label: 'Deploying', tone: 'info' },
  paused: { label: 'Paused', tone: 'warning' },
  error: { label: 'Error', tone: 'error' },
  pending: { label: 'Pending', tone: 'info' },
  exited: { label: 'Exited', tone: 'error' },
  retry: { label: 'Retrying', tone: 'error' },
};

const CONTAINER_STATUS_TONES: Record<string, ToneEntry> = {
  running: { label: 'Running', tone: 'success' },
  deploying: { label: 'Deploying', tone: 'info' },
  paused: { label: 'Paused', tone: 'warning' },
  error: { label: 'Error', tone: 'error' },
  pending: { label: 'Pending', tone: 'info' },
  exited: { label: 'Exited', tone: 'secondary' },
  retry: { label: 'Retrying', tone: 'neutral' },
};

const UNKNOWN_DEPLOYMENT_STATUS: AppChipStyle = {
  label: 'Unknown',
  color: '#757575',
  backgroundColor: '#F5F5F5',
  borderColor: '#757575',
};

const UNKNOWN_CONTAINER_STATUS: AppChipStyle = {
  label: 'Unknown',
  color: 'var(--text-primary, rgba(0, 0, 0, 0.87))',
  backgroundColor: '#F5F5F5',
  borderColor: '#757575',
};

export function deploymentStatusChipProps(status?: string): StatusChipProps {
  if (status === 'unknown') return { config: UNKNOWN_DEPLOYMENT_STATUS };

  const entry = DEPLOYMENT_STATUS_TONES[status ?? ''];

  return entry ? { ...entry, appearance: 'outlined' } : {};
}

export function containerStatusChipProps(status?: string): StatusChipProps {
  if (status === 'unknown') return { config: UNKNOWN_CONTAINER_STATUS };

  const entry = CONTAINER_STATUS_TONES[status ?? ''];

  return entry ? { ...entry, appearance: 'filled' } : {};
}
