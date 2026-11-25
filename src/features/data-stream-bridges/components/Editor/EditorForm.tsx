import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import {
  Breadcrumbs,
  ScrollSideTabs,
  SimpleConfirmDialog,
  UnsavedChangesDialog,
} from '@shared/ui';
import { useMemo, useRef } from 'react';

import type { DataStreamBridgeEditorState } from '../../hooks/useDataStreamBridgeEditorPage';
import BasicInformation from './BasicInformation';
import DataStreamList from './DataStreamList';

interface IProps {
  mode: 'add' | 'edit';
  editor: DataStreamBridgeEditorState;
}

export default function EditorForm({ mode, editor }: IProps) {
  const {
    cancelOpen,
    submitOpen,
    submitting,
    formData,
    errors,
    canSubmit,
    brokers,
    brokersLoading,
    devices,
    devicesLoading,
    streamsByDevice,
    streamsLoadingIds,
    setCancelOpen,
    handleBasicChange,
    handleBindingChange,
    handleAddBinding,
    handleRemoveBindings,
    handleSubmit,
    handleCancel,
    handleConfirmCancel,
    handleSubmitConfirmOpen,
  } = editor;

  const isEdit = mode === 'edit';
  const pageTitle = isEdit ? 'Edit DataStream Bridge' : 'Add DataStream Bridge';
  const listTitle = `DataStream list (${formData.bindings.length})`;

  const basicRef = useRef<HTMLDivElement | null>(null);
  const streamsRef = useRef<HTMLDivElement | null>(null);

  const tabItems = useMemo(
    () => [
      { key: 'basic', label: 'Basic information' },
      { key: 'streams', label: listTitle },
    ],
    [listTitle]
  );

  const sections = useMemo(
    () => [
      { key: 'basic', ref: basicRef, id: 'basic-information-section' },
      { key: 'streams', ref: streamsRef, id: 'data-stream-list-section' },
    ],
    []
  );

  const submitDisabled = !canSubmit || submitting;

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
            <Button
              variant="outlined"
              className="editor-page__header-actions-btn-cancel"
              onClick={() => setCancelOpen(true)}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              className="editor-page__header-actions-btn-submit"
              disabled={submitDisabled}
              onClick={handleSubmitConfirmOpen}
            >
              Submit
            </Button>
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
            <Typography className="editor-page__left-title" variant="h5">
              Basic information
            </Typography>

            <BasicInformation
              formData={formData}
              errors={errors}
              brokers={brokers}
              brokersLoading={brokersLoading}
              onChange={handleBasicChange}
            />
          </Box>

          <Box
            id="data-stream-list-section"
            ref={streamsRef}
            className="editor-page__left-section"
          >
            <Typography className="editor-page__left-title" variant="h5">
              {listTitle}
            </Typography>

            <DataStreamList
              rows={formData.bindings}
              errors={errors}
              devices={devices}
              devicesLoading={devicesLoading}
              streamsByDevice={streamsByDevice}
              streamsLoadingIds={streamsLoadingIds}
              onChange={handleBindingChange}
              onAdd={handleAddBinding}
              onRemove={handleRemoveBindings}
            />
          </Box>

          <Stack direction="row" spacing={1} className="editor-page__footer">
            <Button
              size="small"
              variant="outlined"
              className="editor-page__footer__btn-cancel"
              onClick={() => setCancelOpen(true)}
            >
              Cancel
            </Button>

            <Button
              size="small"
              variant="contained"
              className="editor-page__footer__btn-submit"
              disabled={submitDisabled}
              onClick={handleSubmitConfirmOpen}
            >
              Submit
            </Button>
          </Stack>
        </Box>

        <Box className="editor-page__right">
          <ScrollSideTabs sections={sections} tabItems={tabItems} />
        </Box>
      </Box>

      <UnsavedChangesDialog
        open={cancelOpen}
        onKeepEditing={handleConfirmCancel}
        onDiscard={handleCancel}
      />

      {isEdit ? (
        <SimpleConfirmDialog
          open={submitOpen}
          title="Save Changes"
          content="Are you sure you want to save these changes?"
          confirmLabel="Save"
          loading={submitting}
          onClose={handleConfirmCancel}
          onConfirm={handleSubmit}
        />
      ) : (
        <SimpleConfirmDialog
          open={submitOpen}
          title="Add DataStream Bridge"
          content="Are you sure you want to add this DataStream bridge?"
          confirmLabel="Add"
          loading={submitting}
          onClose={handleConfirmCancel}
          onConfirm={handleSubmit}
        />
      )}
    </Box>
  );
}
