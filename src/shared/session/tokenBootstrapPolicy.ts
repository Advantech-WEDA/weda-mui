export type TokenBootstrapAction =
  | 'retry'
  | 'redirect-to-login'
  | 'notify-account-not-found'
  | 'notify-init-failed';

export const EMPTY_ACCESS_TOKEN_MAX_RETRIES = 2;

export interface TokenBootstrapPolicyInput {
  status: number | undefined;

  errorCode: string | undefined;

  retryCount: number;
}

export function decideTokenBootstrapAction({
  status,
  errorCode,
  retryCount,
}: TokenBootstrapPolicyInput): TokenBootstrapAction {
  if (errorCode === 'WEDA.OAuth.EmptyAccessToken') {
    return retryCount < EMPTY_ACCESS_TOKEN_MAX_RETRIES
      ? 'retry'
      : 'redirect-to-login';
  }

  if (errorCode === 'WEDA.User.NotFound') {
    return 'notify-account-not-found';
  }

  if (status === 401 || status === 403) {
    return 'redirect-to-login';
  }

  return 'notify-init-failed';
}
