import BasicInformation from '@/features/ai-models/components/BasicInformation';
import EditionFields from '@/features/ai-models/components/EditionFields';
import ModelEditorForm from '@/features/ai-models/components/ModelEditorForm';
import { useAddModelPage } from '@/features/ai-models/hooks/useAddModelPage';

export default function AddModelPage() {
  const {
    cancelOpen,
    submitOpen,
    submitting,
    hasPermission,
    aiModelItems,
    selectedModel,
    modelNameInput,
    modelDescription,
    edition,
    editionDescription,
    file,
    fileHash,
    cancelHash,
    retryHash,
    errors,
    setCancelOpen,
    setModelDescription,
    setEdition,
    setEditionDescription,
    handleFileChange,
    handleSelectExisting,
    handleModelNameInputChange,
    handleSubmit,
    handleCancel,
    handleConfirmCancel,
    handleSubmitConfirmOpen,
  } = useAddModelPage();

  return (
    <ModelEditorForm
      title="Add AI Model"
      cancelOpen={cancelOpen}
      submitOpen={submitOpen}
      submitting={submitting}
      submitDisabled={fileHash.status !== 'done'}
      hasPermission={hasPermission}
      submitDialogTitle="Add AI Model"
      submitDialogContent="Are you sure you want to add this AI model?"
      submitLabel="Add"
      onCancel={handleCancel}
      onSubmit={handleSubmit}
      onConfirmCancel={handleConfirmCancel}
      onOpenCancelDialog={() => setCancelOpen(true)}
      onOpenSubmitDialog={handleSubmitConfirmOpen}
      sections={[
        {
          key: 'basic',
          label: 'Basic information',
          content: (
            <BasicInformation
              input={{
                aiModelItems,
                modelNameInput,
                selectedModel,
                modelDescription,
              }}
              errors={errors}
              onSelectExisting={handleSelectExisting}
              onChangeNameInput={handleModelNameInputChange}
              onDescriptionChange={setModelDescription}
            />
          ),
        },
        {
          key: 'edition',
          label: 'Edition information',
          content: (
            <EditionFields
              input={{
                editionName: edition,
                editionNameDisabled: false,
                description: editionDescription,
                showFile: true,
                file,
                fileHash,
                fileDisabled: submitting,
              }}
              errors={errors}
              onEditionNameChange={setEdition}
              onDescriptionChange={setEditionDescription}
              onFileChange={handleFileChange}
              onCancelHash={cancelHash}
              onRetryHash={retryHash}
            />
          ),
        },
      ]}
    />
  );
}
