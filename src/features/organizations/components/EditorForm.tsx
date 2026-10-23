import './EditorForm.scss';

import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import {
  Breadcrumbs,
  ScrollSideTabs,
  SimpleConfirmDialog,
  UnsavedChangesDialog,
} from '@shared/ui';
import { useMemo, useRef, useState } from 'react';

import type {
  OrgAdminOption,
  OrganizationNode,
  ParentOrgOption,
} from '../domain/types';
import BasicInformation from './BasicInformation';
import OrgAdminsSection from './OrgAdminsSection';

interface EditorFormProps {
  mode: 'add' | 'edit';

  parentOrgId: string;
  effectiveParentOrgId: string;
  orgName: string;
  description: string;

  parentOptions: ParentOrgOption[];
  orgTreeNodes: OrganizationNode[];
  canSelectEmptyParent: boolean;

  adminOptions?: OrgAdminOption[];
  selectedAdmins?: OrgAdminOption[];
  currentUserId?: string;

  canSubmit: boolean;
  submitting?: boolean;

  onParentChange: (value: string) => void;
  onOrgNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAdminsChange?: (value: OrgAdminOption[]) => void;

  onCancel: () => void;
  onSubmit: () => void | Promise<void>;
}

export default function EditorForm({
  mode,
  parentOrgId,
  effectiveParentOrgId,
  orgName,
  description,
  parentOptions,
  orgTreeNodes,
  canSelectEmptyParent,
  adminOptions = [],
  selectedAdmins = [],
  currentUserId,
  canSubmit,
  submitting = false,
  onParentChange,
  onOrgNameChange,
  onDescriptionChange,
  onAdminsChange,
  onCancel,
  onSubmit,
}: EditorFormProps) {
  const basicRef = useRef<HTMLDivElement | null>(null);
  const adminsRef = useRef<HTMLDivElement | null>(null);

  const isAdd = mode === 'add';
  const isEdit = mode === 'edit';

  const pageTitle = isEdit ? 'Edit organization' : 'Add organization';

  const [errors, setErrors] = useState({ orgName: false, admins: false });
  const [activeDialog, setActiveDialog] = useState<
    'unsaved' | 'confirm' | null
  >(null);

  const tabItems = useMemo(() => {
    const items = [{ key: 'basic', label: 'Basic information' }];
    if (isAdd) items.push({ key: 'admins', label: 'Org admins' });
    return items;
  }, [isAdd]);

  const sections = useMemo(() => {
    const basicSection = {
      key: 'basic',
      ref: basicRef,
      id: 'basic-information-section',
    };
    const adminsSection = {
      key: 'admins',
      ref: adminsRef,
      id: 'org-admins-section',
    };
    return isAdd ? [basicSection, adminsSection] : [basicSection];
  }, [isAdd]);

  const validate = () => {
    const newErrors = {
      orgName: !orgName.trim(),
      admins: isAdd ? selectedAdmins.length === 0 : false,
    };
    setErrors(newErrors);
    return !newErrors.orgName && !newErrors.admins;
  };

  const handleCancel = () => setActiveDialog('unsaved');

  const handleSubmit = () => {
    if (!validate()) return;
    setActiveDialog('confirm');
  };

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
              onClick={handleCancel}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              className="editor-page__header-actions-btn-submit"
              disabled={!canSubmit}
              onClick={handleSubmit}
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
              effectiveParentOrgId={effectiveParentOrgId}
              orgName={orgName}
              description={description}
              parentOptions={parentOptions}
              orgTreeNodes={orgTreeNodes}
              canSelectEmptyParent={canSelectEmptyParent}
              isEdit={isEdit}
              submitting={submitting}
              errorOrgName={errors.orgName}
              onParentChange={onParentChange}
              onOrgNameChange={onOrgNameChange}
              onDescriptionChange={onDescriptionChange}
            />
          </Box>

          {isAdd && (
            <Box
              id="org-admins-section"
              ref={adminsRef}
              className="editor-page__left-section"
            >
              <Typography className="editor-page__left-title" variant="h5">
                Org admins
              </Typography>

              <OrgAdminsSection
                options={adminOptions}
                value={selectedAdmins}
                currentUserId={currentUserId}
                parentOrgId={parentOrgId}
                disabled={submitting}
                error={errors.admins}
                helperText={
                  errors.admins ? 'At least one admin is required' : undefined
                }
                onChange={(value) => onAdminsChange?.(value)}
              />
            </Box>
          )}

          <Stack direction="row" spacing={1} className="editor-page__footer">
            <Button
              size="small"
              variant="outlined"
              className="editor-page__footer__btn-cancel"
              onClick={handleCancel}
            >
              Cancel
            </Button>

            <Button
              size="small"
              variant="contained"
              className="editor-page__header-actions-btn-submit"
              disabled={!canSubmit}
              onClick={handleSubmit}
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
        open={activeDialog === 'unsaved'}
        onKeepEditing={() => setActiveDialog(null)}
        onDiscard={onCancel}
      />

      <SimpleConfirmDialog
        open={activeDialog === 'confirm'}
        title={isEdit ? 'Save Changes' : 'Add Organization'}
        content={
          isEdit
            ? 'Are you sure you want to save these changes?'
            : 'Are you sure you want to add this organization?'
        }
        confirmLabel={isEdit ? 'Save' : 'Add'}
        onClose={() => setActiveDialog(null)}
        onConfirm={onSubmit}
      />
    </Box>
  );
}
