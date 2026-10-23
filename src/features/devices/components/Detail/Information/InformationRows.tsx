import { Paper } from '@mui/material';

import LabelValueRow from './LabelValueRow';
import { paperSx, plainLabelCellSx } from './tableCell.styles';
import type { InformationRows } from './types';

interface IProps {
  rows: InformationRows[];
}

export default function InformationRows({ rows }: IProps) {
  return (
    <Paper variant="outlined" sx={paperSx}>
      {rows.map((row, index) => (
        <LabelValueRow
          key={`${row.label}-${index}`}
          label={row.label}
          value={row.value}
          isLast={index === rows.length - 1}
          labelSx={plainLabelCellSx}
        />
      ))}
    </Paper>
  );
}
