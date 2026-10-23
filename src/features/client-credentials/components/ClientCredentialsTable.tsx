import './ClientCredentialsTable.scss';

import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Snackbar, { type SnackbarOrigin } from '@mui/material/Snackbar';
import { formatLocalTime } from '@shared/lib/dayjs';
import {
  PageTableEmptyState,
  PageTableLoadingIndicator,
  SvgIcon,
} from '@shared/ui';
import { useState } from 'react';

import type { IClientCredentialResult } from '../api/client-credentials.api.types';
import RevokeClientCredentialDialog from './RevokeClientCredentialDialog';

type SnackbarState = SnackbarOrigin & { open: boolean };

interface ClientCredentialsTableProps {
  hasPermission: boolean;
  page: number;
  rowsPerPage: number;
  searchWord: string;
  scopeFilter: string;
  hasFilter: boolean;
  dialogOpen: boolean;
  selectedCredential: IClientCredentialResult | null;
  inputValue: string;
  pagedRows: IClientCredentialResult[];
  filteredRows: IClientCredentialResult[];
  loading?: boolean;
  hasError?: boolean;
  setInputValue: (value: string) => void;
  handleClearFilters: () => void;
  handleAdd: () => void;
  handleOpenDialog: (row: IClientCredentialResult) => void;
  handleCloseDialog: () => void;
  handleConfirm: () => void | Promise<void>;
  handleRetryFetch: () => void;
  handleSearchChange: (value: string) => void;
  handleScopeFilterChange: (value: string) => void;
  handlePageChange: (page: number) => void;
  handleRowsPerPageChange: (rows: number) => void;
}

export default function ClientCredentialsTable({
  hasPermission,
  searchWord,
  scopeFilter,
  hasFilter,
  dialogOpen,
  selectedCredential,
  inputValue,
  setInputValue,
  pagedRows,
  loading = false,
  hasError = false,
  handleClearFilters,
  handleAdd,
  handleOpenDialog,
  handleCloseDialog,
  handleConfirm,
  handleRetryFetch,
  handleSearchChange,
  handleScopeFilterChange,
}: ClientCredentialsTableProps) {
  const [snackbarState, setSnackbarState] = useState<SnackbarState>({
    open: false,
    vertical: 'top',
    horizontal: 'right',
  });

  return (
    <>
      <Box className="client-credentials">
        <Box className="client-credentials-toolbar">
          <Button
            variant="contained"
            sx={{ minWidth: 120, padding: '4px 16px', textTransform: 'none' }}
            startIcon={<AddIcon />}
            className="client-credentials-add-btn"
            onClick={handleAdd}
            disabled={!hasPermission}
          >
            Add
          </Button>

          <TextField
            size="small"
            placeholder="Search"
            className="client-credentials-search"
            value={searchWord}
            onChange={(e) => handleSearchChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SvgIcon
                      name="SearchFilled"
                      sx={{ color: 'var(--action-active)' }}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Select
            size="small"
            displayEmpty
            defaultValue=""
            className="client-credentials-select"
            value={scopeFilter}
            onChange={(e) => handleScopeFilterChange(e.target.value)}
            renderValue={(selected) =>
              selected ? (
                selected
              ) : (
                <span style={{ color: 'var(--mui-palette-text-secondary)' }}>
                  Scope
                </span>
              )
            }
          >
            <MenuItem value="object.write">object.write</MenuItem>
            <MenuItem value="telemetry.write">telemetry.write</MenuItem>
            <MenuItem value="dataobject.read">dataobject.read</MenuItem>
          </Select>

          <Button
            variant="outlined"
            size="small"
            sx={{
              minWidth: 109,
              padding: '4px 16px',
              fontSize: '14px',
              textTransform: 'none',
            }}
            className="client-credentials-clear-btn"
            onClick={handleClearFilters}
          >
            Clear filters
          </Button>
        </Box>
        <TableContainer>
          <Table size="small" className="client-credentials-table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 365 }}>Credential name</TableCell>
                <TableCell sx={{ width: 200 }}>Scope</TableCell>
                <TableCell sx={{ width: 200 }}>Date created</TableCell>
                <TableCell sx={{ width: 108 }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {!loading && hasError ? (
                <PageTableEmptyState
                  variant="error"
                  colSpan={4}
                  title="Couldn't load client credentials"
                  description="Something went wrong while loading this list. Please try again."
                  actionLabel="Retry"
                  onAction={handleRetryFetch}
                />
              ) : pagedRows.length > 0 ? (
                pagedRows.map((row) => (
                  <TableRow key={row.clientCredentialId}>
                    <TableCell sx={{ whiteSpace: 'pre-wrap' }}>
                      {' '}
                      {row.name}
                    </TableCell>
                    <TableCell>{row.scopes?.join(', ')}</TableCell>

                    <TableCell>
                      {row?.createdAt ? formatLocalTime(row.createdAt) : ''}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(row)}
                        >
                          <SvgIcon
                            name="DeleteOutlined"
                            sx={{
                              color: 'var(--action-active)',
                              pointerEvents: 'none',
                            }}
                          />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="client-credentials-empty-cell"
                  >
                    <Box className="client-credentials-empty">
                      {loading ? (
                        <PageTableLoadingIndicator />
                      ) : hasFilter ? (
                        <>
                          <Typography variant="h5" gutterBottom>
                            No results found.
                          </Typography>

                          <Typography
                            variant="body1"
                            color="text.secondary"
                            className="client-credentials-search-empty-desc"
                          >
                            Try adjusting your search or filter options to find
                            what you are looking for.
                          </Typography>

                          <Button
                            variant="outlined"
                            size="small"
                            onClick={handleClearFilters}
                            sx={{ mt: 1 }}
                          >
                            Clear all
                          </Button>
                        </>
                      ) : (
                        <>
                          <Typography variant="h5" gutterBottom>
                            No client credentials, yet.
                          </Typography>

                          {hasPermission && (
                            <>
                              <Typography
                                variant="body1"
                                color="text.secondary"
                                className="client-credentials-search-empty-desc"
                              >
                                Click the "+" button to add client credentials
                                here!
                              </Typography>
                              <Button
                                sx={{
                                  minWidth: 92,
                                  padding: '8px 16px',
                                  textTransform: 'none',
                                }}
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleAdd}
                                className="client-credentials-empty-add-btn"
                              >
                                Add
                              </Button>
                            </>
                          )}
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <RevokeClientCredentialDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          credentialName={selectedCredential?.name || ''}
          inputValue={inputValue}
          setInputValue={setInputValue}
          onConfirm={handleConfirm}
        />
      </Box>

      <Snackbar
        anchorOrigin={{
          vertical: snackbarState.vertical,
          horizontal: snackbarState.horizontal,
        }}
        open={snackbarState.open}
        autoHideDuration={2000}
        onClose={() => setSnackbarState((prev) => ({ ...prev, open: false }))}
        sx={{
          '&.MuiSnackbar-root': {
            top: 'calc(64px + 16px)',
          },
        }}
      >
        <Alert
          icon={<CheckCircleIcon sx={{ mr: 1, width: 22, height: 22 }} />}
          severity="success"
          variant="filled"
          sx={{
            alignItems: 'center',
          }}
        >
          {'Credential name copied!'}
        </Alert>
      </Snackbar>
    </>
  );
}
