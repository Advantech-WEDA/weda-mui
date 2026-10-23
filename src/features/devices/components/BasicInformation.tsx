import { Box, TextField } from '@mui/material';
import Zoom from 'react-medium-image-zoom';

import type { IDeviceItem } from '../api/devices.api.types';
import InformationImage from '../assets/weda-node-activator-hl.png';
import {
  DEVICE_ID_LENGTH,
  DEVICE_NAME_MAX_LENGTH,
  generateDeviceName,
  HW_MODEL_MAX_LENGTH,
} from '../domain/device.rules';

interface IProps {
  deviceData?: IDeviceItem;
  mode: 'add' | 'edit';
  submitted?: boolean;
  userEditedDeviceName: boolean;
  errors: {
    deviceId: boolean;
    deviceIdMessage: string;

    hwModel: boolean;
    hwModelMessage: string;

    deviceName: boolean;
    deviceNameMessage: string;
  };
  onChange: (category: string, value?: string) => void;
}

export default function BasicInformation({
  deviceData,
  mode,
  errors,
  userEditedDeviceName,

  onChange,
}: IProps) {
  const displayDeviceName = userEditedDeviceName
    ? (deviceData?.deviceName ?? '')
    : generateDeviceName(deviceData?.hwModel ?? '', deviceData?.deviceId ?? '');
  return (
    <Box className="editor-page__form">
      {mode === 'add' && (
        <Box>
          <Zoom>
            <img
              src={InformationImage}
              loading="lazy"
              style={{
                width: '100%',
                display: 'block',
                minHeight: '395.776px',
              }}
            />
          </Zoom>
        </Box>
      )}

      <Box className="editor-page__form-wrapper">
        <TextField
          fullWidth
          size="small"
          className="editor-page__form-wrapper-textfield"
          label={
            <>
              Device ID <span className="required">*</span>
            </>
          }
          disabled={mode === 'add' ? false : true}
          value={deviceData?.deviceId}
          error={errors.deviceId}
          helperText={errors.deviceId ? errors.deviceIdMessage : ''}
          slotProps={{ htmlInput: { maxLength: DEVICE_ID_LENGTH } }}
          onChange={(e) => onChange('deviceId', e.target.value)}
        />

        <Box className="editor-page__form-wrapper-helper">
          {(deviceData?.deviceId ?? '').length}/{DEVICE_ID_LENGTH}
        </Box>
      </Box>

      <Box className="editor-page__form-wrapper">
        <TextField
          fullWidth
          size="small"
          className="editor-page__form-wrapper-textfield"
          disabled={mode === 'add' ? false : true}
          label={
            <>
              Model <span className="required">*</span>
            </>
          }
          value={deviceData?.hwModel}
          error={errors.hwModel}
          helperText={errors.hwModel ? errors.hwModelMessage : ''}
          slotProps={{ htmlInput: { maxLength: HW_MODEL_MAX_LENGTH } }}
          onChange={(e) => onChange('hwModel', e.target.value)}
        />

        <Box className="editor-page__form-wrapper-helper">
          {(deviceData?.hwModel ?? '').length}/{HW_MODEL_MAX_LENGTH}
        </Box>
      </Box>

      <Box className="editor-page__form-wrapper">
        <TextField
          fullWidth
          size="small"
          className="editor-page__form-wrapper-textfield"
          label={
            <>
              Device name <span className="required">*</span>
            </>
          }
          value={displayDeviceName}
          error={errors.deviceName}
          helperText={errors.deviceName ? errors.deviceNameMessage : ''}
          slotProps={{ htmlInput: { maxLength: DEVICE_NAME_MAX_LENGTH } }}
          onChange={(e) => onChange('deviceName', e.target.value)}
        />

        <Box className="editor-page__form-wrapper-helper">
          {displayDeviceName.length}/{DEVICE_NAME_MAX_LENGTH}
        </Box>
      </Box>
    </Box>
  );
}
