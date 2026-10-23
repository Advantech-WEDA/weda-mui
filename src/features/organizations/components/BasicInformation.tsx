import { Box, MenuItem, TextField } from '@mui/material';
import { useState } from 'react';

import type { OrganizationNode, ParentOrgOption } from '../domain/types';
import OrgTree from './OrgTree';

interface BasicInformationProps {
  effectiveParentOrgId: string;
  orgName: string;
  description: string;
  parentOptions: ParentOrgOption[];
  orgTreeNodes: OrganizationNode[];
  canSelectEmptyParent: boolean;
  isEdit: boolean;
  submitting?: boolean;
  errorOrgName?: boolean;
  onParentChange: (value: string) => void;
  onOrgNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export default function BasicInformation({
  effectiveParentOrgId: effectiveValue,
  orgName,
  description,
  parentOptions,
  orgTreeNodes,
  canSelectEmptyParent,
  isEdit,
  submitting = false,
  errorOrgName = false,
  onParentChange,
  onOrgNameChange,
  onDescriptionChange,
}: BasicInformationProps) {
  const [parentSelectOpen, setParentSelectOpen] = useState(false);

  const selectedParentLabel =
    parentOptions.find((item) => item.orgId === effectiveValue)?.label ??
    '-- Select --';
  return (
    <Box className="editor-page__form">
      <TextField
        select
        label={<>Parent organization</>}
        className="editor-page__form-select"
        fullWidth
        size="small"
        value={effectiveValue}
        disabled={isEdit}
        slotProps={{
          inputLabel: {
            shrink: true,
          },
          select: {
            displayEmpty: true,
            open: parentSelectOpen,
            onClose: () => setParentSelectOpen(false),
            onOpen: () => {
              if (!isEdit) {
                setParentSelectOpen(true);
              }
            },
            renderValue: () => selectedParentLabel,
          },
        }}
      >
        <MenuItem value={effectiveValue} disableRipple sx={{ padding: 0 }}>
          <Box
            className="editor-page__form-select-tree"
            sx={{
              width: '100%',
              background: 'var(--_components-paper-elevation-8, #FFF)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <OrgTree
              value={effectiveValue}
              nodes={orgTreeNodes}
              canSelectEmpty={canSelectEmptyParent}
              onChange={(value) => {
                onParentChange(value);
                setParentSelectOpen(false);
              }}
              disabled={isEdit}
            />
          </Box>
        </MenuItem>
      </TextField>

      <Box className="editor-page__form-wrapper">
        <TextField
          fullWidth
          size="small"
          className="editor-page__form-wrapper-textfield"
          label={
            <>
              Organization name <span className="required">*</span>
            </>
          }
          value={orgName}
          disabled={submitting}
          error={errorOrgName}
          helperText={errorOrgName ? 'Organization name is required' : ''}
          slotProps={{
            input: {
              inputProps: {
                maxLength: 100,
              },
            },
          }}
          onChange={(e) => onOrgNameChange(e.target.value)}
        />

        <Box className="editor-page__form-wrapper-helper">
          {orgName.trim().length}/100
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
          maxRows={4}
          value={description}
          disabled={submitting}
          slotProps={{
            input: {
              inputProps: {
                maxLength: 200,
              },
              sx: {
                padding: '16px 12px',
              },
            },
          }}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />

        <Box className="editor-page__form-wrapper-helper">
          {description.trim().length}/200
        </Box>
      </Box>
    </Box>
  );
}
