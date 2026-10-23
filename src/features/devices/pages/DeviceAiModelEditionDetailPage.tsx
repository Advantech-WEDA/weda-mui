import { RevokeDialog, SimpleConfirmDialog } from '@shared/ui';

import DeviceAiModelEditionDetailContent from '@/features/devices/components/DeviceAiModelEditionDetailContent';
import { useDeviceAiModelEditionDetailPage } from '@/features/devices/hooks/useDeviceAiModelEditionDetailPage';

export default function DeviceAiModelEditionDetailPage() {
  const {
    loading,
    hasPermission,
    modelItem,
    editionDetail,
    redeployOpen,
    deleteOpen,
    inputValue,
    setInputValue,
    canDelete,
    canRedeploy,
    handleBack,
    handleRedeployConfirmOpen,
    handleCloseRedeployDialog,
    handleConfirmRedeploy,
    handleDeleteConfirmOpen,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  } = useDeviceAiModelEditionDetailPage();

  if (loading) return null;

  return (
    <>
      <DeviceAiModelEditionDetailContent
        hasPermission={hasPermission}
        modelItem={modelItem}
        editionDetail={editionDetail}
        canRedeploy={canRedeploy}
        onBack={handleBack}
        onRedeploy={handleRedeployConfirmOpen}
        onOpenDeleteDialog={handleDeleteConfirmOpen}
      />

      <SimpleConfirmDialog
        open={redeployOpen}
        title="Redeploy AI model"
        content={`Are you sure you want to redeploy "${modelItem?.modelName}" (${editionDetail?.edition}) to this device?`}
        confirmLabel="Redeploy"
        onClose={handleCloseRedeployDialog}
        onConfirm={handleConfirmRedeploy}
      />

      <RevokeDialog
        open={deleteOpen}
        title="Delete AI model"
        content={`Are you sure you want to delete "${modelItem?.modelName}" (${editionDetail?.edition}) from this device? The application on this device may no longer be able to use this model.`}
        inputLabel="Re-enter the model name to confirm deletion"
        mismatchText="Model name does not match."
        confirmName={modelItem?.modelName || ''}
        confirmDisabled={!canDelete}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
