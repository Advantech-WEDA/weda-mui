import { Box, TextField } from '@mui/material';

import ModelEditorForm from '@/features/ai-models/components/ModelEditorForm';
import { MODEL_NAME_MAX_LENGTH } from '@/features/ai-models/domain/validateRules';
import { useEditModelPage } from '@/features/ai-models/hooks/useEditModelPage';

export default function EditModelPage() {
  const {
    cancelOpen,
    submitOpen,
    submitting,
    loading,
    hasPermission,
    modelName,
    originalModelName,
    description,
    errors,
    setCancelOpen,
    setModelName,
    setDescription,
    handleSubmit,
    handleCancel,
    handleConfirmCancel,
    handleSubmitConfirmOpen,
  } = useEditModelPage();

  if (loading) return null;

  return (
    <ModelEditorForm
      title={`Edit "${originalModelName}"`}
      cancelOpen={cancelOpen}
      submitOpen={submitOpen}
      submitting={submitting}
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
            <Box className="editor-page__form">
              <Box className="editor-page__form-wrapper">
                <TextField
                  fullWidth
                  size="small"
                  className="editor-page__form-wrapper-textfield"
                  label={
                    <>
                      AI model name <span className="required">*</span>
                    </>
                  }
                  multiline
                  disabled
                  minRows={1}
                  maxRows={5}
                  value={modelName}
                  error={errors.modelName}
                  helperText={errors.modelName ? errors.modelNameMessage : ''}
                  slotProps={{
                    input: {
                      inputProps: {
                        maxLength: MODEL_NAME_MAX_LENGTH,
                      },
                    },
                  }}
                  onChange={(e) => setModelName(e.target.value)}
                />

                <Box className="editor-page__form-wrapper-helper">
                  {modelName.trim().length}/{MODEL_NAME_MAX_LENGTH}
                </Box>
              </Box>

              <Box className="editor-page__form-wrapper">
                <TextField
                  fullWidth
                  size="small"
                  className="editor-page__form-wrapper-description"
                  label="Description"
                  multiline
                  minRows={1}
                  maxRows={5}
                  value={description}
                  slotProps={{
                    input: {
                      inputProps: {
                        maxLength: 500,
                      },
                      sx: {
                        padding: '16px 12px',
                      },
                    },
                  }}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <Box className="editor-page__form-wrapper-helper">
                  {description.trim().length}/500
                </Box>
              </Box>
            </Box>
          ),
        },
      ]}
    />
  );
}
