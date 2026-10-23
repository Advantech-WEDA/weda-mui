import './devices.scss';

import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import { useHasManagementPermission } from '@shared/session/useHasManagementPermission';
import {
  Breadcrumbs,
  ConfirmDialog,
  ScrollSideTabs,
  SimpleConfirmDialog,
} from '@shared/ui';
import { useMemo, useRef } from 'react';

import type { IDeviceItem } from '../api/devices.api.types';
import BasicInformation from './BasicInformation';

interface IProps {
  mode: 'add' | 'edit';
  cancelOpen: boolean;
  submitOpen: boolean;
  submitted?: boolean;
  userEditedDeviceName: boolean;
  deviceData?: IDeviceItem;
  errors: {
    deviceId: boolean;
    deviceIdMessage: string;

    hwModel: boolean;
    hwModelMessage: string;

    deviceName: boolean;
    deviceNameMessage: string;
  };
  onChange: (category: string, value?: string) => void;
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
  submitted,
  userEditedDeviceName,
  deviceData,
  errors,
  onChange,
  onCancel,
  onSubmit,
  onConfirmCancel,
  onOpenCancelDialog,
  onOpenSubmitDialog,
}: IProps) {
  const modeType = mode === 'add' ? 'Add' : 'Edit';
  const pageTitle = modeType === 'Edit' ? 'Edit Device' : 'Add Device';
  const hasPermission = useHasManagementPermission();

  const basicRef = useRef<HTMLDivElement | null>(null);

  const tabItems = useMemo(() => {
    const items = [{ key: 'basic', label: 'Basic information' }];

    return items;
  }, []);

  const sections = useMemo(() => {
    const items = [
      {
        key: 'basic',
        ref: basicRef,
        id: 'basic-information-section',
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
              disabled={!hasPermission}
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
            <Box className="editor-page__left-title">
              <Typography variant="h5" color="text.primary">
                Basic information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please find the Device ID and Model on the footer of the WEDA
                Node Activator.
              </Typography>
            </Box>

            <BasicInformation
              deviceData={deviceData}
              mode={mode}
              errors={errors}
              submitted={submitted}
              userEditedDeviceName={userEditedDeviceName}
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
              disabled={!hasPermission}
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
          title="Add device"
          content="Are you sure you want to register the following device?"
          confirmLabel="Add"
          onClose={onConfirmCancel}
          onConfirm={onSubmit}
        />
      )}
    </Box>
  );
}
