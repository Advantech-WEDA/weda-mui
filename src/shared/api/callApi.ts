import axios from 'axios';

import { extractErrorMessage } from './extractErrorMessage';

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

    const message = extractErrorMessage(error, `[${label}] Fetch failed`);

    console.error(message, error);
    throw new Error(message);
  }
}
