import EditorForm from '../components/EditorForm';
import { useMqttBrokerEditorPage } from '../hooks/useMqttBrokersPage';

export default function AddMqttBrokerPage() {
  const {
    cancelOpen,
    submitOpen,
    formData,
    errors,
    setCancelOpen,
    handleOnChange,
    handleSubmit,
    handleCancel,
    handleConfirmCancel,
    handleSubmitConfirmOpen,
    isChangingCredentials,
    handleChangeCredentials,
    handleKeepSavedCredentials,
  } = useMqttBrokerEditorPage('add');

  return (
    <EditorForm
      mode="add"
      cancelOpen={cancelOpen}
      submitOpen={submitOpen}
      formData={formData}
      errors={errors}
      onChange={handleOnChange}
      isChangingCredentials={isChangingCredentials}
      onChangeCredentials={handleChangeCredentials}
      onKeepSavedCredentials={handleKeepSavedCredentials}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onConfirmCancel={handleConfirmCancel}
      onOpenCancelDialog={() => setCancelOpen(true)}
      onOpenSubmitDialog={handleSubmitConfirmOpen}
    />
  );
}
