import { RevokeDialog } from '@shared/ui';

import DetailContent from '../components/DetailContent';
import { useEditionDetailPage } from '../hooks/useEditionDetailPage';

export default function EditionDetailPage() {
  const {
    tab,
    loading,
    hasPermission,
    modelItem,
    editionDetail,
    deleteOpen,
    inputValue,
    setInputValue,
    canDelete,
    handleChangeTab,
    handleBack,
    handleEdit,
    handleDeleteConfirmOpen,
    handleCloseDialog,
    handleConfirmDelete,
  } = useEditionDetailPage();

  if (loading) return null;

  return (
    <>
      <DetailContent
        tab={tab}
        hasPermission={hasPermission}
        modelItem={modelItem}
        editionDetail={editionDetail}
        onChangeTab={handleChangeTab}
        onBack={handleBack}
        onEdit={handleEdit}
        onOpenDeleteDialog={handleDeleteConfirmOpen}
      />

      <RevokeDialog
        open={deleteOpen}
        title="Delete Edition"
        content={`Are you sure you want to delete edition "${editionDetail?.edition}"? This action cannot be undone.`}
        inputLabel="Re-enter the edition name to confirm deletion"
        mismatchText="Edition name does not match."
        confirmName={editionDetail?.edition || ''}
        confirmDisabled={!canDelete}
        deleteLabel="Delete"
        inputValue={inputValue}
        onInputChange={setInputValue}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
