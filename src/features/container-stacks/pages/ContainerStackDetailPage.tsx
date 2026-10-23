import { RevokeDialog } from '@shared/ui';

import DetailContent from '../components/DetailContent';
import { useStackDetailPage } from '../hooks/useStackDetailPage';

export default function DetailStack() {
  const {
    tab,
    deleteOpen,
    inputValue,
    setInputValue,
    hasPermission,
    stackData,
    handleChangeTab,
    handleEdit,
    handleDeleteConfirmOpen,
    handleCloseDialog,
    handleConfirmDelete,
  } = useStackDetailPage();

  return (
    <>
      <DetailContent
        tab={tab}
        hasPermission={hasPermission}
        onChangeTab={handleChangeTab}
        stackData={stackData}
        onEdit={handleEdit}
        onOpenDeleteDialog={handleDeleteConfirmOpen}
      />

      <RevokeDialog
        open={deleteOpen}
        onClose={handleCloseDialog}
        title="Delete Deployment"
        content={`Are you sure you want to delete “${stackData.stackName}”? This action is permanent and cannot be undone. All data associated with this deployment will be wiped.`}
        inputLabel="Re-enter the deployment name to confirm deletion"
        mismatchText="Deployment name does not match."
        confirmName={stackData.stackName || ''}
        confirmDisabled={!hasPermission}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
