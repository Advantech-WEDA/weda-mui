import EditorForm from '../components/EditorForm';
import { useDeviceEditorPage } from '../hooks/useDeviceEditorPage';

export default function AddDevice() {
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
  } = useDeviceEditorPage('add');

  return (
    <EditorForm
      mode="add"
      cancelOpen={cancelOpen}
      submitOpen={submitOpen}
      deviceData={deviceData}
      submitted={submitted}
      errors={errors}
      userEditedDeviceName={userEditedDeviceName}
      onChange={handleOnChange}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onConfirmCancel={handleConfirmCancel}
      onOpenCancelDialog={() => setCancelOpen(true)}
      onOpenSubmitDialog={handleSubmitConfirmOpen}
    />
  );
}
