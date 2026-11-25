import { RevokeDialog, SimpleConfirmDialog } from '@shared/ui';

import DetailContent from '../components/Detail/DetailContent';
import { useDataStreamBridgeDetailPage } from '../hooks/useDataStreamBridgeDetailPage';

export default function DataStreamBridgeDetailPage() {
  const {
    bridgeId,
    activeTab,
    loading,
    hasPermission,
    bridgeData,
    bridgeName,
    lastUpdated,
    fetchBridge,
    handleChangeTab,
    handleBack,
    handleEdit,
    deleteOpen,
    inputValue,
    setInputValue,
    canDelete,
    handleDeleteConfirmOpen,
    handleCloseDeleteDialog,
    handleConfirmDelete,
    toggleOpen,
    toggling,
    toggleDialogContent,
    handleOpenToggleDialog,
    handleCloseToggleDialog,
    handleConfirmToggle,
  } = useDataStreamBridgeDetailPage();

  return (
    <>
      <DetailContent
        bridgeId={bridgeId}
        activeTab={activeTab}
        loading={loading}
        hasPermission={hasPermission}
        bridgeData={bridgeData}
        lastUpdated={lastUpdated}
        toggling={toggling}
        fetchBridge={fetchBridge}
        onChangeTab={handleChangeTab}
        onBack={handleBack}
        onEdit={handleEdit}
        onOpenDeleteDialog={handleDeleteConfirmOpen}
        onToggleEnabled={handleOpenToggleDialog}
      />

      <RevokeDialog
        open={deleteOpen}
        onClose={handleCloseDeleteDialog}
        title="Delete bridge"
        content={`Are you sure you want to delete bridge "${bridgeName}"?`}
        inputLabel="Re-enter the bridge name to confirm deletion"
        mismatchText="Bridge name does not match."
        confirmName={bridgeName}
        confirmDisabled={!hasPermission || !canDelete}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onConfirm={handleConfirmDelete}
      />

      <SimpleConfirmDialog
        open={toggleOpen}
        title={toggleDialogContent.title}
        content={toggleDialogContent.content}
        confirmLabel={toggleDialogContent.confirmLabel}
        onClose={handleCloseToggleDialog}
        onConfirm={handleConfirmToggle}
      />
    </>
  );
}
