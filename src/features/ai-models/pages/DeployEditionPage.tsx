import EditorForm from '../components/Deploy/EditorForm';
import { useDeployEditionPage } from '../hooks/useDeployEditionPage';

export default function DeployEditionPage() {
  const {
    handleSelectDevice,
    handleSelectAll,
    handleSubmit,
    handleCancel,
    handleConfirmCancel,
    handleOpenCancelDialog,
    handleSubmitConfirmOpen,
    ...deployPage
  } = useDeployEditionPage();

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
