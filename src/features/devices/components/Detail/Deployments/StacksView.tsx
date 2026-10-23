import {
  type Action,
  type IDeploymentItem,
  type Status,
  statusOptions,
  type TableHeaderSortKey,
} from '@features/container-stacks';
import { Button, Stack, Typography } from '@mui/material';
import dayjs from '@shared/lib/dayjs';
import {
  PageActionButton,
  PageListLayout,
  PageSearchField,
  SelectElement,
  SimpleConfirmDialog,
  type SortOrder,
  StatusCard,
  SvgIcon,
} from '@shared/ui';

import { CONTAINER_STACKS_REFRESH_INTERVAL } from '../../../domain/types';
import TableSection from './TableSection';

export interface StacksViewProps {
  loading: boolean;
  hasPermission: boolean;
  lastUpdated: Date | null;
  pagedRows: IDeploymentItem[];
  statusCounts: Partial<Record<Status, number>>;
  statusFilter: Status | '';
  searchWord: string;
  page: number;
  rowsPerPage: number;
  sortKey: TableHeaderSortKey;
  sortOrder: SortOrder;
  hasFilter: boolean;
  visibleTotalCount: number;
  dialogOpenDeleteStack: boolean;
  selectedStackName?: string;
  selectedStackVersion?: string | number;
  setPage: (page: number) => void;
  setRowsPerPage: (rows: number) => void;

  setStatusFilter: (value: Status | '') => void;
  setDialogOpenDeleteStack: (open: boolean) => void;
  handleSearchChange: (value: string) => void;
  handleStatusFilterChange: (value: Status | '') => void;
  handleSort: (key: TableHeaderSortKey) => void;
  handleClearFilters: () => void;
  handleRefresh: () => void | Promise<void>;
  handleAdd: () => void;
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

export default function StacksView({
  loading,
  hasPermission,
  lastUpdated,
  pagedRows,
  statusCounts,
  statusFilter,
  searchWord,
  page,
  rowsPerPage,
  sortKey,
  sortOrder,
  hasFilter,
  visibleTotalCount,
  dialogOpenDeleteStack,
  selectedStackName,
  selectedStackVersion,
  setPage,
  setRowsPerPage,
  setStatusFilter,
  setDialogOpenDeleteStack,
  handleSearchChange,
  handleStatusFilterChange,
  handleSort,
  handleClearFilters,
  handleRefresh,
  handleAdd,
  handleOpenDeleteStack,
  handleConfirmDeleteStack,
  handleAction,
  handleDeploy,
}: StacksViewProps) {
  return (
    <PageListLayout
      title="Deployment status"
      hasBreadcrumbs={false}
      disableGutters
      subtitle={
        <>
          Last updated:{' '}
          {lastUpdated ? dayjs(lastUpdated).format('YYYY/MM/DD HH:mm:ss') : '-'}
          {' | '}
          Auto-refresh: {CONTAINER_STACKS_REFRESH_INTERVAL / 1000}s
        </>
      }
      summary={
        <StatusCard<Status>
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
          counts={statusCounts}
        />
      }
      toolbar={
        <Stack direction="row" alignItems="center" sx={{ width: '100%' }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
          >
            {hasPermission && (
              <PageActionButton
                variant="contained"
                startIcon={
                  <SvgIcon
                    name="Add"
                    className="page-action-btn__icon"
                    sx={{ color: 'var(--primary-contrastText)' }}
                  />
                }
                onClick={handleAdd}
              >
                <Typography variant="button" className="page-action-btn--add">
                  Deploy
                </Typography>
              </PageActionButton>
            )}

            <PageSearchField
              value={searchWord}
              onChange={(e) => handleSearchChange(e.target.value)}
            />

            <SelectElement
              value={statusFilter}
              onChange={(value) =>
                handleStatusFilterChange(value as Status | '')
              }
              placeholder="Deployment status"
              minWidth={184}
              options={statusOptions}
            />

            <PageActionButton variant="outlined" onClick={handleClearFilters}>
              <Typography variant="button" className="page-action-btn--clear">
                Clear filters
              </Typography>
            </PageActionButton>
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
              ml: 'auto',
              color: 'var(--action-active, rgba(0, 0, 0, 0.54))',
            }}
          />
        </Stack>
      }
    >
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
        title="Delete Container Stack"
        content={`Are you sure you want to delete stack "${selectedStackName}" (v${selectedStackVersion})? This action cannot be undone. All active deployments using this stack will continue to run but will no longer receive updates.`}
        confirmLabel="Delete"
        onClose={() => {
          setDialogOpenDeleteStack(false);
        }}
        onConfirm={handleConfirmDeleteStack}
      />
    </PageListLayout>
  );
}
