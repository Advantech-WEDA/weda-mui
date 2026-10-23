import EditorForm from '../components/EditorForm';
import { useStackEditorPage } from '../hooks/useStackEditorPage';

export default function AddStack() {
  const {
    cancelOpen,
    submitOpen,
    stackData,
    stackFile,
    environmentVariables,
    errors,
    setCancelOpen,
    setEnvironmentVariables,
    handleOnChange,
    handleStackFileChange,
    handleSubmit,
    handleCancel,
    handleConfirmCancel,
    handleSubmitConfirmOpen,
  } = useStackEditorPage('add');

  return (
    <EditorForm
      mode="add"
      cancelOpen={cancelOpen}
      submitOpen={submitOpen}
      stackData={stackData}
      stackFile={stackFile}
      environmentVariables={environmentVariables}
      errors={errors}
      onChange={handleOnChange}
      onStackFileChange={handleStackFileChange}
      onEnvironmentVariablesChange={setEnvironmentVariables}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onConfirmCancel={handleConfirmCancel}
      onOpenCancelDialog={() => setCancelOpen(true)}
      onOpenSubmitDialog={handleSubmitConfirmOpen}
    />
  );
}
