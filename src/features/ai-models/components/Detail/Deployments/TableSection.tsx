import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { PageTableLoadingIndicator, Pagination } from '@shared/ui';

import { type EditionDeploymentDeviceRow } from '../../../domain/types';
import TableContent from './TableContent';

interface IProps {
  rows: EditionDeploymentDeviceRow[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  loading?: boolean;
  hasFilter?: boolean;
  hasPermission: boolean;
  onClearAll: () => void;
  onPageChange: (e: unknown, newPage: number) => void;
  onRowsPerPageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRetry: (deviceId: string) => void;
  onDelete: (row: EditionDeploymentDeviceRow) => void;
}

export default function TableSection({
  rows,
  totalCount,
  page,
  rowsPerPage,
  loading = false,
  hasFilter,
  hasPermission,
  onClearAll,
  onPageChange,
  onRowsPerPageChange,
  onRetry,
  onDelete,
}: IProps) {
  const isEmpty = !loading && rows.length === 0;
  const isFilterEmpty = isEmpty && hasFilter;
  const isInitialEmpty = isEmpty && !hasFilter;

  return (
    <Box>
      <TableContainer
        className="page-table-wrap"
        component={Paper}
        elevation={0}
        sx={{ p: 2 }}
      >
        <Table className="page-table">
          <TableHead>
            <TableRow className="page-table-row">
              <TableCell>Device</TableCell>
              <TableCell sx={{ width: 200 }}>Deployment status</TableCell>
              <TableCell sx={{ width: 260 }}>Date modified</TableCell>
              <TableCell sx={{ width: 260 }}>Date created</TableCell>
              <TableCell sx={{ width: 150 }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <PageTableLoadingIndicator />
                </TableCell>
              </TableRow>
            ) : isInitialEmpty ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ p: 0 }}>
                  <Box className="page-table-empty-state">
                    <Typography variant="h5" gutterBottom>
                      No deployment, yet
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : isFilterEmpty ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Box className="search-empty">
                    <Typography variant="h5" gutterBottom>
                      No results found.
                    </Typography>

                    <Typography
                      variant="body1"
                      color="text.secondary"
                      className="search-empty-desc"
                    >
                      Try adjusting your search or filter deployments to find
                      what you are looking for.
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
                  key={row.id}
                  row={row}
                  hasPermission={hasPermission}
                  onRetry={onRetry}
                  onDelete={onDelete}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!loading && rows.length !== 0 && !hasFilter && (
        <Pagination
          count={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      )}
    </Box>
  );
}
