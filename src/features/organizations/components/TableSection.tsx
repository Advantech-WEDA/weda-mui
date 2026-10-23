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
import { PageTableEmptyState } from '@shared/ui';

import type { OrganizationRow } from '../domain/types';
import TableContent from './TableContent';

interface TableSectionProps {
  rows: OrganizationRow[];
  loading?: boolean;
  hasError?: boolean;
  onClearAll: () => void;
  onRetry: () => void;
  onEditOrg: (row: OrganizationRow) => void;
  onDeleteOrg: (row: OrganizationRow) => void;
}

export default function TableSection({
  rows,
  loading = false,
  hasError = false,
  onClearAll,
  onRetry,
  onEditOrg,
  onDeleteOrg,
}: TableSectionProps) {
  const isEmpty = !loading && rows.length === 0;
  const isErrorEmpty = isEmpty && hasError;

  return (
    <Box>
      <TableContainer
        className="page-table-wrap"
        component={Paper}
        elevation={0}
      >
        <Table className="page-table">
          <TableHead>
            <TableRow className="page-table-row">
              <TableCell>Organization name</TableCell>
              <TableCell sx={{ width: 200 }}>Description</TableCell>
              <TableCell sx={{ width: 200 }}>Admins</TableCell>
              <TableCell sx={{ width: 200 }}>My org role</TableCell>
              <TableCell sx={{ width: 200 }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Box className="search-empty">
                    <CircularProgress size={24} />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isErrorEmpty ? (
              <PageTableEmptyState
                variant="error"
                colSpan={5}
                title="Couldn't load organizations"
                description="Something went wrong while loading this list. Please try again."
                actionLabel="Retry"
                onAction={onRetry}
              />
            ) : isEmpty ? (
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
                      Try adjusting your search or filter options to find what
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
                  key={row.orgId}
                  row={row}
                  level={0}
                  onEdit={onEditOrg}
                  onDelete={onDeleteOrg}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
