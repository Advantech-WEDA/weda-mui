import {
  type DeploymentStatusGroup,
  editionDeploymentStatusOptions,
} from '@features/ai-models';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import dayjs from '@shared/lib/dayjs';
import {
  PageSearchField,
  RevokeDialog,
  SelectElement,
  SimpleConfirmDialog,
  StatusCard,
  SvgIcon,
} from '@shared/ui';

import TableSection from '@/features/devices/components/Detail/AiModels/TableSection';
import {
  AI_MODELS_REFRESH_INTERVAL,
  type DeviceAiModelRow,
} from '@/features/devices/domain/types';

export interface AiModelsViewProps {
  loading: boolean;
  hasPermission: boolean;
  lastUpdated: Date | null;
  pagedRows: DeviceAiModelRow[];
  statusCounts: Partial<Record<DeploymentStatusGroup, number>>;
  statusFilter: DeploymentStatusGroup | '';
  searchWord: string;
  page: number;
  rowsPerPage: number;
  hasFilter: boolean;
  visibleTotalCount: number;
  deleteOpen: boolean;
  retryOpen: boolean;
  selectedRow: DeviceAiModelRow | null;
  selectedRetryRow: DeviceAiModelRow | null;
  inputValue: string;
  canDelete: boolean;
  setPage: (page: number) => void;
  setRowsPerPage: (rows: number) => void;
  setInputValue: (value: string) => void;
  handleSearchChange: (value: string) => void;
  handleStatusFilterChange: (value: DeploymentStatusGroup | '') => void;
  handleClearFilters: () => void;
  handleRefresh: () => void | Promise<void>;
  handleDeploy: () => void;
  handleClose: () => void;
  handleOpenDelete: (row: DeviceAiModelRow) => void;
  handleConfirmDelete: () => void | Promise<void>;
  handleOpenRetry: (row: DeviceAiModelRow) => void;
  handleCloseRetry: () => void;
  handleConfirmRetry: () => void | Promise<void>;
}

export default function AiModelsView({
  loading,
  hasPermission,
  lastUpdated,
  pagedRows,
  statusCounts,
  statusFilter,
  searchWord,
  page,
  rowsPerPage,
  hasFilter,
  visibleTotalCount,
  deleteOpen,
  retryOpen,
  selectedRow,
  selectedRetryRow,
  inputValue,
  canDelete,
  setPage,
  setRowsPerPage,
  setInputValue,
  handleSearchChange,
  handleStatusFilterChange,
  handleClearFilters,
  handleRefresh,
  handleDeploy,
  handleClose,
  handleOpenDelete,
  handleConfirmDelete,
  handleOpenRetry,
  handleCloseRetry,
  handleConfirmRetry,
}: AiModelsViewProps) {
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
            AI models
          </Typography>

          <Typography variant="body2" color="var(--text-secondary)">
            Last updated:{' '}
            {lastUpdated
              ? dayjs(lastUpdated).format('YYYY/MM/DD HH:mm:ss')
              : '-'}
            {' | '}
            Auto-refresh: {AI_MODELS_REFRESH_INTERVAL / 1000}s
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
                onClick={handleDeploy}
                sx={{ flexShrink: 0, textTransform: 'none' }}
              >
                <Typography variant="body1">Deploy</Typography>
              </Button>
            )}
            <PageSearchField
              value={searchWord}
              onChange={(e) => handleSearchChange(e.target.value)}
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
          loading={loading}
          hasFilter={hasFilter}
          hasPermission={hasPermission}
          onClearAll={handleClearFilters}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          onRetry={handleOpenRetry}
          onDelete={handleOpenDelete}
        />

        <SimpleConfirmDialog
          open={retryOpen}
          title="Redeploy AI Model"
          content={`Are you sure you want to redeploy "${selectedRetryRow?.modelName} (${selectedRetryRow?.edition})"?`}
          confirmLabel="Redeploy"
          onClose={handleCloseRetry}
          onConfirm={handleConfirmRetry}
        />

        <RevokeDialog
          open={deleteOpen}
          title="Delete AI model"
          content={`Are you sure you want to delete "${selectedRow?.modelName}" (${selectedRow?.edition}) from this device? The application on this device may no longer be able to use this model.`}
          inputLabel="Re-enter the model name to confirm deletion"
          mismatchText="Model name does not match."
          confirmName={selectedRow?.modelName || ''}
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
