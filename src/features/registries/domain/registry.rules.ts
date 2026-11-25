import { getResourceNameErrorMessage } from '@shared/lib/resourceName';

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

export const REGISTRY_NAME_MAX_LENGTH = 32;
export const REGISTRY_URL_MAX_LENGTH = 1024;

function isValidRegistryUrl(value: string): boolean {
  if (!/^https?:\/\//i.test(value)) return false;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) return false;

  return isFullyQualifiedHost(value, parsed.hostname);
}

const IPV4_PATTERN =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

const FQDN_PATTERN =
  /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+([a-z]{2,63}|xn--[a-z0-9-]{1,59})$/i;

function isFullyQualifiedHost(rawUrl: string, hostname: string): boolean {
  const authority = rawUrl.replace(/^https?:\/\//i, '').split(/[/?#]/)[0];
  const hostPort = authority.slice(authority.lastIndexOf('@') + 1);

  if (hostPort.startsWith('[')) return hostname.startsWith('[');

  const rawHost = hostPort.replace(/:\d*$/, '');
  if (IPV4_PATTERN.test(rawHost)) return true;

  if (IPV4_PATTERN.test(hostname)) return false;

  return FQDN_PATTERN.test(hostname);
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

  errors.registryName = getResourceNameErrorMessage(
    registryData.registryName,
    'Registry name',
    REGISTRY_NAME_MAX_LENGTH
  );

  const url = registryData.registryUrl.trim();
  if (!url) {
    errors.registryUrl = 'Registry URL is required';
  } else if (registryData.registryUrl.length > REGISTRY_URL_MAX_LENGTH) {
    errors.registryUrl = `Registry URL must not exceed ${REGISTRY_URL_MAX_LENGTH} characters.`;
  } else if (!isValidRegistryUrl(url)) {
    errors.registryUrl =
      'The RegistryUrl field is not a valid fully-qualified http, https URL.';
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

export function validateOnChange(
  shownErrors: RegistryFormErrors,
  registryData: RegistryForm,
  changedField: string
): RegistryFormErrors {
  const { errors: freshErrors } = validateRegistryForm(registryData);
  const next = { ...shownErrors };

  if (changedField === 'registryType') {
    CREDENTIAL_FIELDS.forEach((field) => {
      next[field] = '';
    });
  }

  (Object.keys(next) as (keyof RegistryFormErrors)[]).forEach((key) => {
    if (key === changedField || next[key]) next[key] = freshErrors[key];
  });
  return next;
}

const SERVER_FIELD_ALIASES: Record<string, keyof RegistryFormErrors> = {
  password: 'userPassword',
  userName: 'username',
};

export function applyServerFieldErrors(
  shownErrors: RegistryFormErrors,
  fieldErrors: Record<string, string>
): RegistryFormErrors {
  const next = { ...shownErrors };

  Object.entries(fieldErrors).forEach(([serverName, message]) => {
    const leaf = serverName.split('.').pop() ?? '';
    const camel = leaf.charAt(0).toLowerCase() + leaf.slice(1);
    const key = SERVER_FIELD_ALIASES[camel] ?? camel;

    if (key in next) next[key as keyof RegistryFormErrors] = message;
  });

  return next;
}

function stripWhitespace(value?: string): string {
  return (value ?? '').replace(/\s/g, '');
}

export function applyRegistryChange(
  prev: RegistryForm,
  category: string,
  registryType?: RegistryType,
  value?: string
): RegistryForm {
  switch (category) {
    case 'registryName':
      return { ...prev, registryName: value ?? '' };

    case 'registryUrl':
      return { ...prev, registryUrl: stripWhitespace(value) };

    case 'registryType':
      return applyRegistryTypeChange(prev, registryType);

    case 'username':
      return {
        ...prev,
        registryCredentials: {
          ...prev.registryCredentials,
          username: stripWhitespace(value),
        },
      };

    case 'accessToken':
      return {
        ...prev,
        registryCredentials: {
          ...prev.registryCredentials,
          accessToken: stripWhitespace(value),
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
          accessKey: stripWhitespace(value),
        },
      };

    case 'accessSecretKey':
      return {
        ...prev,
        registryCredentials: {
          ...prev.registryCredentials,
          accessSecretKey: stripWhitespace(value),
        },
      };

    case 'region':
      return {
        ...prev,
        registryCredentials: {
          ...prev.registryCredentials,
          region: stripWhitespace(value),
        },
      };

    default:
      return prev;
  }
}
