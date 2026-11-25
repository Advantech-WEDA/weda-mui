import type {
  DataStreamDataType,
  DataStreamSourceType,
} from '@features/data-streams';
import type {
  AppChip,
  AppChipStyle,
  SelectOption,
  SvgIcon,
  Tone,
} from '@shared/ui';
import type { ComponentProps } from 'react';

const DATA_SOURCE_TYPE_TONES: Partial<Record<DataStreamSourceType, Tone>> = {
  CustomDevice: 'primary',
  Analyzer: 'success',
  WedaNode: 'warning',
  WedaSubNode: 'warning',
};

const SURFACE = 'var(--_components-paper-elevation-0, #FFF)';

const greyChip = (label: string, grey: string): AppChipStyle => ({
  label,
  color: grey,
  borderColor: grey,
  backgroundColor: SURFACE,
});

export function dataSourceChipProps(
  type: string | null | undefined
): ComponentProps<typeof AppChip> {
  if (!type) {
    return {
      config: {
        ...greyChip(
          'Unbound',
          'var(--_components-chip-defaultEnabledBorder, #BDBDBD)'
        ),
        color: 'var(--text-primary, rgba(0, 0, 0, 0.87))',
      },
    };
  }

  const tone = DATA_SOURCE_TYPE_TONES[type as DataStreamSourceType];

  if (!tone) {
    return {
      config: greyChip(type, 'var(--mui-palette-grey-400, #bdbdbd)'),
    };
  }

  return { tone, appearance: 'outlined', label: type };
}

export const DATA_TYPE_CONFIG: Record<
  DataStreamDataType,
  {
    label: string;
    badge: string;
    icon?: ComponentProps<typeof SvgIcon>['name'];
  }
> = {
  double: { label: 'Double', badge: '1.0', icon: 'Speed025Outlined' },
  integer: { label: 'Integer', badge: '123', icon: 'NumberOutlined' },
  boolean: { label: 'Boolean', badge: '0/1', icon: 'FlakyOutlined' },
  string: { label: 'String', badge: 'abc', icon: 'AbcOutlined' },
  long: { label: 'Long', badge: '123' },
  'application/json': { label: 'JSON', badge: 'JSON' },
  'application/octet-stream': { label: 'Binary', badge: 'BIN' },
  'image/png': { label: 'PNG image', badge: 'IMG' },
  'image/jpeg': { label: 'JPEG image', badge: 'IMG' },
  'image/jpg': { label: 'JPG image', badge: 'IMG' },
};

export const dataTypeOptions: SelectOption[] = Object.entries(
  DATA_TYPE_CONFIG
).map(([value, { label }]) => ({ value, label }));
