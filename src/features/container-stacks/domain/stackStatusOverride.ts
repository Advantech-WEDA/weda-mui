import { getStackStatusCard } from './types';

interface StackRef {
  deviceId: string;
  stackConfigId: string;
}

export interface StackStatusOverride extends StackRef {
  status: string;
  expiresAt: number;
}

export const STACK_STATUS_OVERRIDE_TTL_MS = 15_000;

const isSameStack = (a: StackRef, b: StackRef) =>
  a.deviceId === b.deviceId && a.stackConfigId === b.stackConfigId;

export const upsertStackStatusOverride = (
  overrides: StackStatusOverride[],
  override: StackStatusOverride
): StackStatusOverride[] => [
  ...overrides.filter((item) => !isSameStack(item, override)),
  override,
];

export const applyStackStatusOverrides = <
  T extends StackRef & { status: string },
>(
  items: T[],
  overrides: StackStatusOverride[],
  now: number
): { items: T[]; overrides: StackStatusOverride[] } => {
  const live = overrides.filter((override) => override.expiresAt > now);
  const caughtUp = new Set<StackStatusOverride>();

  const patched = items.map((item) => {
    const override = live.find((candidate) => isSameStack(candidate, item));

    if (!override) return item;

    if (
      getStackStatusCard(item.status) === getStackStatusCard(override.status)
    ) {
      caughtUp.add(override);

      return item;
    }

    return { ...item, status: override.status };
  });

  return {
    items: patched,
    overrides: live.filter((override) => !caughtUp.has(override)),
  };
};
