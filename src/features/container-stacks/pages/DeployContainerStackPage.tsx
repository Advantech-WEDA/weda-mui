import EditorForm from '../components/Deploy/EditorForm';
import { useStackDeployPage } from '../hooks/useStackDeployPage';

export default function DeployStack() {
  const {
    handleSelectDevice,
    handleSelectAll,
    handleSubmit,
    handleCancel,
    handleConfirmCancel,
    handleOpenCancelDialog,
    handleSubmitConfirmOpen,
    ...deployPage
  } = useStackDeployPage();

  return (
    <EditorForm
      {...deployPage}
      onSelectDevice={handleSelectDevice}
      onSelectAll={handleSelectAll}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onConfirmCancel={handleConfirmCancel}
      onOpenCancelDialog={handleOpenCancelDialog}
      onOpenSubmitDialog={handleSubmitConfirmOpen}
    />
  );
}
