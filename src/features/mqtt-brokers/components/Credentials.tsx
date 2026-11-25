import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { SvgIcon } from '@shared/ui';
import { useState } from 'react';

import type { MqttBrokerForm, MqttBrokerFormErrors } from '../domain/types';

interface IProps {
  mode: 'add' | 'edit';
  formData: MqttBrokerForm;
  errors: MqttBrokerFormErrors;

  isChangingCredentials: boolean;
  onChange: (field: 'username' | 'password', value: string) => void;
  onChangeCredentials: () => void;
  onKeepSavedCredentials: () => void;
}

export default function Credentials({
  mode,
  formData,
  errors,
  isChangingCredentials,
  onChange,
  onChangeCredentials,
  onKeepSavedCredentials,
}: IProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isEdit = mode === 'edit';

  if (isEdit && !isChangingCredentials) {
    return (
      <Box className="editor-page__form">
        <Stack direction="row" spacing={1} alignItems="center">
          <LockOutlinedIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            Credentials saved. The username and password are never shown again.
          </Typography>

          <Button
            variant="outlined"
            className="page-btn"
            onClick={onChangeCredentials}
          >
            Change credentials
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box className="editor-page__form">
      {isEdit && (
        <Typography variant="body2" color="text.secondary">
          Enter both the username and the password. They replace the saved
          credentials.
        </Typography>
      )}

      <Box className="editor-page__form-wrapper">
        <TextField
          fullWidth
          size="small"
          className="editor-page__form-wrapper-textfield"
          label={
            <>
              Username <span className="required">*</span>
            </>
          }
          autoComplete="off"
          value={formData.credentials.username}
          error={!!errors.username}
          helperText={errors.username}
          onChange={(e) => onChange('username', e.target.value)}
        />
      </Box>

      <Box className="editor-page__form-wrapper">
        <TextField
          fullWidth
          size="small"
          type={showPassword ? 'text' : 'password'}
          className="editor-page__form-wrapper-textfield"
          label={
            <>
              Password <span className="required">*</span>
            </>
          }
          autoComplete="new-password"
          value={formData.credentials.password}
          error={!!errors.password}
          helperText={errors.password}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    <SvgIcon
                      name={
                        showPassword
                          ? 'VisibilityOutlined'
                          : 'VisibilityOffOutlined'
                      }
                      className="page-action-btn__icon"
                    />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          onChange={(e) => onChange('password', e.target.value)}
        />
      </Box>

      {isEdit && (
        <Box>
          <Button
            variant="outlined"
            className="page-btn"
            onClick={onKeepSavedCredentials}
          >
            Keep saved credentials
          </Button>
        </Box>
      )}
    </Box>
  );
}
