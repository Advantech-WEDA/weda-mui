import EditorForm from '@/features/devices/components/DeployAiModel/EditorForm';
import { useDeviceDeployAiModelPage } from '@/features/devices/hooks/useDeviceDeployAiModelPage';

export default function DeployDeviceAiModelPage() {
  const {
    handleSelectModel,
    handleSelectAll,
    handleSubmit,
    handleCancel,
    handleConfirmCancel,
    handleSubmitConfirmOpen,
    setCancelOpen,
    handleDeploySetupChange,
    handleContainerChange,
    ...deployPage
  } = useDeviceDeployAiModelPage();

  return (
    <EditorForm
      {...deployPage}
      onDeploySetupChange={handleDeploySetupChange}
      onContainerChange={handleContainerChange}
      onSelectModel={handleSelectModel}
      onSelectAll={handleSelectAll}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onConfirmCancel={handleConfirmCancel}
      onOpenCancelDialog={() => setCancelOpen(true)}
      onOpenSubmitDialog={handleSubmitConfirmOpen}
    />
  );
}
