import './AddBasicInformation.scss';

import { Box, TextField, Typography } from '@mui/material';

import type { ClientCredentialForm } from '../domain/types';

type IProps = {
  value: ClientCredentialForm;
  onChange: <K extends keyof ClientCredentialForm>(
    key: K,
    value: ClientCredentialForm[K]
  ) => void;
  error?: boolean;
};

export default function AddBasicInformation({
  value,
  onChange,
  error,
}: IProps) {
  return (
    <Box className="basic-info">
      <Typography variant="h5" className="basic-info-title">
        Basic information
      </Typography>

      <Box className="basic-info-form">
        <Box className="basic-info-field">
          <TextField
            label={
              <>
                Credential name <span className="required">*</span>
              </>
            }
            className="basic-info-textfield"
            fullWidth
            size="small"
            value={value.name}
            error={error}
            helperText={
              error || value.name.trim().length === 0
                ? 'This field is required.'
                : ''
            }
            slotProps={{
              input: {
                inputProps: {
                  maxLength: 50,
                },
              },
            }}
            onChange={(e) => {
              const value = e.target.value.replace(/^\s+/, '');
              onChange('name', value);
            }}
          />

          <Box className="basic-info-helper">{value.name.trim().length}/50</Box>
        </Box>
      </Box>
    </Box>
  );
}
