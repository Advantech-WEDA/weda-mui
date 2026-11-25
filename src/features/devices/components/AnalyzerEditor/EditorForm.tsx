import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import {
  Breadcrumbs,
  ConfirmDialog,
  ScrollSideTabs,
  SimpleConfirmDialog,
  SvgIcon,
} from '@shared/ui';
import { useRef } from 'react';

import { useAddDataStreamDialog } from '@/features/devices/hooks/useAddDataStreamDialog';
import type { useAnalyzerEditorPage } from '@/features/devices/hooks/useAnalyzerEditorPage';

import AddDataStreamDialog from './AddDataStreamDialog';
import BasicInformation from './BasicInformation';
import DataStreamSelect from './DataStreamSelect';

type IProps = ReturnType<typeof useAnalyzerEditorPage>;

const TAB_ITEMS = [
  { key: 'basic', label: 'Basic information' },
  { key: 'input', label: 'Input' },
  { key: 'output', label: 'Output' },
];

export default function EditorForm({
  mode,
  analyzerName,
  canSubmit,
  isComplete,
  loading,
  submitting,
  dataStreamsLoading,
  inputOptions,
  outputOptions,
  values,
  errors,
  cancelOpen,
  submitOpen,
  handleChange,
  handleExpressionBlur,
  handleDataStreamCreated,
  handleOpenCancelDialog,
  handleOpenSubmitDialog,
  handleCloseDialogs,
  handleLeave,
  handleSubmit,
}: IProps) {
  const pageTitle =
    mode === 'edit'
      ? analyzerName
        ? `Edit "${analyzerName}"`
        : 'Edit Transfer Function Analyzer'
      : 'Add Transfer Function Analyzer';
  const submitDisabled = !canSubmit || !isComplete || loading || submitting;

  const fieldsDisabled = loading || !canSubmit;

  const addDataStream = useAddDataStreamDialog(handleDataStreamCreated);

  const basicRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLDivElement | null>(null);
  const outputRef = useRef<HTMLDivElement | null>(null);
  const sections = [
    { key: 'basic', ref: basicRef, id: 'basic-information-section' },
    { key: 'input', ref: inputRef, id: 'input-section' },
    { key: 'output', ref: outputRef, id: 'output-section' },
  ];

  const actionButtons = (size?: 'small') => (
    <>
      <Button
        size={size}
        variant="outlined"
        className={
          size
            ? 'editor-page__footer__btn-cancel'
            : 'editor-page__header-actions-btn-cancel'
        }
        onClick={handleOpenCancelDialog}
      >
        Cancel
      </Button>

      <Button
        size={size}
        variant="contained"
        className={
          size
            ? 'editor-page__footer__btn-submit'
            : 'editor-page__header-actions-btn-submit'
        }
        disabled={submitDisabled}
        onClick={handleOpenSubmitDialog}
      >
        Submit
      </Button>
    </>
  );

  return (
    <Box className="editor-page">
      <Box className="editor-page__header">
        <Breadcrumbs />
        <Box className="editor-page__header-top">
          <Box className="editor-page__header-title">
            <Typography variant="h4">{pageTitle}</Typography>
            <Typography variant="body2">*Required</Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            className="editor-page__header-actions"
          >
            {actionButtons()}
          </Stack>
        </Box>

        <Divider className="editor-page__header-divider" />
      </Box>

      <Box className="editor-page__content">
        <Box className="editor-page__left">
          <Box
            id="basic-information-section"
            ref={basicRef}
            className="editor-page__left-section"
          >
            <Box className="editor-page__left-title">
              <Typography variant="h5" color="text.primary">
                Basic information
              </Typography>
            </Box>

            <BasicInformation
              values={values}
              errors={errors}
              disabled={fieldsDisabled}
              onChange={handleChange}
              onExpressionBlur={handleExpressionBlur}
            />
          </Box>

          <Box
            id="input-section"
            ref={inputRef}
            className="editor-page__left-section"
          >
            <Box className="editor-page__left-title">
              <Typography variant="h5" color="text.primary">
                Input
              </Typography>
            </Box>

            <Box className="editor-page__form">
              <Box className="editor-page__form-wrapper">
                <DataStreamSelect
                  value={values.inputDataStreamId}
                  options={inputOptions}
                  excludeId={values.outputDataStreamId}
                  error={errors.inputDataStreamId}
                  loading={dataStreamsLoading}
                  disabled={fieldsDisabled}
                  onChange={(id) => handleChange('inputDataStreamId', id)}
                />
              </Box>
            </Box>
          </Box>

          <Box
            id="output-section"
            ref={outputRef}
            className="editor-page__left-section"
          >
            <Box className="editor-page__left-title">
              <Typography variant="h5" color="text.primary">
                Output
              </Typography>
            </Box>

            <Box className="editor-page__form">
              <Box className="editor-page__form-wrapper">
                <Stack spacing={2} pb={2}>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      alignSelf: 'flex-start',
                      whiteSpace: 'nowrap',
                      textTransform: 'none',
                    }}
                    className="page-btn page-add-btn"
                    startIcon={
                      <SvgIcon
                        name="Add"
                        sx={{ color: 'var(--primary-contrastText)' }}
                      />
                    }
                    onClick={addDataStream.handleOpen}
                  >
                    <Typography variant="body1">Add DataStream</Typography>
                  </Button>
                </Stack>
                <DataStreamSelect
                  value={values.outputDataStreamId}
                  options={outputOptions}
                  excludeId={values.inputDataStreamId}
                  error={errors.outputDataStreamId}
                  loading={dataStreamsLoading}
                  disabled={fieldsDisabled}
                  onChange={(id) => handleChange('outputDataStreamId', id)}
                />
              </Box>
            </Box>
          </Box>

          <Stack direction="row" spacing={1} className="editor-page__footer">
            {actionButtons('small')}
          </Stack>
        </Box>

        <Box className="editor-page__right">
          <ScrollSideTabs sections={sections} tabItems={TAB_ITEMS} />
        </Box>
      </Box>

      <AddDataStreamDialog {...addDataStream} />

      <ConfirmDialog
        open={cancelOpen}
        onClose={handleCloseDialogs}
        title="Unsaved Changes"
        content="Do you want to leave this page? Any unsaved changes will be lost."
        actions={[
          { label: 'Keep editing', onClick: handleCloseDialogs },
          { label: 'Don’t save', onClick: handleLeave },
        ]}
      />

      {mode === 'edit' ? (
        <SimpleConfirmDialog
          open={submitOpen}
          title="Save Changes"
          content="Are you sure you want to save these changes?"
          confirmLabel="Save"
          onClose={handleCloseDialogs}
          onConfirm={handleSubmit}
        />
      ) : (
        <SimpleConfirmDialog
          open={submitOpen}
          title="Add Analyzer"
          content={`Are you sure you want to add the Analyzer "${values.name.trim()}"?`}
          confirmLabel="Add"
          onClose={handleCloseDialogs}
          onConfirm={handleSubmit}
        />
      )}
    </Box>
  );
}
