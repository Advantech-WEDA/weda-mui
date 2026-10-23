import type {
  ContainerStackTableRow,
  TableHeaderSortKey,
} from '@features/container-stacks';
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
import { Pagination, type SortOrder } from '@shared/ui';

import TableContent from './TableContent';

interface IProps {
  rows: ContainerStackTableRow[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  loading?: boolean;
  hasFilter?: boolean;
  hasPermission: boolean;
  sortKey: TableHeaderSortKey;
  sortOrder: SortOrder;
  selectedStackConfigIds: string[];
  onSelectStackConfig: (stackConfigId: string) => void;
  onSelectAll: () => void;
  onSort: (key: TableHeaderSortKey) => void;
  onClearAll: () => void;
  onPageChange: (e: unknown, newPage: number) => void;
  onRowsPerPageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVersionChange: (stackConfigId: string, version: number) => void;
  disabledRevisionIds: Set<string>;
}

export default function TableSection({
  rows,
  totalCount,
  page,
  rowsPerPage,
  loading = false,
  hasFilter,
  hasPermission,
  selectedStackConfigIds,
  onSelectStackConfig,
  onSelectAll,
  onClearAll,
  onPageChange,
  onRowsPerPageChange,
  onVersionChange,
  disabledRevisionIds,
}: IProps) {
  const isEmpty = !loading && rows.length === 0;
  const isFilterEmpty = isEmpty && hasFilter;
  const isInitialEmpty = isEmpty && !hasFilter;

  const selectableRows = rows.filter(
    (row) =>
      Boolean(row.stackConfigId) &&
      !disabledRevisionIds.has(row.currentVersion.stackRevisionId)
  );

  const isAllSelected =
    selectableRows.length > 0 &&
    selectableRows.every((row) =>
      selectedStackConfigIds.includes(row.stackConfigId)
    );

  const isIndeterminate =
    selectableRows.some((row) =>
      selectedStackConfigIds.includes(row.stackConfigId)
    ) && !isAllSelected;

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
              <TableCell sx={{ width: 50 }}>
                <Checkbox
                  size="small"
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={onSelectAll}
                />
              </TableCell>
              <TableCell sx={{ width: 400 }}>Stack</TableCell>
              <TableCell sx={{ width: 200 }}>
                Version
                <Box component="span" sx={{ color: 'error.main' }}>
                  *
                </Box>
              </TableCell>
              <TableCell sx={{ width: 200 }}>Type</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isInitialEmpty ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                  <Box className="page-table-empty-state">
                    <Typography variant="h5" gutterBottom>
                      No container stack, yet
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
                      Try adjusting your search or filter container stacks to
                      find what you are looking for.
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
                  key={row.stackConfigId}
                  row={row}
                  selected={selectedStackConfigIds.includes(row.stackConfigId)}
                  onSelect={onSelectStackConfig}
                  hasPermission={hasPermission}
                  onVersionChange={onVersionChange}
                  disabledRevisionIds={disabledRevisionIds}
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
