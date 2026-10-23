import { Box, Stack, type SxProps, type Theme } from '@mui/material';

import { labelCellSx, rowSx, valueCellSx } from './tableCell.styles';

interface IProps {
  label: React.ReactNode;
  value: React.ReactNode;
  isLast: boolean;
  labelSx?: SxProps<Theme>;
}

export default function LabelValueRow({
  label,
  value,
  isLast,
  labelSx = labelCellSx,
}: IProps) {
  return (
    <Stack direction="row" sx={rowSx(isLast)}>
      <Box sx={labelSx}>{label}</Box>
      <Box sx={valueCellSx}>{value}</Box>
    </Stack>
  );
}
