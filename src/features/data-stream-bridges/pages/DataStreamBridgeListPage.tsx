import { Button, Stack, Typography } from '@mui/material';
import {
  PageActionButton,
  PageListLayout,
  PageSearchField,
  RevokeDialog,
  SelectElement,
  SimpleConfirmDialog,
  StatusCard,
  SvgIcon,
} from '@shared/ui';

import {
  bridgeStatusCardOptions,
  bridgeStatusFilterOptions,
} from '@/features/data-stream-bridges/components/bridgeStatusDisplay';
import TableSection from '@/features/data-stream-bridges/components/TableSection';
import type { BridgeDisplayStatus } from '@/features/data-stream-bridges/domain/types';
import { useDataStreamBridgesPage } from '@/features/data-stream-bridges/hooks/useDataStreamBridgesPage';

export default function DataStreamBridgeListPage() {
  const {
    hasPermission,
    searchWord,
    setSearchWord,
    statusFilter,
    statusCounts,
    handleStatusFilterChange,
    handleAdd,
    handleClearFilters,
    handleRefresh,
    loading,
    tableSectionProps,
    deleteDialogOpen,
    selectedItem,
    inputValue,
    setInputValue,
    canDelete,
    handleCloseDeleteDialog,
    handleConfirmDelete,
    toggleDialogOpen,
    toggleDialogContent,
    handleCloseToggleDialog,
    handleConfirmToggle,
  } = useDataStreamBridgesPage();

  return (
    <PageListLayout
      title="DataStream Bridges"
      summary={
        <StatusCard<BridgeDisplayStatus>
          value={statusFilter}
          onChange={handleStatusFilterChange}
          counts={statusCounts}
          options={bridgeStatusCardOptions}
        />
      }
      toolbar={
        <Stack
          direction="row"
          alignItems="center"
          sx={{ width: '100%' }}
          justifyContent="space-between"
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
              onChange={(e) => setSearchWord(e.target.value)}
            />

            <SelectElement
              value={statusFilter}
              onChange={(value) =>
                handleStatusFilterChange(value as BridgeDisplayStatus | '')
              }
              placeholder="Runtime status"
              minWidth={147}
              options={bridgeStatusFilterOptions}
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
            disabled={loading}
            className="page-action-btn--refresh"
          />
        </Stack>
      }
    >
      <TableSection {...tableSectionProps} />

      <RevokeDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        title="Delete bridge"
        content={`Are you sure you want to delete bridge "${selectedItem?.name}"?`}
        inputLabel="Re-enter the bridge name to confirm deletion"
        mismatchText="Bridge name does not match."
        confirmName={selectedItem?.name ?? ''}
        confirmDisabled={!canDelete}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onConfirm={handleConfirmDelete}
      />

      <SimpleConfirmDialog
        open={toggleDialogOpen}
        title={toggleDialogContent.title}
        content={toggleDialogContent.content}
        confirmLabel={toggleDialogContent.confirmLabel}
        onClose={handleCloseToggleDialog}
        onConfirm={handleConfirmToggle}
      />
    </PageListLayout>
  );
}
