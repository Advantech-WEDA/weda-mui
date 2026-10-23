export const DEVICE_ID_LENGTH = 12;
export const HW_MODEL_MAX_LENGTH = 64;
export const DEVICE_NAME_MAX_LENGTH = 128;

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export const validateDeviceId = (deviceId: string): ValidationResult => {
  const value = deviceId.trim();

  if (!value) {
    return {
      isValid: false,
      message: 'Device ID is required',
    };
  }

  if (!/^[a-z0-9]+$/.test(value)) {
    return {
      isValid: false,
      message:
        'Device ID can only contain lowercase letters (a-z) and digits (0-9)',
    };
  }

  if (value.length !== DEVICE_ID_LENGTH) {
    return {
      isValid: false,
      message: `Device ID must be exactly ${DEVICE_ID_LENGTH} characters`,
    };
  }

  return {
    isValid: true,
    message: '',
  };
};

export const validateHwModel = (hwModel: string): ValidationResult => {
  const value = hwModel.trim();

  if (!value) {
    return {
      isValid: false,
      message: 'Model is required',
    };
  }

  if (!/^[A-Z0-9-]+$/.test(value)) {
    return {
      isValid: false,
      message:
        'Model can only contain uppercase letters (A-Z), digits (0-9), and hyphens (-)',
    };
  }

  if (value.length > HW_MODEL_MAX_LENGTH) {
    return {
      isValid: false,
      message: `Model must be at most ${HW_MODEL_MAX_LENGTH} characters`,
    };
  }

  return {
    isValid: true,
    message: '',
  };
};

export const validateDeviceName = (deviceName: string): ValidationResult => {
  const value = deviceName.trim();

  if (!value) {
    return {
      isValid: false,
      message: 'Device name is required',
    };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
    return {
      isValid: false,
      message:
        'Device name can only contain letters, digits, hyphens (-), and underscores (_)',
    };
  }

  if (value.length > DEVICE_NAME_MAX_LENGTH) {
    return {
      isValid: false,
      message: `Device name must be at most ${DEVICE_NAME_MAX_LENGTH} characters`,
    };
  }

  return {
    isValid: true,
    message: '',
  };
};

export const generateDeviceName = (hwModel: string, deviceId: string) => {
  if (!hwModel.trim() || !deviceId.trim()) {
    return '';
  }

  return `${hwModel.trim()}-${deviceId.trim()}`;
};
