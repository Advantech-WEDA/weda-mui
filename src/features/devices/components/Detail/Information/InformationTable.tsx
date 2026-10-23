import { Box, Paper } from '@mui/material';

import LabelValueRow from './LabelValueRow';
import { formatLabel, formatValue } from './mapper';
import { headerCellSx, paperSx } from './tableCell.styles';

interface IProps {
  columns: string[];
  rows: Record<string, unknown>[];
}

const getItemTitle = (row: Record<string, unknown>, index: number) => {
  return (
    row.resourceName ||
    row.name ||
    row.containerName ||
    row.deviceName ||
    row.interfaceType ||
    `Item ${index + 1}`
  );
};

export default function InformationTable({ columns, rows }: IProps) {
  if (rows.length === 0) {
    return <Box sx={{ p: 2, color: 'var(--text-secondary)' }}>No data</Box>;
  }

  const dataColumns = columns.filter(
    (column) => !column.toLowerCase().includes('name')
  );

  return (
    <Paper variant="outlined" sx={paperSx}>
      {rows.map((row, rowIndex) => (
        <Box key={rowIndex}>
          <Box sx={headerCellSx}>{String(getItemTitle(row, rowIndex))}</Box>

          {dataColumns.map((column, columnIndex) => (
            <LabelValueRow
              key={`${rowIndex}-${column}`}
              label={formatLabel(column)}
              value={formatValue(row[column])}
              isLast={
                rowIndex === rows.length - 1 &&
                columnIndex === dataColumns.length - 1
              }
            />
          ))}
        </Box>
      ))}
    </Paper>
  );
}
