import axios from 'axios';

interface IProblemDetailsValidationItem {
  fieldName?: string | null;
  detail?: string | null;
}

interface IProblemDetailsErrorData {
  detail?: string;
  message?: string;
  title?: string;

  validationItems?: IProblemDetailsValidationItem[] | null;
}

interface IAbpErrorResponseData {
  error?: {
    code?: string;
    message?: string;
    details?: string;
  };
}

const FORBIDDEN_FALLBACK_MESSAGE = 'This action is not allowed right now.';

export function extractErrorMessage(
  error: unknown,
  fallbackMessage: string
): string {
  if (axios.isAxiosError(error)) {
    const problemDetails = error.response?.data as
      | IProblemDetailsErrorData
      | undefined;
    const abpError = (error.response?.data as IAbpErrorResponseData | undefined)
      ?.error;

    const validationMessage = (problemDetails?.validationItems ?? [])
      .map((item) => item?.detail)
      .filter((detail): detail is string => Boolean(detail))
      .join('; ');

    const backendMessage =
      validationMessage ||
      problemDetails?.detail ||
      problemDetails?.message ||
      problemDetails?.title ||
      abpError?.message;

    if (backendMessage) {
      return backendMessage;
    }

    if (error.response?.status === 403) {
      return FORBIDDEN_FALLBACK_MESSAGE;
    }

    return fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  return fallbackMessage;
}
