import type { AnalyzerType } from '@features/analyzers';
import type { AppChip, Tone } from '@shared/ui';
import type { ComponentProps } from 'react';

export const ANALYZER_TYPE_CONFIG = {
  TransferFunction: {
    label: 'Transfer function',
    menuLabel: 'Transfer Function',
    tone: 'primary',
  },
  JavaScript: {
    label: 'JavaScript',
    menuLabel: 'JavaScript',
    tone: 'secondary',
  },
} satisfies Partial<
  Record<AnalyzerType, { label: string; menuLabel: string; tone: Tone }>
>;

type ConfiguredAnalyzerType = keyof typeof ANALYZER_TYPE_CONFIG;

export const ANALYZER_TYPES = Object.keys(
  ANALYZER_TYPE_CONFIG
) as ConfiguredAnalyzerType[];

export function analyzerTypeChipProps(
  type: string | null | undefined
): ComponentProps<typeof AppChip> {
  const config = ANALYZER_TYPE_CONFIG[type as ConfiguredAnalyzerType];

  return {
    tone: config?.tone ?? 'neutral',
    appearance: 'outlined',
    label: config?.label ?? type ?? '-',
  };
}
