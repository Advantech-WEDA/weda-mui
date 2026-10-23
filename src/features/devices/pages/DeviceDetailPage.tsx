import { RevokeDialog, SimpleConfirmDialog } from '@shared/ui';

import DetailContent from '@/features/devices/components/DetailContent';
import { useDeviceDetailPage } from '@/features/devices/hooks/useDeviceDetailPage';

export default function DetailDevice() {
  const {
    statusOpen,
    deleteOpen,
    inputValue,
    setInputValue,
    currentDevice,
    canDelete,
    statusDialogContent,
    handleEdit,
    handleStatusConfirmOpen,
    handleDeleteConfirmOpen,
    handleCloseDialog,
    handleActivationStatus,
    handleConfirmDelete,
    handleChangeTab,
    ...detail
  } = useDeviceDetailPage();

  return (
    <>
      <DetailContent
        {...detail}
        deviceData={currentDevice}
        onChangeTab={handleChangeTab}
        onEdit={handleEdit}
        onOpenStatusDialog={handleStatusConfirmOpen}
        onOpenDeleteDialog={handleDeleteConfirmOpen}
      />

      <SimpleConfirmDialog
        open={statusOpen}
        title={statusDialogContent.title}
        content={statusDialogContent.content}
        confirmLabel={statusDialogContent.confirmLabel}
        onClose={() => {
          handleCloseDialog();
        }}
        onConfirm={handleActivationStatus}
      />

      <RevokeDialog
        open={deleteOpen}
        onClose={handleCloseDialog}
        title="Delete Device"
        content={`Are you sure you want to delete "${currentDevice?.deviceName}"?
        This action is permanent and cannot be undone. All data associated with this device will be wiped.`}
        inputLabel="Re-enter the device name to confirm deletion"
        mismatchText="Device name does not match."
        confirmName={currentDevice?.deviceName || ''}
        confirmDisabled={!canDelete}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
