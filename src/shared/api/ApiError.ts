export class ApiError extends Error {
  constructor(
    message: string,

    readonly backendMessage?: string,

    readonly fieldErrors: Record<string, string> = {},

    readonly code?: string,

    readonly status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  return (error instanceof ApiError && error.backendMessage) || fallback;
}
