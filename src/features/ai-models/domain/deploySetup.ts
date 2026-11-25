export type DeployPreCheckAction = 'NOOP' | 'CHECK_DISK_USAGE';
export type DeployValidateAction = 'NOOP' | 'CHECKSUM_VERIFY';
export type DeployApplyAction = 'NOOP' | 'ATOMIC_SWAP_AND_RESTART_CONTAINER';
export type DeployPostCheckAction = 'NOOP';

export type ChecksumAlgorithm = 'sha256';

export interface DeploySetup {
  preCheck: DeployPreCheckAction;

  maxUsagePercent: string;
  validate: DeployValidateAction;

  algorithm: ChecksumAlgorithm;

  expectedChecksum: string;
  apply: DeployApplyAction;
  postCheck: DeployPostCheckAction;
}

export const DEFAULT_MAX_USAGE_PERCENT = '95';

export const DEFAULT_DEPLOY_SETUP: DeploySetup = {
  preCheck: 'NOOP',
  maxUsagePercent: DEFAULT_MAX_USAGE_PERCENT,
  validate: 'NOOP',
  algorithm: 'sha256',

  expectedChecksum: '',
  apply: 'NOOP',
  postCheck: 'NOOP',
};

export const PRE_CHECK_OPTIONS: {
  label: string;
  value: DeployPreCheckAction;
}[] = [
  { label: 'Noop', value: 'NOOP' },
  { label: 'Check disk usage', value: 'CHECK_DISK_USAGE' },
];

export const VALIDATE_OPTIONS: {
  label: string;
  value: DeployValidateAction;
}[] = [
  { label: 'Noop', value: 'NOOP' },
  { label: 'Checksum verify', value: 'CHECKSUM_VERIFY' },
];

export const ALGORITHM_OPTIONS: { label: string; value: ChecksumAlgorithm }[] =
  [{ label: 'SHA-256', value: 'sha256' }];

export const APPLY_OPTIONS: { label: string; value: DeployApplyAction }[] = [
  { label: 'Noop', value: 'NOOP' },
  {
    label: 'Atomic swap and restart container',
    value: 'ATOMIC_SWAP_AND_RESTART_CONTAINER',
  },
];

export const POST_CHECK_OPTIONS: {
  label: string;
  value: DeployPostCheckAction;
}[] = [{ label: 'Noop', value: 'NOOP' }];

const CHECKSUM_HEX_LENGTH: Record<ChecksumAlgorithm, number> = {
  sha256: 64,
};

const CONTAINER_NAME_PATTERN = /^[A-Za-z0-9_.@-]+$/;

export const isRestartContainerApply = (apply: DeployApplyAction) =>
  apply === 'ATOMIC_SWAP_AND_RESTART_CONTAINER';

export const normalizeChecksum = (value: string) =>
  value
    .trim()
    .replace(/^sha(256|512):/i, '')
    .toLowerCase();

export interface DeploySetupErrors {
  maxUsagePercent?: string;
  expectedChecksum?: string;
}

export const validateDeploySetup = (setup: DeploySetup): DeploySetupErrors => {
  const errors: DeploySetupErrors = {};

  if (setup.preCheck === 'CHECK_DISK_USAGE') {
    const value = setup.maxUsagePercent.trim();
    const percent = Number(value);

    if (!value) {
      errors.maxUsagePercent = 'Maximum disk usage is required';
    } else if (!Number.isInteger(percent) || percent < 1 || percent > 100) {
      errors.maxUsagePercent = 'Enter a whole number from 1 to 100';
    }
  }

  if (setup.validate === 'CHECKSUM_VERIFY') {
    const checksum = normalizeChecksum(setup.expectedChecksum);
    const length = CHECKSUM_HEX_LENGTH[setup.algorithm];

    if (!checksum) {
      errors.expectedChecksum = 'This edition has no file checksum';
    } else if (!/^[0-9a-f]+$/.test(checksum)) {
      errors.expectedChecksum =
        'This edition’s file checksum is not a hex digest';
    } else if (checksum.length !== length) {
      errors.expectedChecksum = `This checksum doesn’t match the selected algorithm (expected ${length} characters)`;
    }
  }

  return errors;
};

export type EditionChecksumStatus = 'idle' | 'loading' | 'loaded' | 'error';

export const parseEditionChecksum = (
  fileHash: string | null | undefined,
  hashAlg: string | null | undefined
): { expectedChecksum: string; algorithm?: ChecksumAlgorithm } => {
  const value = fileHash?.trim() ?? '';
  const separator = value.indexOf(':');
  const prefix = separator >= 0 ? value.slice(0, separator) : '';
  const expectedChecksum = (
    separator >= 0 ? value.slice(separator + 1) : value
  ).toLowerCase();

  const toAlgorithm = (raw: string | null | undefined) => {
    const name = raw?.toLowerCase().replace(/[^a-z0-9]/g, '');
    return name === 'sha256' ? name : undefined;
  };

  return {
    expectedChecksum,
    algorithm: toAlgorithm(hashAlg) ?? toAlgorithm(prefix),
  };
};

export type DeviceContainersState =
  | { status: 'loading' }
  | { status: 'loaded'; names: string[] }
  | { status: 'error' };

export const isValidContainerName = (name: string) =>
  CONTAINER_NAME_PATTERN.test(name);

export const getRunningContainerNames = (
  reported: Record<string, unknown> | null | undefined
): string[] => {
  const containers = reported?.containers;

  if (!Array.isArray(containers)) return [];

  const names = containers.flatMap((item): string[] => {
    if (typeof item === 'string') return [item];

    if (!item || typeof item !== 'object') return [];

    const record = item as Record<string, unknown>;
    const state = record.state ?? record.status;

    if (typeof state === 'string' && !/running|up/i.test(state)) return [];

    const name = record.name ?? record.containerName;

    return typeof name === 'string' ? [name.replace(/^\//, '')] : [];
  });

  return Array.from(new Set(names.filter(isValidContainerName)));
};
