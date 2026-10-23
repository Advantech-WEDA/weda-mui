import type { AppChipStyle } from './AppChip';
import type { StatusCardOption } from './StatusCard';

export function buildLabelMap<K extends string, C extends { label: string }>(
  config: Record<K, C>
): Record<K, string> {
  return Object.fromEntries(
    Object.entries(config).map(([key, value]) => [key, (value as C).label])
  ) as Record<K, string>;
}

export function buildChipMap<K extends string, C>(
  config: Record<K, C>,
  toChipStyle: (value: C, key: K) => AppChipStyle
): Record<K, AppChipStyle> {
  return Object.fromEntries(
    Object.entries(config).map(([key, value]) => [
      key,
      toChipStyle(value as C, key as K),
    ])
  ) as Record<K, AppChipStyle>;
}

export function buildCardOptions<K extends string, C>(
  config: Record<K, C>,
  toCardOption: (value: C, key: K) => Omit<StatusCardOption<K>, 'value'>
): StatusCardOption<K>[] {
  return Object.entries(config).map(([key, value]) => ({
    value: key as K,
    ...toCardOption(value as C, key as K),
  }));
}
