import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import {
  Breadcrumbs,
  ScrollSideTabs,
  SimpleConfirmDialog,
  UnsavedChangesDialog,
} from '@shared/ui';
import { useMemo, useRef } from 'react';

import type { MqttBrokerForm, MqttBrokerFormErrors } from '../domain/types';
import BasicInformation from './BasicInformation';
import Credentials from './Credentials';

interface IProps {
  mode: 'add' | 'edit';
  cancelOpen: boolean;
  submitOpen: boolean;
  formData: MqttBrokerForm;
  errors: MqttBrokerFormErrors;
  onChange: (
    field:
      | 'name'
      | 'brokerEndpoint'
      | 'mqttProtocolVersion'
      | 'username'
      | 'password',
    value: string
  ) => void;
  isChangingCredentials: boolean;
  onChangeCredentials: () => void;
  onKeepSavedCredentials: () => void;
  onCancel: () => void;
  onSubmit: () => void | Promise<void>;
  onConfirmCancel: () => void | Promise<void>;
  onOpenCancelDialog?: () => void | Promise<void>;
  onOpenSubmitDialog?: () => void | Promise<void>;
}

export default function EditorForm({
  mode,
  cancelOpen,
  submitOpen,
  formData,
  errors,
  onChange,
  isChangingCredentials,
  onChangeCredentials,
  onKeepSavedCredentials,
  onCancel,
  onSubmit,
  onConfirmCancel,
  onOpenCancelDialog,
  onOpenSubmitDialog,
}: IProps) {
  const modeType = mode === 'add' ? 'Add' : 'Edit';
  const pageTitle =
    modeType === 'Edit' ? 'Edit MQTT Broker' : 'Add MQTT Broker';

  const basicRef = useRef<HTMLDivElement | null>(null);
  const credentialsRef = useRef<HTMLDivElement | null>(null);

  const tabItems = useMemo(
    () => [
      { key: 'basic', label: 'Basic information' },
      { key: 'credentials', label: 'Credentials' },
    ],
    []
  );

  const sections = useMemo(
    () => [
      { key: 'basic', ref: basicRef, id: 'basic-information-section' },
      { key: 'credentials', ref: credentialsRef, id: 'credentials-section' },
    ],
    []
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
            <Button
              variant="outlined"
              className="editor-page__header-actions-btn-cancel"
              onClick={onOpenCancelDialog}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              className="editor-page__header-actions-btn-submit"
              onClick={onOpenSubmitDialog}
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
              mode={mode}
              formData={formData}
              errors={errors}
              onChange={onChange}
            />
          </Box>

          <Box
            id="credentials-section"
            ref={credentialsRef}
            className="editor-page__left-section"
          >
            <Typography className="editor-page__left-title" variant="h5">
              Credentials
            </Typography>

            <Credentials
              mode={mode}
              formData={formData}
              errors={errors}
              isChangingCredentials={isChangingCredentials}
              onChange={onChange}
              onChangeCredentials={onChangeCredentials}
              onKeepSavedCredentials={onKeepSavedCredentials}
            />
          </Box>

          <Stack direction="row" spacing={1} className="editor-page__footer">
            <Button
              size="small"
              variant="outlined"
              className="editor-page__footer__btn-cancel"
              onClick={onOpenCancelDialog}
            >
              Cancel
            </Button>

            <Button
              size="small"
              variant="contained"
              className="editor-page__footer__btn-submit"
              onClick={onOpenSubmitDialog}
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
        onKeepEditing={onConfirmCancel}
        onDiscard={onCancel}
      />

      {modeType === 'Edit' ? (
        <SimpleConfirmDialog
          open={submitOpen}
          title="Save Changes"
          content="Are you sure you want to save these changes?"
          confirmLabel="Save"
          onClose={onConfirmCancel}
          onConfirm={onSubmit}
        />
      ) : (
        <SimpleConfirmDialog
          open={submitOpen}
          title="Add MQTT Broker"
          content="Are you sure you want to add this MQTT broker?"
          confirmLabel="Add"
          onClose={onConfirmCancel}
          onConfirm={onSubmit}
        />
      )}
    </Box>
  );
}
