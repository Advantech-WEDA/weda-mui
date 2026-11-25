import { Box, IconButton, TextField } from '@mui/material';
import { SelectElement, SvgIcon } from '@shared/ui';

import type { ICreateStackConfigPayload } from '../api/stacks.api.types';
import {
  getStackNameErrorMessage,
  STACK_NAME_MAX_LENGTH,
} from '../domain/stackName.rules';
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

export default function BasicInformation({
  stackData,
  stackFile,
  mode,
  errors,
  onChange,
  onStackFileChange,
}: IProps) {
  const stackNameErrorMessage = errors.stackName
    ? getStackNameErrorMessage(stackData.stackName)
    : '';

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      onStackFileChange(null);
      return;
    }

    onStackFileChange(file);
    event.target.value = '';
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
          error={Boolean(stackNameErrorMessage)}
          disabled={mode === 'edit'}
          helperText={stackNameErrorMessage}
          onChange={(e) => onChange('stackName', e.target.value)}
        />

        <Box className="editor-page__form-wrapper-helper">
          {stackData.stackName.length}/{STACK_NAME_MAX_LENGTH}
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
                maxLength: 1024,
              },
              sx: {
                padding: '16px 12px',
              },
            },
          }}
          onChange={(e) => onChange('description', e.target.value)}
        />

        <Box className="editor-page__form-wrapper-helper">
          {(stackData.description ?? '').trim().length}/1024
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
