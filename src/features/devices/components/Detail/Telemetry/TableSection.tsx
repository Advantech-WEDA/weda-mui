import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Pagination } from '@shared/ui';

import type { IDeviceTelemetryTableItem } from '../../../domain/types';
import TableContent from './TableContent';

interface IProps {
  rows: IDeviceTelemetryTableItem[];
  editingKey: string | null;
  hasPermission: boolean;
  totalCount: number;
  page: number;
  rowsPerPage: number;
  loading?: boolean;
  hasFilter?: boolean;
  onStartEdit: (row: IDeviceTelemetryTableItem) => void;
  onCancelEdit: () => void;
  onSaveEdit: (row: IDeviceTelemetryTableItem) => void;
  onFrequencyChange: (value: number) => void;

  onClearAll: () => void;
  onPageChange: (e: unknown, newPage: number) => void;
  onRowsPerPageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCollectionChange: (checked: boolean) => void;
}

export default function TableSection({
  rows,
  editingKey,
  hasPermission,
  totalCount,
  page,
  rowsPerPage,
  loading,
  hasFilter,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onFrequencyChange,
  onCollectionChange,
  onClearAll,
  onPageChange,
  onRowsPerPageChange,
}: IProps) {
  const isEmpty = !loading && rows.length === 0;

  const isFilterEmpty = isEmpty && hasFilter;

  const isInitialEmpty = isEmpty && !hasFilter;

  return (
    <Paper variant="outlined" sx={{ m: 2 }}>
      <TableContainer
        className="page-table-wrap"
        component={Paper}
        elevation={0}
      >
        <Table className="page-table">
          <TableHead>
            <TableRow className="page-table-row">
              <TableCell>Telemetry name / Key</TableCell>

              <TableCell sx={{ width: 200 }}>Value</TableCell>

              <TableCell sx={{ width: 200 }}>Last updated</TableCell>

              <TableCell sx={{ width: 200 }}>Enabled</TableCell>

              <TableCell sx={{ width: 200 }}>Interval</TableCell>

              <TableCell sx={{ width: 200 }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isInitialEmpty ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ p: 0 }}>
                  <Box className="page-table-empty-state">
                    <Typography variant="h5" color="text.secondary">
                      No telemetry data available.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : isFilterEmpty ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Box className="search-empty">
                    <Typography variant="h5" gutterBottom>
                      No results found
                    </Typography>

                    <Typography
                      variant="body1"
                      color="text.secondary"
                      className="search-empty-desc"
                    >
                      Try adjusting your filters.
                    </Typography>

                    <Button
                      variant="outlined"
                      className="search-empty-btn"
                      onClick={onClearAll}
                    >
                      Clear all
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableContent
                  row={row}
                  editingKey={editingKey}
                  hasPermission={hasPermission}
                  onStartEdit={onStartEdit}
                  onCancelEdit={onCancelEdit}
                  onSaveEdit={onSaveEdit}
                  onFrequencyChange={onFrequencyChange}
                  onCollectionChange={onCollectionChange}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {rows.length !== 0 && (
        <Pagination
          count={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      )}
    </Paper>
  );
}
