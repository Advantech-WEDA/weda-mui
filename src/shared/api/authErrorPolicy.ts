export type AuthErrorAction = 'refresh-and-retry' | 'propagate';

export interface AuthErrorPolicyInput {
  status: number | undefined;
  requestUrl: string;

  hasRetried: boolean;

  isRedirecting: boolean;
}

const AUTH_SKIP_URL_PATTERNS = [
  '/portal/login',
  '/portal/logout',
  '/portal/signout',
];

const TOKEN_ENDPOINT_URL_PATTERN = '/api/v1/auth/tokens';

export function decideAuthErrorAction({
  status,
  requestUrl,
  hasRetried,
  isRedirecting,
}: AuthErrorPolicyInput): AuthErrorAction {
  if (AUTH_SKIP_URL_PATTERNS.some((pattern) => requestUrl.includes(pattern))) {
    return 'propagate';
  }

  if (isRedirecting) {
    return 'propagate';
  }

  if (requestUrl.includes(TOKEN_ENDPOINT_URL_PATTERN)) {
    return 'propagate';
  }

  if (status !== 401) {
    return 'propagate';
  }

  if (hasRetried) {
    return 'propagate';
  }

  return 'refresh-and-retry';
}
