import { Box, IconButton, TextField } from '@mui/material';
import { SelectElement, SvgIcon } from '@shared/ui';

import type { ICreateStackConfigPayload } from '../api/stacks.api.types';
import type { IStackErrors } from '../domain/types';
import { typeOptions } from './stackTypeOptions';

interface IProps {
  stackData: ICreateStackConfigPayload;
  stackFile: File | null;
  mode: 'add' | 'edit';
  errors: IStackErrors;
  onChange: (category: string, value?: string) => void;
  onStackFileChange: (file: File | null) => void;
}

const getStackNameErrorMessage = (value: string) => {
  const stackName = value.trim();

  if (!stackName) {
    return 'Stack name is required';
  }

  if (stackName.length > 63) {
    return 'Stack name must be 63 characters or less';
  }

  if (!/^[a-z0-9-]+$/.test(stackName)) {
    return 'Stack name may contain only lowercase letters, digits, and hyphen (-)';
  }

  if (stackName.startsWith('-') || stackName.endsWith('-')) {
    return 'Stack name may not start or end with a hyphen (-)';
  }

  if (stackName.includes('--')) {
    return 'Stack name cannot contain consecutive hyphens (-)';
  }

  return '';
};

export default function BasicInformation({
  stackData,
  stackFile,
  mode,
  errors,
  onChange,
  onStackFileChange,
}: IProps) {
  const stackNameErrorMessage = getStackNameErrorMessage(stackData.stackName);
  const hasStackNameError = Boolean(errors.stackName || stackNameErrorMessage);

  const handleStackNameChange = (value: string) => {
    const nextValue = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 63);

    onChange('stackName', nextValue);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      onStackFileChange(null);
      return;
    }

    const isValidFile =
      file.name.endsWith('.yml') || file.name.endsWith('.yaml');

    if (!isValidFile) {
      onStackFileChange(null);
      event.target.value = '';
      return;
    }

    onStackFileChange(file);
  };

  return (
    <Box className="editor-page__form">
      <Box className="editor-page__form-wrapper">
        <TextField
          fullWidth
          size="small"
          className="editor-page__form-wrapper-textfield"
          label={
            <>
              Stack name <span className="required">*</span>
            </>
          }
          value={stackData.stackName}
          error={hasStackNameError}
          disabled={mode === 'edit'}
          helperText={hasStackNameError ? stackNameErrorMessage : ''}
          slotProps={{
            input: {
              inputProps: {
                maxLength: 63,
              },
            },
          }}
          onChange={(e) => handleStackNameChange(e.target.value)}
        />

        <Box className="editor-page__form-wrapper-helper">
          {stackData.stackName.trim().length}/63
        </Box>
      </Box>

      <Box className="editor-page__form-wrapper">
        <SelectElement
          className="editor-page__form-wrapper-select"
          value={stackData.type}
          onChange={(value) => onChange('type', value as string)}
          placeholder="-- Type --"
          options={typeOptions}
          disabled={mode === 'edit'}
          error={errors.type}
          helperText={errors.type ? 'Type is required' : ''}
        />
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
          value={stackData.description ?? ''}
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
          onChange={(e) => onChange('description', e.target.value)}
        />

        <Box className="editor-page__form-wrapper-helper">
          {(stackData.description ?? '').trim().length}/500
        </Box>
      </Box>

      <Box className="editor-page__form-wrapper">
        <TextField
          fullWidth
          size="small"
          label={
            <>
              Docker compose file <span className="required">*</span>
            </>
          }
          value={stackFile?.name ?? ''}
          error={errors.stackFile.type}
          helperText={errors.stackFile.type ? errors.stackFile.message : ''}
          slotProps={{
            input: {
              readOnly: true,
              endAdornment: (
                <IconButton component="label" size="small">
                  <SvgIcon
                    name="FileUploadOutlined"
                    sx={{ color: 'var(--action-active)' }}
                  />

                  <input
                    hidden
                    type="file"
                    accept=".yml,.yaml"
                    onChange={handleFileChange}
                  />
                </IconButton>
              ),
            },
          }}
        />
      </Box>
    </Box>
  );
}
