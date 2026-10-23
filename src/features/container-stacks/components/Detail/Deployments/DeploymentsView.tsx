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
import {
  SelectElement,
  SimpleConfirmDialog,
  type SortOrder,
  StatusCard,
  SvgIcon,
} from '@shared/ui';

import {
  type Action,
  type DeploymentDeviceRow,
  DEPLOYMENTS_REFRESH_INTERVAL,
  type Status,
  type TableHeaderSortKey,
} from '../../../domain/types';
import { statusOptions } from '../../stackStatusCards';
import TableSection from './TableSection';

export interface DeploymentsViewProps {
  loading: boolean;
  lastUpdated: Date | null;
  hasPermission: boolean;
  pagedRows: DeploymentDeviceRow[];
  statusCounts: Partial<Record<Status, number>>;
  statusFilter: Status | '';
  searchWord: string;
  page: number;
  rowsPerPage: number;
  sortKey: TableHeaderSortKey;
  sortOrder: SortOrder;
  dialogOpenDeleteStack: boolean;
  visibleTotalCount: number;
  hasFilter: boolean;
  setPage: (page: number) => void;
  setRowsPerPage: (rows: number) => void;

  setStatusFilter: (value: Status | '') => void;
  handleSearchChange: (value: string) => void;
  handleStatusFilterChange: (value: Status | '') => void;
  handleSort: (key: TableHeaderSortKey) => void;
  handleClearFilters: () => void;
  handleAdd: () => void;
  handleClose: () => void;
  handleOpenDeleteStack: (stackConfigId: string, deviceId: string) => void;
  handleConfirmDeleteStack: () => void | Promise<void>;
  handleAction: (
    deviceId: string,
    stackConfigId: string,
    action: Action
  ) => void | Promise<void>;
  handleDeploy: (
    deviceId: string,
    stackConfigId: string,
    stackRevisionId: string
  ) => void | Promise<void>;
}

export default function DeploymentsView({
  loading,
  lastUpdated,
  hasPermission,
  pagedRows,
  statusCounts,
  statusFilter,
  searchWord,
  page,
  rowsPerPage,
  sortKey,
  sortOrder,
  dialogOpenDeleteStack,
  visibleTotalCount,
  hasFilter,
  setPage,
  setRowsPerPage,
  setStatusFilter,
  handleSearchChange,
  handleStatusFilterChange,
  handleSort,
  handleClearFilters,
  handleAdd,
  handleClose,
  handleOpenDeleteStack,
  handleConfirmDeleteStack,
  handleAction,
  handleDeploy,
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

        <StatusCard<Status>
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
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
                  handleStatusFilterChange(value as Status | '')
                }
                placeholder="Container status"
                minWidth={184}
                options={statusOptions}
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
        </Box>

        <TableSection
          rows={pagedRows}
          totalCount={visibleTotalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={handleSort}
          loading={loading}
          hasFilter={hasFilter}
          hasPermission={hasPermission}
          onClearAll={handleClearFilters}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          onAdd={handleAdd}
          onDeleteStack={handleOpenDeleteStack}
          onAction={handleAction}
          onDeploy={handleDeploy}
        />

        <SimpleConfirmDialog
          open={dialogOpenDeleteStack}
          title="Delete deployment"
          content={
            'Are you sure you want to delete this deployment? This action cannot be undone.'
          }
          confirmLabel="Delete"
          onClose={handleClose}
          onConfirm={handleConfirmDeleteStack}
        />
      </Paper>
    </Box>
  );
}
