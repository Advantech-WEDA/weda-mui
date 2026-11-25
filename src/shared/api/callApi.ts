import axios from 'axios';

import { ApiError } from './ApiError';
import {
  extractBackendMessage,
  extractErrorCode,
  extractErrorMessage,
  extractFieldErrors,
} from './extractErrorMessage';

export async function callApi<T>(
  label: string,
  call: () => Promise<T>
): Promise<T> {
  try {
    return await call();
  } catch (error: unknown) {
    if (axios.isCancel(error)) {
      throw error;
    }

    if (error instanceof ApiError) {
      console.error(error.message, error);
      throw error;
    }

    const message = extractErrorMessage(error, `[${label}] Fetch failed`);

    console.error(message, error);
    throw new ApiError(
      message,
      extractBackendMessage(error),
      extractFieldErrors(error),
      extractErrorCode(error),
      axios.isAxiosError(error) ? error.response?.status : undefined
    );
  }
}
