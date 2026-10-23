import { Chip } from '@mui/material';

import { resolveTone, type Tone, type ToneAppearance } from './tone';

export interface AppChipStyle {
  label: string;
  color: string;
  borderColor: string;
  backgroundColor?: string;
  cardColor?: string;
  cardBorderColor?: string;
  cardBackgroundColor?: string;
}

interface IProps {
  tone?: Tone;
  appearance?: ToneAppearance;

  label?: string;

  config?: AppChipStyle;
}

const FALLBACK_STYLE = {
  label: '-',
  color: 'var(--text-secondary)',
  borderColor: 'var(--divider)',
  backgroundColor: '#fff',
};

export default function AppChip({ tone, appearance, label, config }: IProps) {
  const style = config
    ? config
    : tone
      ? { label: label ?? '', ...resolveTone(tone, appearance) }
      : FALLBACK_STYLE;

  return (
    <Chip
      label={style.label}
      size="small"
      variant="outlined"
      className="app-chip"
      sx={{
        minHeight: '24px',
        maxHeight: '24px',
        fontWeight: 500,
        color: style.color,
        borderColor: style.borderColor,
        backgroundColor: style.backgroundColor,
      }}
    />
  );
}
