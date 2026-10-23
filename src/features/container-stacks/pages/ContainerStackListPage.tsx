import './ContainerStackListPage.scss';

import { Button, Stack, Typography } from '@mui/material';
import {
  PageActionButton,
  PageListLayout,
  PageSearchField,
  SelectElement,
  SimpleConfirmDialog,
  StatusCard,
  SvgIcon,
} from '@shared/ui';

import { statusOptions } from '../components/stackStatusCards';
import { COLUMNS } from '../components/stackTable.columns';
import { typeOptions } from '../components/stackTypeOptions';
import TableSection from '../components/TableSection';
import type { Status } from '../domain/types';
import { useStackListPage } from '../hooks/useStackListPage';

export default function Stacks() {
  const {
    searchWord,
    statusFilter,
    typeFilter,
    hasFilter,
    selectedItem,
    page,
    rowsPerPage,
    dialogOpen,
    dialogOpenDeleteStack,
    setDialogOpen,
    setDialogOpenDeleteStack,
    hasPermission,
    loading,
    loadError,
    pagedRows,
    visibleTotalCount,
    statusCounts,
    handleClearFilters,
    handleRetryFetch,
    handleAdd,
    handleDeploy,
    handleRedeploy,
    handleEdit,
    handleRefresh,
    handleOpenDelete,
    handleOpenDeleteStack,
    handleConfirmDelete,
    handleConfirmDeleteStack,
    handleAction,
    handleSearchChange,
    handleStatusCardChange,
    handleTypeFilterChange,
    handleStatusFilterChange,
    handlePageChange,
    handleRowsPerPageChange,
  } = useStackListPage();

  return (
    <PageListLayout
      title="Container Stacks"
      toolbar={
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: '100%' }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
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
                  Add
                </Typography>
              </PageActionButton>
            )}

            <PageSearchField
              value={searchWord}
              onChange={(e) => handleSearchChange(e.target.value)}
            />

            <SelectElement
              value={typeFilter}
              onChange={handleTypeFilterChange}
              placeholder="Type"
              minWidth={84}
              options={typeOptions}
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
            startIcon={<SvgIcon name="RefreshFilled" />}
            onClick={handleRefresh}
            sx={{
              flexShrink: 0,
              minWidth: 40,
              px: 0,
              color: 'var(--action-active)',
            }}
          />
        </Stack>
      }
    >
      <StatusCard<Status>
        value={statusFilter}
        onChange={handleStatusCardChange}
        options={statusOptions}
        counts={statusCounts}
      />

      <TableSection
        columns={COLUMNS}
        rows={pagedRows}
        totalCount={visibleTotalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        loading={loading}
        hasError={loadError}
        hasFilter={hasFilter}
        hasPermission={hasPermission}
        onRetry={handleRetryFetch}
        onClearAll={handleClearFilters}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onDelete={handleOpenDelete}
        onDeleteStack={handleOpenDeleteStack}
        onAction={handleAction}
        onEdit={handleEdit}
        onDeploy={handleDeploy}
        onRedeploy={handleRedeploy}
        onAdd={handleAdd}
      />

      <SimpleConfirmDialog
        open={dialogOpen}
        title="Delete Container Stack"
        content={`Are you sure you want to delete stack "${selectedItem?.stackName}" (v${selectedItem?.version})? This action cannot be undone. All active deployments using this stack will continue to run but will no longer receive updates.`}
        confirmLabel="Delete"
        onClose={() => {
          setDialogOpen(false);
        }}
        onConfirm={handleConfirmDelete}
      />
      <SimpleConfirmDialog
        open={dialogOpenDeleteStack}
        title="Delete Container Stack"
        content={`Are you sure you want to delete stack "${selectedItem?.stackName}" (v${selectedItem?.version})? This action cannot be undone. All active deployments using this stack will continue to run but will no longer receive updates.`}
        confirmLabel="Delete"
        onClose={() => {
          setDialogOpenDeleteStack(false);
        }}
        onConfirm={handleConfirmDeleteStack}
      />
    </PageListLayout>
  );
}
