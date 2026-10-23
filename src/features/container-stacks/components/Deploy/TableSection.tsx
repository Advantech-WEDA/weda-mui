import type { TableHeaderSortKey } from '@features/devices';
import {
  Box,
  Button,
  Checkbox,
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
import { Pagination, type SortOrder, SortTableHeader } from '@shared/ui';

import type { DeployDeviceRow } from '../../api/stacks.api.types';
import TableContent from './TableContent';

interface IProps {
  rows: DeployDeviceRow[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  loading?: boolean;
  hasFilter?: boolean;
  sortKey: TableHeaderSortKey;
  sortOrder: SortOrder;
  selectedDeviceIds: string[];
  disabledDeviceIds: string[];
  deploymentsLoading?: boolean;
  onSelectDevice: (deviceId: string) => void;
  onSelectAll: () => void;
  onSort: (key: TableHeaderSortKey) => void;
  onClearAll: () => void;
  onPageChange: (e: unknown, newPage: number) => void;
  onRowsPerPageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TableSection({
  rows,
  totalCount,
  page,
  rowsPerPage,
  sortKey,
  sortOrder,
  loading = false,
  hasFilter,
  selectedDeviceIds,
  disabledDeviceIds,
  deploymentsLoading = false,
  onSelectDevice,
  onSelectAll,
  onSort,
  onClearAll,
  onPageChange,
  onRowsPerPageChange,
}: IProps) {
  const isEmpty = !loading && rows.length === 0;
  const isFilterEmpty = isEmpty && hasFilter;
  const isInitialEmpty = isEmpty && !hasFilter;

  const selectableRows = rows.filter((row) => Boolean(row.deviceId));

  const isAllSelected =
    selectableRows.length > 0 &&
    selectableRows.every((row) => selectedDeviceIds.includes(row.deviceId));

  const isIndeterminate =
    selectableRows.some((row) => selectedDeviceIds.includes(row.deviceId)) &&
    !isAllSelected;

  return (
    <Box sx={{ p: 2 }}>
      <TableContainer
        className="page-table-wrap"
        component={Paper}
        elevation={0}
      >
        <Table
          className="page-table"
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <TableHead>
            <TableRow className="page-table-row">
              <TableCell>
                <Checkbox
                  size="small"
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={onSelectAll}
                />
              </TableCell>

              <SortTableHeader
                label="Device name"
                active={sortKey === 'deviceName'}
                order={sortOrder}
                onClick={() => onSort('deviceName')}
              />

              <SortTableHeader
                label="Model"
                active={sortKey === 'hwModel'}
                order={sortOrder}
                onClick={() => onSort('hwModel')}
              />

              <TableCell sx={{ width: 200 }}>Device status</TableCell>
              <TableCell sx={{ width: 200 }}>Connectivity</TableCell>
              <TableCell sx={{ width: 200 }}>Last connected</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isInitialEmpty ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                  <Box className="page-table-empty-state">
                    <Typography variant="h5" gutterBottom>
                      No devices, yet
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : isFilterEmpty ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Box className="search-empty">
                    <Typography variant="h5" gutterBottom>
                      No results found.
                    </Typography>

                    <Typography
                      variant="body1"
                      color="text.secondary"
                      className="search-empty-desc"
                    >
                      Try adjusting your search or filter devices to find what
                      you are looking for.
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
                  key={row.deviceId}
                  row={row}
                  selected={selectedDeviceIds.includes(row.deviceId)}
                  disabledDeviceIds={disabledDeviceIds}
                  deploymentsLoading={deploymentsLoading}
                  onSelect={onSelectDevice}
                />
              ))
            )}

            {rows.length !== 0 && (
              <TableRow
                sx={{
                  height: 56,
                  '& td': {
                    borderBottom: 'none',
                  },
                }}
              >
                <TableCell colSpan={6} sx={{ p: 0 }}>
                  <Pagination
                    count={totalCount}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={onPageChange}
                    onRowsPerPageChange={onRowsPerPageChange}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
}
