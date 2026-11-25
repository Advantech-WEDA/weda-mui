import { RevokeDialog } from '@shared/ui';

import DetailContent from '../components/DetailContent';
import { useMqttBrokerDetailPage } from '../hooks/useMqttBrokerDetailPage';

export default function MqttBrokerDetailPage() {
  const {
    deleteOpen,
    inputValue,
    setInputValue,
    hasPermission,
    canDelete,
    brokerData,
    brokerName,
    loadState,
    isLoaded,
    handleRetry,
    handleBack,
    handleEdit,
    handleDeleteConfirmOpen,
    handleCloseDialog,
    handleConfirmDelete,
  } = useMqttBrokerDetailPage();

  return (
    <>
      <DetailContent
        hasPermission={hasPermission}
        brokerData={brokerData}
        loadState={loadState}
        onBack={handleBack}
        onRetry={handleRetry}
        onEdit={handleEdit}
        onOpenDeleteDialog={handleDeleteConfirmOpen}
      />

      <RevokeDialog
        open={deleteOpen}
        onClose={handleCloseDialog}
        title="Delete broker config"
        content={`Are you sure you want to delete broker config "${brokerName}"?`}
        inputLabel="Re-enter the broker name to confirm deletion"
        mismatchText="Broker name does not match."
        confirmName={brokerName}
        confirmDisabled={!hasPermission || !isLoaded || !canDelete}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
