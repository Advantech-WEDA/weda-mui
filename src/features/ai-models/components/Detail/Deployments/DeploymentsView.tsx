import {
  Box,
  Button,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import dayjs from '@shared/lib/dayjs';
import { RevokeDialog, SelectElement, StatusCard, SvgIcon } from '@shared/ui';

import type {
  DeploymentStatusGroup,
  EditionDeploymentDeviceRow,
} from '../../../domain/types';
import { DEPLOYMENTS_REFRESH_INTERVAL } from '../../../hooks/useEditionDeploymentsTab';
import { editionDeploymentStatusOptions } from '../../editionDeploymentStatusDisplay';
import TableSection from './TableSection';

export interface DeploymentsViewProps {
  hasPermission: boolean;
  lastUpdated: Date | null;
  pagedRows: EditionDeploymentDeviceRow[];
  statusCounts: Partial<Record<DeploymentStatusGroup, number>>;
  statusFilter: DeploymentStatusGroup | '';
  searchWord: string;
  page: number;
  rowsPerPage: number;
  visibleTotalCount: number;
  tableLoading: boolean;
  hasFilter: boolean;
  deleteOpen: boolean;
  selectedDeviceName?: string;
  inputValue: string;
  canDelete: boolean;
  setPage: (page: number) => void;
  setRowsPerPage: (rows: number) => void;
  setInputValue: (value: string) => void;
  handleSearchChange: (value: string) => void;
  handleStatusFilterChange: (value: DeploymentStatusGroup | '') => void;
  handleClearFilters: () => void;
  handleRefresh: () => void | Promise<void>;
  handleAdd: () => void;
  handleClose: () => void;
  handleOpenDelete: (row: EditionDeploymentDeviceRow) => void;
  handleConfirmDelete: () => void | Promise<void>;
  handleRetry: (deviceId: string) => void | Promise<void>;
}

export default function DeploymentsView({
  hasPermission,
  lastUpdated,
  pagedRows,
  statusCounts,
  statusFilter,
  searchWord,
  page,
  rowsPerPage,
  visibleTotalCount,
  tableLoading,
  hasFilter,
  deleteOpen,
  selectedDeviceName,
  inputValue,
  canDelete,
  setPage,
  setRowsPerPage,
  setInputValue,
  handleSearchChange,
  handleStatusFilterChange,
  handleClearFilters,
  handleRefresh,
  handleAdd,
  handleClose,
  handleOpenDelete,
  handleConfirmDelete,
  handleRetry,
}: DeploymentsViewProps) {
  return (
    <Box component="article">
      <Paper elevation={0} className="page-paper">
        <Box
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <Typography variant="h5" color="var(--text-primary)">
            Deployment status
          </Typography>
          <Typography variant="body2" color="var(--text-secondary)">
            Last updated:{' '}
            {lastUpdated
              ? dayjs(lastUpdated).format('YYYY/MM/DD HH:mm:ss')
              : '-'}
            {' | '}
            Auto-refresh: {DEPLOYMENTS_REFRESH_INTERVAL / 1000}s
          </Typography>
        </Box>

        <StatusCard<DeploymentStatusGroup>
          value={statusFilter}
          onChange={handleStatusFilterChange}
          options={editionDeploymentStatusOptions}
          counts={statusCounts}
        />

        <Box
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              flexWrap: 'nowrap',
              overflow: 'hidden',
              minWidth: 0,
              flex: 1,
            }}
          >
            {hasPermission && (
              <Button
                variant="contained"
                className="page-btn page-add-btn"
                startIcon={
                  <SvgIcon
                    name="Add"
                    sx={{ color: 'var(--primary-contrastText)' }}
                  />
                }
                onClick={handleAdd}
                sx={{ flexShrink: 0, textTransform: 'none' }}
              >
                <Typography variant="body1">Deploy</Typography>
              </Button>
            )}

            <TextField
              placeholder="Search"
              value={searchWord}
              className="page-search"
              onChange={(e) => handleSearchChange(e.target.value)}
              sx={{
                width: 220,
                flexShrink: 0,
              }}
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

            <Box sx={{ flexShrink: 0 }}>
              <SelectElement
                value={statusFilter}
                onChange={(value) =>
                  handleStatusFilterChange(value as DeploymentStatusGroup | '')
                }
                placeholder="Deployment status"
                minWidth={184}
                options={editionDeploymentStatusOptions}
              />
            </Box>

            <Button
              className="page-btn"
              variant="outlined"
              onClick={handleClearFilters}
              sx={{ flexShrink: 0, textTransform: 'none' }}
            >
              <Typography variant="body1">Clear filters</Typography>
            </Button>
          </Stack>

          <Button
            startIcon={
              <SvgIcon
                name="RefreshFilled"
                sx={{ color: 'var(--action-active)' }}
              />
            }
            onClick={handleRefresh}
            sx={{
              flexShrink: 0,
              color: 'var(--action-active, rgba(0, 0, 0, 0.54))',
            }}
          />
        </Box>

        <TableSection
          rows={pagedRows}
          totalCount={visibleTotalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          loading={tableLoading}
          hasFilter={hasFilter}
          hasPermission={hasPermission}
          onClearAll={handleClearFilters}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          onRetry={handleRetry}
          onDelete={handleOpenDelete}
        />

        <RevokeDialog
          open={deleteOpen}
          title="Delete deployment"
          content={`Are you sure you want to delete this deployment from "${selectedDeviceName}"? This action cannot be undone.`}
          inputLabel="Re-enter the device name to confirm deletion"
          mismatchText="Device name does not match."
          confirmName={selectedDeviceName || ''}
          confirmDisabled={!canDelete}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onClose={handleClose}
          onConfirm={handleConfirmDelete}
        />
      </Paper>
    </Box>
  );
}
