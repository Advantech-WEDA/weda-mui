import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import {
  Breadcrumbs,
  ConfirmDialog,
  ScrollSideTabs,
  SimpleConfirmDialog,
} from '@shared/ui';
import { useMemo, useRef } from 'react';

import type { RegistryType } from '../domain/types';
import type { RegistryForm } from '../domain/types';
import BasicInformation from './BasicInformation';
import Credentials from './Credentials';

interface IProps {
  mode: 'add' | 'edit';
  cancelOpen: boolean;
  submitOpen: boolean;
  registryData?: RegistryForm;
  credentialsDirty?: boolean;
  canSubmit?: boolean;
  errors: {
    registryName: string;
    registryUrl: string;
    registryType: string;
    region: string;
    accessKey: string;
    accessSecretKey: string;
    accessToken: string;
    userPassword: string;
    username: string;
  };
  onChange: (
    category: string,
    registryType?: RegistryType,
    value?: string
  ) => void;
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
  registryData,
  credentialsDirty = false,
  canSubmit = true,
  errors,
  onChange,
  onCancel,
  onSubmit,
  onConfirmCancel,
  onOpenCancelDialog,
  onOpenSubmitDialog,
}: IProps) {
  const modeType = mode === 'add' ? 'Add' : 'Edit';
  const pageTitle =
    modeType === 'Edit' ? 'Edit Container Registry' : 'Add Container Registry';

  const basicRef = useRef<HTMLDivElement | null>(null);
  const credentialsRef = useRef<HTMLDivElement | null>(null);

  const tabItems = useMemo(() => {
    const items = [
      { key: 'basic', label: 'Basic information' },
      { key: 'credentials', label: 'Credentials' },
    ];

    return items;
  }, []);

  const sections = useMemo(() => {
    const items = [
      {
        key: 'basic',
        ref: basicRef,
        id: 'basic-information-section',
      },
      {
        key: 'credentials',
        ref: credentialsRef,
        id: 'credentials-section',
      },
    ];

    return items;
  }, []);

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
              disabled={!canSubmit}
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
              registryData={registryData}
              mode={mode}
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
              registryData={registryData}
              errors={errors}
              mode={mode}
              credentialsDirty={credentialsDirty}
              onChange={onChange}
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
              disabled={!canSubmit}
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

      <ConfirmDialog
        open={cancelOpen}
        onClose={onCancel}
        title="Unsaved Changes"
        content="Do you want to leave this page? Any unsaved changes will be lost."
        actions={[
          {
            label: 'Keep editing',
            onClick: onConfirmCancel,
          },
          {
            label: 'Don’t save',
            onClick: onCancel,
          },
        ]}
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
          title="Add Registry"
          content="Are you sure you want to add this registry?"
          confirmLabel="Add"
          onClose={onConfirmCancel}
          onConfirm={onSubmit}
        />
      )}
    </Box>
  );
}
