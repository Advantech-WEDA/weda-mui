import { ApiError } from '@shared/api/ApiError';

import type { MqttBrokerFormErrors } from '../domain/types';

type ErrorField = keyof MqttBrokerFormErrors;

const FIELD_BY_ERROR_CODE: Record<string, ErrorField> = {
  'WEDA.DataBridge.DuplicateBrokerConfigName': 'name',
};

const FIELD_BY_BACKEND_FIELD: Record<string, ErrorField> = {
  name: 'name',
  brokerconfigname: 'name',
  brokerendpoint: 'brokerEndpoint',
  username: 'username',
  password: 'password',
};

function fillMessagePlaceholders(message: string, name: string): string {
  return message.replace(/\{(brokerConfigName|name)\}/gi, name);
}

export function getMqttBrokerSubmitFieldErrors(
  error: unknown,
  submittedName: string
): Partial<MqttBrokerFormErrors> {
  if (!(error instanceof ApiError)) return {};

  const result: Partial<MqttBrokerFormErrors> = {};
  const fallbackMessage = fillMessagePlaceholders(error.message, submittedName);

  for (const [backendField, message] of Object.entries(error.fieldErrors)) {
    const lastSegment = backendField.split('.').pop()?.toLowerCase() ?? '';
    const field = FIELD_BY_BACKEND_FIELD[lastSegment];
    if (field) {
      result[field] = message
        ? fillMessagePlaceholders(message, submittedName)
        : fallbackMessage;
    }
  }

  const codeField = error.code ? FIELD_BY_ERROR_CODE[error.code] : undefined;
  if (codeField && !result[codeField]) {
    result[codeField] = fallbackMessage;
  }

  return result;
}

export function getMqttBrokerSubmitErrorMessage(
  error: unknown,
  fallback: string,
  submittedName: string
): string {
  const message = error instanceof Error ? error.message : fallback;
  return fillMessagePlaceholders(message || fallback, submittedName);
}
