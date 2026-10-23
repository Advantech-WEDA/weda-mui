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
import { Pagination } from '@shared/ui';

import TableContent from '@/features/devices/components/DeployAiModel/TableContent';
import type { AiModelDeployTableRow } from '@/features/devices/domain/types';

interface IProps {
  rows: AiModelDeployTableRow[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  loading?: boolean;
  hasFilter?: boolean;
  hasPermission: boolean;
  selectedModelIds: string[];
  onSelectModel: (modelId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onPageChange: (e: unknown, newPage: number) => void;
  onRowsPerPageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditionChange: (modelId: string, edition: string) => void;
}

export default function TableSection({
  rows,
  totalCount,
  page,
  rowsPerPage,
  loading = false,
  hasFilter,
  hasPermission,
  selectedModelIds,
  onSelectModel,
  onSelectAll,
  onClearAll,
  onPageChange,
  onRowsPerPageChange,
  onEditionChange,
}: IProps) {
  const isEmpty = !loading && rows.length === 0;
  const isFilterEmpty = isEmpty && hasFilter;
  const isInitialEmpty = isEmpty && !hasFilter;

  const selectableRows = rows.filter((row) =>
    row.editions.some((edition) => !edition.disabled)
  );

  const isAllSelected =
    selectableRows.length > 0 &&
    selectableRows.every((row) => selectedModelIds.includes(row.modelId));

  const isIndeterminate =
    selectableRows.some((row) => selectedModelIds.includes(row.modelId)) &&
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
              <TableCell sx={{ width: 50 }}>
                <Checkbox
                  size="small"
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={onSelectAll}
                />
              </TableCell>
              <TableCell sx={{ width: 400 }}>AI model</TableCell>
              <TableCell sx={{ width: 200 }}>
                Edition
                <Box component="span" sx={{ color: 'error.main' }}>
                  *
                </Box>
              </TableCell>
              <TableCell sx={{ width: 200 }}>Filename</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isInitialEmpty ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                  <Box className="page-table-empty-state">
                    <Typography variant="h5" gutterBottom>
                      No AI model available, yet
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : isFilterEmpty ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Box className="search-empty">
                    <Typography variant="h5" gutterBottom>
                      No results found.
                    </Typography>

                    <Typography
                      variant="body1"
                      color="text.secondary"
                      className="search-empty-desc"
                    >
                      Try adjusting your search to find what you are looking
                      for.
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
                  key={row.modelId}
                  row={row}
                  selected={selectedModelIds.includes(row.modelId)}
                  onSelect={onSelectModel}
                  hasPermission={hasPermission}
                  onEditionChange={onEditionChange}
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
                <TableCell colSpan={4} sx={{ p: 0 }}>
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
