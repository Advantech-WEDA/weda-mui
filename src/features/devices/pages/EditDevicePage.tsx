import EditorForm from '../components/EditorForm';
import { useDeviceEditorPage } from '../hooks/useDeviceEditorPage';

export default function EditDevice() {
  const {
    cancelOpen,
    submitOpen,
    deviceData,
    submitted,
    errors,
    userEditedDeviceName,
    setCancelOpen,
    handleOnChange,
    handleSubmit,
    handleCancel,
    handleConfirmCancel,
    handleSubmitConfirmOpen,
  } = useDeviceEditorPage('edit');

  return (
    <EditorForm
      mode="edit"
      submitted={submitted}
      cancelOpen={cancelOpen}
      submitOpen={submitOpen}
      deviceData={deviceData}
      userEditedDeviceName={userEditedDeviceName}
      errors={errors}
      onChange={handleOnChange}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onConfirmCancel={handleConfirmCancel}
      onOpenCancelDialog={() => setCancelOpen(true)}
      onOpenSubmitDialog={handleSubmitConfirmOpen}
    />
  );
}
