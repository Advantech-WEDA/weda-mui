import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';

import type { IDeviceData } from '../api/devices.api.types';

interface IProps {
  deviceData: IDeviceData | null;
}

const labelsWidth = 200;

const DeviceDetailTable = ({ deviceData }: IProps) => {
  const rows = useMemo(() => {
    if (!deviceData) return [];
    return Object.entries(deviceData).map(([key, value]) => {
      return { label: key, value: value === null ? '-' : `${value}` };
    });
  }, [deviceData]);

  return deviceData === null ? (
    <Typography>No data</Typography>
  ) : (
    <TableContainer
      sx={{
        maxWidth: 1280,
        border: '1px solid var(--components-paper-outlineBorder)',
        borderRadius: 2,
      }}
    >
      <Table>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.label}
              sx={{
                '& td': {
                  borderBottomColor: 'var(--components-paper-outlineBorder)',
                },
                '&:last-child td': {
                  borderBottom: 'none',
                },
              }}
            >
              <TableCell sx={{ width: labelsWidth, fontWeight: 'bold' }}>
                {row.label}
              </TableCell>
              <TableCell>{row.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DeviceDetailTable;
