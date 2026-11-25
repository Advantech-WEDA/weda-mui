import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import {
  Breadcrumbs,
  ConfirmDialog,
  ScrollSideTabs,
  SimpleConfirmDialog,
} from '@shared/ui';
import { useRef } from 'react';

import type { useDataStreamEditorPage } from '@/features/devices/hooks/useDataStreamEditorPage';

import BasicInformation from './BasicInformation';

type IProps = ReturnType<typeof useDataStreamEditorPage>;

const TAB_ITEMS = [{ key: 'basic', label: 'Basic information' }];

export default function EditorForm({
  mode,
  canSubmit,
  loading,
  submitting,
  values,
  errors,
  originalDisplayName,
  isSystemManaged,
  cancelOpen,
  submitOpen,
  handleChange,
  handleOpenCancelDialog,
  handleOpenSubmitDialog,
  handleCloseDialogs,
  handleLeave,
  handleSubmit,
}: IProps) {
  const pageTitle =
    mode === 'edit'
      ? originalDisplayName
        ? `Edit "${originalDisplayName}"`
        : 'Edit DataStream'
      : 'Add DataStream';
  const submitDisabled = !canSubmit || loading || submitting;

  const basicRef = useRef<HTMLDivElement | null>(null);
  const sections = [
    { key: 'basic', ref: basicRef, id: 'basic-information-section' },
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
              mode={mode}
              values={values}
              errors={errors}
              isSystemManaged={isSystemManaged}
              disabled={loading || !canSubmit}
              onChange={handleChange}
            />
          </Box>

          <Stack direction="row" spacing={1} className="editor-page__footer">
            {actionButtons('small')}
          </Stack>
        </Box>

        <Box className="editor-page__right">
          <ScrollSideTabs sections={sections} tabItems={TAB_ITEMS} />
        </Box>
      </Box>

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
          title="Add DataStream"
          content={`Are you sure you want to add the DataStream "${values.dataStreamName.trim()}"?`}
          confirmLabel="Add"
          onClose={handleCloseDialogs}
          onConfirm={handleSubmit}
        />
      )}
    </Box>
  );
}
