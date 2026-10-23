import { Box, TextField } from '@mui/material';
import { SelectElement } from '@shared/ui';

import type { RegistryForm } from '../domain/types';
import { registryOptions, type RegistryType } from '../domain/types';

interface IProps {
  registryData?: RegistryForm;
  mode?: 'add' | 'edit';
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
}

export default function BasicInformation({
  registryData,
  mode = 'add',
  errors,
  onChange,
}: IProps) {
  const isEdit = mode === 'edit';

  return (
    <Box className="editor-page__form">
      <Box className="editor-page__form-wrapper">
        <TextField
          fullWidth
          size="small"
          className="editor-page__form-wrapper-textfield"
          label={
            <>
              Registry Name <span className="required">*</span>
            </>
          }
          value={registryData?.registryName ?? ''}
          disabled={isEdit}
          error={!!errors.registryName}
          helperText={errors.registryName}
          slotProps={{
            input: {
              inputProps: {
                maxLength: 32,
              },
            },
          }}
          onChange={(e) => onChange('registryName', undefined, e.target.value)}
        />

        <Box className="editor-page__form-wrapper-helper">
          {registryData?.registryName?.trim().length ?? 0}/32
        </Box>
      </Box>

      <Box className="editor-page__form-wrapper">
        <TextField
          fullWidth
          size="small"
          className="editor-page__form-wrapper-textfield"
          label={
            <>
              Registry URL <span className="required">*</span>
            </>
          }
          placeholder="https://registry.example.com/"
          value={registryData?.registryUrl ?? ''}
          disabled={isEdit}
          error={!!errors.registryUrl}
          helperText={errors.registryUrl}
          onChange={(e) => onChange('registryUrl', undefined, e.target.value)}
        />
      </Box>

      <Box className="editor-page__form-wrapper">
        <SelectElement
          className="editor-page__form-wrapper-select"
          value={
            registryData?.registryCredentials?.registryType ??
            registryOptions[0].value
          }
          onChange={(value) =>
            onChange('registryType', value as RegistryType, undefined)
          }
          placeholder="-- Select Registry Type --"
          options={registryOptions}
          error={!!errors.registryType}
          helperText={errors.registryType}
        />
      </Box>
    </Box>
  );
}
