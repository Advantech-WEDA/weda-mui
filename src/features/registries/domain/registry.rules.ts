import type { RegistryCredentials, RegistryForm } from './types';
import {
  type RegistryFormErrors,
  registryOptions,
  type RegistryType,
} from './types';

export const INITIAL_REGISTRY_ERRORS: RegistryFormErrors = {
  registryName: '',
  registryUrl: '',
  registryType: '',
  region: '',
  accessKey: '',
  accessSecretKey: '',
  accessToken: '',
  userPassword: '',
  username: '',
};

export const INITIAL_REGISTRY_DATA: RegistryForm = {
  registryName: '',
  registryUrl: '',
  registryCredentials: {
    registryType: registryOptions[0].value,
    accessKey: '',
    accessSecretKey: '',
    region: '',
    username: '',
    accessToken: '',
    userPassword: '',
  },
};

function isValidRegistryUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return (
      ['http:', 'https:', 'ftp:'].includes(parsed.protocol) && !!parsed.hostname
    );
  } catch {
    return false;
  }
}

export function validateRegistryForm(registryData: RegistryForm): {
  isValid: boolean;
  errors: RegistryFormErrors;
} {
  const type = registryData.registryCredentials.registryType;
  const isAwsECR = type === 'AwsECR';
  const isDockerHub = type === 'DockerHub';
  const isCustomOrAzure = type === 'Custom' || type === 'AzureACR';

  const errors: RegistryFormErrors = { ...INITIAL_REGISTRY_ERRORS };

  const name = registryData.registryName.trim();
  if (!name) {
    errors.registryName = 'Registry name is required';
  } else if (!/^[a-z0-9-]+$/.test(name)) {
    errors.registryName =
      'Registry name can only contain lowercase letters(a-z), numbers(0-9), and hyphens(-)';
  } else if (name.length > 32) {
    errors.registryName = 'Registry name must not exceed 32 characters';
  }

  const url = registryData.registryUrl.trim();
  if (!url) {
    errors.registryUrl = 'Registry URL is required';
  } else if (!isValidRegistryUrl(url)) {
    errors.registryUrl =
      'The RegistryUrl field is not a valid fully-qualified http, https, or ftp URL.';
  }

  if (!type) {
    errors.registryType = 'Registry type is required';
  }

  if (isDockerHub) {
    const username = registryData.registryCredentials.username?.trim() ?? '';
    if (!username) {
      errors.username = 'Username is required';
    } else if (!/^[a-z0-9]{4,30}$/.test(username)) {
      errors.username = 'It must be 4-30 lowercase letters or numbers';
    }

    const token = registryData.registryCredentials.accessToken?.trim() ?? '';
    if (!token) {
      errors.accessToken = 'Access token is required';
    } else if (token.length < 9) {
      errors.accessToken =
        'DockerHub access token must be at least 9 characters long.';
    }
  }

  if (isAwsECR) {
    const accessKey = registryData.registryCredentials.accessKey?.trim() ?? '';
    if (!accessKey) {
      errors.accessKey = 'Access key is required';
    }

    const secretKey =
      registryData.registryCredentials.accessSecretKey?.trim() ?? '';
    if (!secretKey) {
      errors.accessSecretKey = 'Access secret key is required';
    }

    const region = registryData.registryCredentials.region?.trim() ?? '';
    if (!region) {
      errors.region = 'Region is required';
    }
  }

  if (isCustomOrAzure) {
    if (!registryData.registryCredentials.username?.trim()) {
      errors.username = 'Username is required';
    }
    if (!registryData.registryCredentials.userPassword?.trim()) {
      errors.userPassword = 'Password is required';
    }
  }

  return { isValid: Object.values(errors).every((v) => !v), errors };
}

export function applyRegistryTypeChange(
  prev: RegistryForm,
  value?: RegistryType
): RegistryForm {
  return {
    ...prev,
    registryCredentials: {
      registryType: value,
      accessKey: '',
      accessSecretKey: '',
      region: '',
      username: '',
      accessToken: '',
      userPassword: '',
    },
  };
}

const CREDENTIAL_FIELDS = [
  'username',
  'accessToken',
  'userPassword',
  'accessKey',
  'accessSecretKey',
  'region',
] as const;

export function isCredentialsCategory(category: string): boolean {
  return (
    category === 'registryType' ||
    (CREDENTIAL_FIELDS as readonly string[]).includes(category)
  );
}

export function isCredentialsComplete(
  credentials: RegistryCredentials
): boolean {
  const payload = buildRegistryCredentialsPayload(credentials);
  const required = CREDENTIAL_FIELDS.filter((field) => field in payload);

  return (
    !!credentials.registryType &&
    required.length > 0 &&
    required.every((field) => !!credentials[field]?.trim())
  );
}

export function buildRegistryCredentialsPayload(
  credentials: RegistryCredentials
): RegistryCredentials {
  const { registryType } = credentials;

  switch (registryType) {
    case 'DockerHub':
      return {
        registryType,
        username: credentials.username,
        accessToken: credentials.accessToken,
      };

    case 'AwsECR':
      return {
        registryType,
        accessKey: credentials.accessKey,
        accessSecretKey: credentials.accessSecretKey,
        region: credentials.region,
      };

    case 'AzureACR':
    case 'Custom':
      return {
        registryType,
        username: credentials.username,
        userPassword: credentials.userPassword,
      };

    default:
      return { registryType };
  }
}

export function hasCredentialsChanged(
  original: RegistryCredentials,
  current: RegistryCredentials
): boolean {
  const originalPayload = buildRegistryCredentialsPayload(original);
  const currentPayload = buildRegistryCredentialsPayload(current);

  return JSON.stringify(originalPayload) !== JSON.stringify(currentPayload);
}

export function applyRegistryChange(
  prev: RegistryForm,
  category: string,
  registryType?: RegistryType,
  value?: string
): RegistryForm {
  switch (category) {
    case 'registryName':
      return { ...prev, registryName: value || '' };

    case 'registryUrl':
      return { ...prev, registryUrl: value || '' };

    case 'registryType':
      return applyRegistryTypeChange(prev, registryType);

    case 'username':
      return {
        ...prev,
        registryCredentials: {
          ...prev.registryCredentials,
          username: value || '',
        },
      };

    case 'accessToken':
      return {
        ...prev,
        registryCredentials: {
          ...prev.registryCredentials,
          accessToken: value || '',
        },
      };

    case 'userPassword':
      return {
        ...prev,
        registryCredentials: {
          ...prev.registryCredentials,
          userPassword: value || '',
        },
      };

    case 'accessKey':
      return {
        ...prev,
        registryCredentials: {
          ...prev.registryCredentials,
          accessKey: value || '',
        },
      };

    case 'accessSecretKey':
      return {
        ...prev,
        registryCredentials: {
          ...prev.registryCredentials,
          accessSecretKey: value || '',
        },
      };

    case 'region':
      return {
        ...prev,
        registryCredentials: {
          ...prev.registryCredentials,
          region: value || '',
        },
      };

    default:
      return prev;
  }
}
