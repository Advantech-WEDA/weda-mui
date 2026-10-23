import {
  buildAuthorizeUrl,
  buildLogoutUrl,
  buildTokenRequestBody,
  checkIdToken,
  computeCodeChallenge,
  computeExpiresAt,
  isExpired,
  parseCallback,
  randomString,
} from './authCodeFlow';

export const CALLBACK_PATH = '/auth/callback';

const TOKEN_PATH = '/identity/connect/token';

const SCOPE = 'openid profile email';

const ATTEMPT_KEY = 'weda_authcode_attempt';
const TOKENS_KEY = 'weda_authcode_tokens';

interface SignInAttempt {
  state: string;
  nonce: string;
  codeVerifier: string;
  returnUrl: string;
}

interface StoredTokens {
  accessToken: string;
  idToken: string;
  expiresAt: number;
}

interface TokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
}

export function getIdentityUrl(): string {
  return `${import.meta.env.VITE_ORIGIN.replace(/\/$/, '')}/identity`;
}

function getClientId(): string {
  return import.meta.env.VITE_AUTH_CLIENT_ID ?? '';
}

function getRedirectUri(): string {
  return `${window.location.origin}${CALLBACK_PATH}`;
}

function readJson<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);

    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function startSignIn(returnUrl: string): Promise<void> {
  const clientId = getClientId();

  if (!clientId) {
    throw new Error(
      '[authcode] VITE_AUTH_CLIENT_ID is not set. See .env.example.'
    );
  }

  const attempt: SignInAttempt = {
    state: randomString(),
    nonce: randomString(),
    codeVerifier: randomString(),
    returnUrl,
  };

  const codeChallenge = await computeCodeChallenge(attempt.codeVerifier);

  sessionStorage.setItem(ATTEMPT_KEY, JSON.stringify(attempt));

  window.location.assign(
    buildAuthorizeUrl({
      identityUrl: getIdentityUrl(),
      clientId,
      redirectUri: getRedirectUri(),
      scope: SCOPE,
      state: attempt.state,
      nonce: attempt.nonce,
      codeChallenge,
    })
  );
}

export async function completeSignInIfCallback(): Promise<boolean> {
  if (window.location.pathname !== CALLBACK_PATH) {
    return false;
  }

  const attempt = readJson<SignInAttempt>(ATTEMPT_KEY);

  sessionStorage.removeItem(ATTEMPT_KEY);

  try {
    const callback = parseCallback(window.location.search, attempt?.state);

    if (!callback.ok || !attempt) {
      throw new Error(callback.ok ? 'state_mismatch' : callback.error);
    }

    const response = await fetch(TOKEN_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: buildTokenRequestBody({
        clientId: getClientId(),
        code: callback.code,
        redirectUri: getRedirectUri(),
        codeVerifier: attempt.codeVerifier,
      }),
    });

    if (!response.ok) {
      throw new Error(`token_request_failed (HTTP ${response.status})`);
    }

    const tokens = (await response.json()) as TokenResponse;

    const idTokenError = checkIdToken(tokens.id_token, {
      clientId: getClientId(),
      nonce: attempt.nonce,
    });

    if (idTokenError) {
      throw new Error(idTokenError);
    }

    const stored: StoredTokens = {
      accessToken: tokens.access_token,
      idToken: tokens.id_token,
      expiresAt: computeExpiresAt(Date.now(), tokens.expires_in),
    };

    sessionStorage.setItem(TOKENS_KEY, JSON.stringify(stored));

    window.location.replace(attempt.returnUrl);
  } catch (error) {
    console.error('[authcode] sign-in failed:', error);

    showSignInError(
      error instanceof Error ? error.message : String(error),
      attempt?.returnUrl ?? '/'
    );
  }

  return true;
}

function showSignInError(reason: string, returnUrl: string): void {
  const root = document.getElementById('root');

  if (!root) return;

  const message = document.createElement('p');
  message.textContent = `Sign-in failed: ${reason}`;

  const retry = document.createElement('a');
  retry.href = returnUrl;
  retry.textContent = 'Try again';

  root.replaceChildren(message, retry);
}

export function getAccessToken(): string | undefined {
  const tokens = readJson<StoredTokens>(TOKENS_KEY);

  if (!tokens || isExpired(tokens.expiresAt, Date.now())) {
    return undefined;
  }

  return tokens.accessToken;
}

export function signOut(): void {
  const tokens = readJson<StoredTokens>(TOKENS_KEY);

  sessionStorage.removeItem(TOKENS_KEY);

  window.location.assign(
    buildLogoutUrl({
      identityUrl: getIdentityUrl(),
      clientId: getClientId(),
      idTokenHint: tokens?.idToken,
      postLogoutRedirectUri: `${window.location.origin}/`,
    })
  );
}
