import './StatusCard.scss';

import { Box, Typography } from '@mui/material';

import { resolveTone, type Tone } from './tone';

export interface StatusCardOption<T extends string = string> {
  label: string;
  value: T;

  tone?: Tone;

  color?: string;
  bg?: string;
  borderColor?: string;
}

interface IProps<T extends string = string> {
  value: T | '';
  onChange: (value: T | '') => void;
  counts: Partial<Record<T, number>>;
  options: StatusCardOption<T>[];
  disabled?: boolean;
}

export default function StatusCard<T extends string = string>({
  value,
  onChange,
  counts,
  options,
  disabled = false,
}: IProps<T>) {
  return (
    <Box className="device-status">
      {options.map((item) => {
        const active = value === item.value;

        const toned = item.tone ? resolveTone(item.tone, 'soft') : null;
        const color = item.color ?? toned?.color;
        const backgroundColor = item.bg ?? toned?.backgroundColor;

        const borderColor = item.borderColor ?? color;

        return (
          <Box
            key={item.value}
            onClick={
              disabled ? undefined : () => onChange(active ? '' : item.value)
            }
            className={`device-status__card ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
            sx={{
              backgroundColor,
              cursor: disabled ? 'not-allowed' : 'pointer',
              pointerEvents: disabled ? 'none' : 'auto',
              borderWidth: active ? 2 : 1,
              borderStyle: 'solid',
              borderColor,
              '&:hover': {
                borderColor,
              },
            }}
          >
            <Typography
              variant="subtitle2"
              className="device-status__label"
              sx={{ color }}
            >
              {item.label}
            </Typography>

            <Typography
              variant="h4"
              className="device-status__value"
              sx={{ color }}
            >
              {counts[item.value] ?? 0}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
