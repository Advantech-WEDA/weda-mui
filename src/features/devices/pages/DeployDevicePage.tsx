import EditorForm from '../components/Deploy/EditorForm';
import { useDeviceDeployPage } from '../hooks/useDeviceDeployPage';

export default function DeployDevice() {
  const {
    handleSelectStackConfig,
    handleSelectAll,
    handleSubmit,
    handleCancel,
    handleConfirmCancel,
    handleSubmitConfirmOpen,
    setCancelOpen,
    ...deployPage
  } = useDeviceDeployPage();

  return (
    <EditorForm
      {...deployPage}
      onSelectStackConfig={handleSelectStackConfig}
      onSelectAll={handleSelectAll}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onConfirmCancel={handleConfirmCancel}
      onOpenCancelDialog={() => setCancelOpen(true)}
      onOpenSubmitDialog={handleSubmitConfirmOpen}
    />
  );
}
