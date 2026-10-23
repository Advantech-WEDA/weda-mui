import '@/features/ai-models/pages/AIModelListPage.scss';

import { Button, Stack, Typography } from '@mui/material';
import {
  PageActionButton,
  PageListLayout,
  PageSearchField,
  RevokeDialog,
  SelectElement,
  StatusCard,
  SvgIcon,
} from '@shared/ui';

import TableSection from '@/features/ai-models/components/TableSection';
import { statusOptions } from '@/features/ai-models/components/uploadStatusDisplay';
import { type StatusGroup } from '@/features/ai-models/domain/types';
import { useAIModelListPage } from '@/features/ai-models/hooks/useAIModelListPage';

export default function AIModels() {
  const {
    searchWord,
    statusFilter,
    hasFilter,
    selectedItem,
    selectedEdition,
    page,
    rowsPerPage,
    sortKey,
    sortOrder,
    deleteDialogOpen,
    inputValue,
    setInputValue,
    canDelete,
    editionDeleteDialogOpen,
    editionInputValue,
    setEditionInputValue,
    canDeleteEdition,
    hasPermission,
    loading,
    loadError,
    pagedRows,
    visibleTotalCount,
    statusCounts,

    handleClearFilters,
    handleRetryFetch,
    handleStatusCardChange,
    handleStatusFilterChange,
    handleAdd,
    handleDeploy,
    handleEdit,
    handleEditEdition,
    handleRefresh,
    handleOpenDelete,
    handleConfirmDelete,
    handleCloseDialog,
    handleOpenDeleteEdition,
    handleConfirmDeleteEdition,
    handleCloseEditionDialog,
    handleSearchChange,
    handlePageChange,
    handleRowsPerPageChange,
    handleSort,
  } = useAIModelListPage();

  return (
    <PageListLayout
      title="AI Models"
      summary={
        <StatusCard<StatusGroup>
          value={statusFilter}
          onChange={handleStatusCardChange}
          counts={statusCounts}
          options={statusOptions}
        />
      }
      toolbar={
        <Stack
          direction="row"
          alignItems="center"
          sx={{ width: '100%' }}
          justifyContent="space-between"
          className="ai-model-list-page__toolbar"
        >
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
                    sx={{ color: 'var(--primary-contrastText)' }}
                    className="page-action-btn__icon"
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
              value={statusFilter}
              onChange={(value) =>
                handleStatusFilterChange(value as StatusGroup | '')
              }
              placeholder="Status"
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
            className="ai-model-list-page__btn--refresh"
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
        loading={loading}
        hasError={loadError}
        hasFilter={hasFilter}
        hasPermission={hasPermission}
        onSort={handleSort}
        onRetry={handleRetryFetch}
        onClearAll={handleClearFilters}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onDelete={handleOpenDelete}
        onDeleteEdition={handleOpenDeleteEdition}
        onEdit={handleEdit}
        onEditEdition={handleEditEdition}
        onDeploy={handleDeploy}
        onAdd={handleAdd}
      />

      <RevokeDialog
        open={deleteDialogOpen}
        onClose={handleCloseDialog}
        title="Delete AI Model"
        content={`Are you sure you want to delete "${selectedItem?.modelName}"? Deleting this model will remove all its editions and uploaded files. Devices that already received a deployed file will keep that file until it is explicitly removed from the device.`}
        inputLabel="Re-enter the AI model name to confirm deletion"
        mismatchText="Model name does not match."
        confirmName={selectedItem?.modelName || ''}
        confirmDisabled={!canDelete}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onConfirm={handleConfirmDelete}
      />

      <RevokeDialog
        open={editionDeleteDialogOpen}
        onClose={handleCloseEditionDialog}
        title="Delete AI Model Edition"
        content={`Are you sure you want to delete edition "${selectedEdition?.edition}" of AI model "${selectedEdition?.modelName}"? This action cannot be undone.`}
        inputLabel="Re-enter the edition name to confirm deletion"
        mismatchText="Edition name does not match."
        confirmName={selectedEdition?.edition || ''}
        confirmDisabled={!canDeleteEdition}
        inputValue={editionInputValue}
        onInputChange={setEditionInputValue}
        onConfirm={handleConfirmDeleteEdition}
      />
    </PageListLayout>
  );
}
