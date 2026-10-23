import EditorForm from '../components/EditorForm';
import { useRegistryEditorPage } from '../hooks/useRegistriesPage';

export default function AddRegistry() {
  const {
    cancelOpen,
    submitOpen,
    registryData,
    errors,
    credentialsDirty,
    canSubmit,
    setCancelOpen,
    handleOnChange,
    handleSubmit,
    handleCancel,
    handleConfirmCancel,
    handleSubmitConfirmOpen,
  } = useRegistryEditorPage('add');

  return (
    <EditorForm
      mode="add"
      cancelOpen={cancelOpen}
      submitOpen={submitOpen}
      registryData={registryData}
      errors={errors}
      credentialsDirty={credentialsDirty}
      canSubmit={canSubmit}
      onChange={handleOnChange}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onConfirmCancel={handleConfirmCancel}
      onOpenCancelDialog={() => setCancelOpen(true)}
      onOpenSubmitDialog={handleSubmitConfirmOpen}
    />
  );
}
