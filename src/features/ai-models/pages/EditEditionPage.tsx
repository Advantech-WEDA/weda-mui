import { Box, TextField } from '@mui/material';

import EditionFields from '@/features/ai-models/components/EditionFields';
import ModelEditorForm from '@/features/ai-models/components/ModelEditorForm';
import { useEditEditionPage } from '@/features/ai-models/hooks/useEditEditionPage';

export default function EditEditionPage() {
  const {
    cancelOpen,
    submitOpen,
    submitting,
    hasPermission,
    detail,
    description,
    descriptionError,
    descriptionErrorMessage,
    file,
    fileError,
    fileErrorMessage,
    fileHash,
    cancelHash,
    retryHash,
    setCancelOpen,
    setDescription,
    handleFileChange,
    handleSubmit,
    handleCancel,
    handleConfirmCancel,
    handleSubmitConfirmOpen,
  } = useEditEditionPage();

  if (!detail) return null;

  return (
    <ModelEditorForm
      title={`Edit "${detail.edition ?? ''}"`}
      cancelOpen={cancelOpen}
      submitOpen={submitOpen}
      submitting={submitting}
      submitDisabled={Boolean(file) && fileHash.status !== 'done'}
      hasPermission={hasPermission}
      submitDialogTitle="Save Changes"
      submitDialogContent="Are you sure you want to save these changes?"
      submitLabel="Save"
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
            <EditionFields
              beforeContent={
                <Box className="editor-page__form-wrapper">
                  <TextField
                    fullWidth
                    size="small"
                    label="AI model name"
                    multiline
                    minRows={1}
                    maxRows={5}
                    value={detail.modelName ?? ''}
                    disabled
                  />
                </Box>
              }
              input={{
                editionName: detail.edition ?? '',
                editionNameDisabled: true,
                description,
                showFile: true,
                fileDisabled: true,
                file,
                existingFileName: detail.file?.fileName,
                fileHash,
              }}
              errors={{
                description: descriptionError,
                descriptionMessage:
                  descriptionErrorMessage || 'Description is required',
                file: fileError,
                fileMessage: fileErrorMessage || 'File is required',
              }}
              onDescriptionChange={setDescription}
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
