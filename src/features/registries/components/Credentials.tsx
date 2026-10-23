import { Box, IconButton, InputAdornment, TextField } from '@mui/material';
import { SvgIcon } from '@shared/ui';
import { type ChangeEvent, useState } from 'react';

import type { RegistryType } from '../domain/types';
import type { RegistryForm } from '../domain/types';

interface IProps {
  registryData?: RegistryForm;
  mode: 'add' | 'edit';
  credentialsDirty?: boolean;
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

type MaskedField =
  | 'accessToken'
  | 'userPassword'
  | 'accessKey'
  | 'accessSecretKey';

const MASK = '******';

function extractInsertedText(before: string, after: string): string {
  let start = 0;
  while (
    start < before.length &&
    start < after.length &&
    before[start] === after[start]
  ) {
    start++;
  }

  let end = 0;
  while (
    end < before.length - start &&
    end < after.length - start &&
    before[before.length - 1 - end] === after[after.length - 1 - end]
  ) {
    end++;
  }

  return after.slice(start, after.length - end);
}

export default function Credentials({
  registryData,
  mode,
  credentialsDirty = false,
  errors,
  onChange,
}: IProps) {
  const isEdit = mode === 'edit';
  const isPristine = isEdit && !credentialsDirty;

  const [revealed, setRevealed] = useState<Record<MaskedField, boolean>>({
    accessToken: false,
    userPassword: false,
    accessKey: false,
    accessSecretKey: false,
  });

  const maskedInputProps = (field: MaskedField) => {
    const stored = registryData?.registryCredentials[field] ?? '';
    const displayed = isPristine && !revealed[field] ? MASK : stored;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      onChange(
        field,
        undefined,
        isPristine ? extractInsertedText(displayed, next) : next
      );
    };

    return {
      type: revealed[field] || isPristine ? 'text' : 'password',

      autoComplete: 'new-password',
      value: displayed,
      onChange: handleChange,
    };
  };

  const revealAdornment = (field: MaskedField) => (
    <InputAdornment position="end">
      <IconButton
        size="small"
        edge="end"
        aria-label={revealed[field] ? 'Hide value' : 'Show value'}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() =>
          setRevealed((prev) => ({ ...prev, [field]: !prev[field] }))
        }
      >
        <SvgIcon
          name={
            revealed[field] ? 'VisibilityOutlined' : 'VisibilityOffOutlined'
          }
          className="header-startIcon"
          sx={{ color: 'var(--common-white-_states-main)' }}
        />
      </IconButton>
    </InputAdornment>
  );

  return (
    <Box className="editor-page__form">
      {registryData?.registryCredentials.registryType !== 'AwsECR' && (
        <Box className="editor-page__form-wrapper">
          <TextField
            fullWidth
            size="small"
            className="editor-page__form-wrapper-textfield"
            label={
              <>
                User Name<span className="required">*</span>
              </>
            }
            slotProps={{
              inputLabel: {
                shrink: registryData?.registryCredentials.username
                  ? true
                  : undefined,
              },
            }}
            value={registryData?.registryCredentials.username ?? ''}
            error={!!errors.username}
            helperText={errors.username}
            onChange={(e) => onChange('username', undefined, e.target.value)}
          />
        </Box>
      )}

      {registryData?.registryCredentials.registryType === 'DockerHub' && (
        <Box className="editor-page__form-wrapper">
          <TextField
            fullWidth
            size="small"
            className="editor-page__form-wrapper-textfield"
            label={
              <>
                Access Token <span className="required">*</span>
              </>
            }
            slotProps={{
              inputLabel: {
                shrink: registryData?.registryCredentials.accessToken
                  ? true
                  : undefined,
              },
              input: { endAdornment: revealAdornment('accessToken') },
            }}
            {...maskedInputProps('accessToken')}
            error={!!errors.accessToken}
            helperText={errors.accessToken}
          />
        </Box>
      )}

      {(registryData?.registryCredentials.registryType === 'AzureACR' ||
        registryData?.registryCredentials.registryType === 'Custom') && (
        <Box className="editor-page__form-wrapper">
          <TextField
            fullWidth
            size="small"
            className="editor-page__form-wrapper-textfield"
            label={
              <>
                Password <span className="required">*</span>
              </>
            }
            slotProps={{
              inputLabel: {
                shrink: true,
              },
              input: { endAdornment: revealAdornment('userPassword') },
            }}
            {...maskedInputProps('userPassword')}
            error={!!errors.userPassword}
            helperText={errors.userPassword}
          />
        </Box>
      )}

      {registryData?.registryCredentials.registryType === 'AwsECR' && (
        <Box className="editor-page__form-wrapper">
          <TextField
            fullWidth
            size="small"
            className="editor-page__form-wrapper-textfield"
            label={
              <>
                Access Key <span className="required">*</span>
              </>
            }
            slotProps={{
              inputLabel: {
                shrink: true,
              },
              input: { endAdornment: revealAdornment('accessKey') },
            }}
            {...maskedInputProps('accessKey')}
            error={!!errors.accessKey}
            helperText={errors.accessKey}
          />
        </Box>
      )}

      {registryData?.registryCredentials.registryType === 'AwsECR' && (
        <Box className="editor-page__form-wrapper">
          <TextField
            fullWidth
            size="small"
            className="editor-page__form-wrapper-textfield"
            label={
              <>
                Access Secret Key <span className="required">*</span>
              </>
            }
            slotProps={{
              inputLabel: {
                shrink: true,
              },
              input: { endAdornment: revealAdornment('accessSecretKey') },
            }}
            {...maskedInputProps('accessSecretKey')}
            error={!!errors.accessSecretKey}
            helperText={errors.accessSecretKey}
          />
        </Box>
      )}

      {registryData?.registryCredentials.registryType === 'AwsECR' && (
        <Box className="editor-page__form-wrapper">
          <TextField
            fullWidth
            size="small"
            className="editor-page__form-wrapper-textfield"
            label={
              <>
                Region <span className="required">*</span>
              </>
            }
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            value={registryData?.registryCredentials.region ?? ''}
            error={!!errors.region}
            helperText={errors.region}
            onChange={(e) => onChange('region', undefined, e.target.value)}
          />
        </Box>
      )}
    </Box>
  );
}
