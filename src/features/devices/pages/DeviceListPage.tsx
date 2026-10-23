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

import { statusOptions } from '@/features/devices/components/deviceStatusDisplay';
import TableSection from '@/features/devices/components/TableSection';
import type { Status } from '@/features/devices/domain/types';
import { useDeviceListPage } from '@/features/devices/hooks/useDeviceListPage';

function Devices() {
  const {
    searchWord,
    statusFilter,
    deleteDialogOpen,
    statusDialogOpen,
    selectedItem,
    inputValue,
    setInputValue,
    canDelete,
    statusCounts,
    statusDialogContent,
    hasPermission,
    refreshing,
    handleCloseDialog,
    handleAdd,
    handleRefresh,
    handleClearFilters,
    handleActivationStatus,
    handleConfirmDelete,
    handleStatusCardChange,
    handleSearchChange,
    handleStatusFilterChange,
    handleStatusDialogClose,
    tableSectionProps,
  } = useDeviceListPage();

  return (
    <PageListLayout
      title="Devices"
      summary={
        <StatusCard<Status>
          value={statusFilter}
          onChange={handleStatusCardChange}
          counts={statusCounts}
          options={statusOptions}
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
                handleStatusFilterChange(value as Status | '')
              }
              placeholder="Device status"
              minWidth={147}
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
            disabled={refreshing}
            sx={{
              ml: 'auto',
              color: 'var(--action-active, rgba(0, 0, 0, 0.54))',
            }}
          />
        </Stack>
      }
    >
      <TableSection {...tableSectionProps} />

      <RevokeDialog
        open={deleteDialogOpen}
        onClose={handleCloseDialog}
        title="Delete Device"
        content={`This action is permanent and cannot be undone. All data associated with this device will be wiped. Are you sure you want to delete device "${selectedItem?.deviceName}"?`}
        inputLabel="Re-enter the device name to confirm deletion"
        mismatchText="Device name does not match."
        confirmName={selectedItem?.deviceName || ''}
        confirmDisabled={!canDelete}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onConfirm={handleConfirmDelete}
      />

      <SimpleConfirmDialog
        open={statusDialogOpen}
        title={statusDialogContent.title}
        content={statusDialogContent.content}
        confirmLabel={statusDialogContent.confirmLabel}
        onClose={handleStatusDialogClose}
        onConfirm={handleActivationStatus}
      />
    </PageListLayout>
  );
}

export default Devices;
