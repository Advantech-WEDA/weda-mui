import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import {
  Breadcrumbs,
  ConfirmDialog,
  ScrollSideTabs,
  SimpleConfirmDialog,
} from '@shared/ui';
import { useMemo, useRef } from 'react';

import type { ICreateStackConfigPayload } from '../api/stacks.api.types';
import type { IEnvironmentVariable, IStackErrors } from '../domain/types';
import BasicInformation from './BasicInformation';
import EnvironmentVariables from './EnvironmentVariables';

interface IProps {
  mode: 'add' | 'edit';
  cancelOpen: boolean;
  submitOpen: boolean;
  stackData: ICreateStackConfigPayload;
  stackFile: File | null;
  environmentVariables: IEnvironmentVariable[];
  errors: IStackErrors;
  onChange: (category: string, value?: string) => void;
  onStackFileChange: (file: File | null) => void;
  onEnvironmentVariablesChange: (items: IEnvironmentVariable[]) => void;
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
  stackData,
  stackFile,
  environmentVariables,
  errors,
  onChange,
  onStackFileChange,
  onEnvironmentVariablesChange,
  onCancel,
  onSubmit,
  onConfirmCancel,
  onOpenCancelDialog,
  onOpenSubmitDialog,
}: IProps) {
  const modeType = mode === 'add' ? 'Add' : 'Edit';
  const pageTitle =
    mode === 'edit' ? 'Edit Container Stack' : 'Add Container Stack';

  const basicRef = useRef<HTMLDivElement | null>(null);
  const environmentRef = useRef<HTMLDivElement | null>(null);

  const tabItems = useMemo(() => {
    const items = [
      { key: 'basic', label: 'Basic information' },
      { key: 'environment', label: 'Environment variables' },
    ];

    return items;
  }, []);

  const sections = useMemo(
    () => [
      {
        key: 'basic',
        ref: basicRef,
        id: 'basic-information-section',
      },
      {
        key: 'environment',
        ref: environmentRef,
        id: 'environment-variables-section',
      },
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
            <Box sx={{ p: 2 }}>
              <Typography variant="h5">Basic information</Typography>

              <Typography variant="body2" color="text.secondary">
                Creating a stack with an existing name, or editing a stack, will
                automatically generate a new version.
              </Typography>
            </Box>

            <BasicInformation
              stackData={stackData}
              stackFile={stackFile}
              mode={mode}
              errors={errors}
              onChange={onChange}
              onStackFileChange={onStackFileChange}
            />
          </Box>

          <Box
            id="environment-variables-section"
            ref={environmentRef}
            className="editor-page__left-section"
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="h5">Environment variables</Typography>
            </Box>

            <EnvironmentVariables
              environmentVariables={environmentVariables}
              onEnvironmentVariablesChange={onEnvironmentVariablesChange}
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

      <SimpleConfirmDialog
        open={submitOpen}
        title={modeType === 'Edit' ? 'Save Changes' : 'Add Stack'}
        content={
          modeType === 'Edit'
            ? 'Are you sure you want to save these changes?'
            : 'Are you sure you want to add this stack?'
        }
        confirmLabel={modeType === 'Edit' ? 'Save' : 'Add'}
        onClose={onConfirmCancel}
        onConfirm={onSubmit}
      />
    </Box>
  );
}
