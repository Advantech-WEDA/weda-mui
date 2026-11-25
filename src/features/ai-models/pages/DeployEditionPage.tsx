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
    handleDeploySetupChange,
    handleContainerChange,
    ...deployPage
  } = useDeployEditionPage();

  return (
    <EditorForm
      {...deployPage}
      onDeploySetupChange={handleDeploySetupChange}
      onContainerChange={handleContainerChange}
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
