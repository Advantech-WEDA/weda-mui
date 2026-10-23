export function base64UrlEncode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function randomString(byteLength = 32): string {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(byteLength)));
}

export async function computeCodeChallenge(
  codeVerifier: string
): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(codeVerifier)
  );

  return base64UrlEncode(new Uint8Array(digest));
}

export function buildAuthorizeUrl({
  identityUrl,
  clientId,
  redirectUri,
  scope,
  state,
  nonce,
  codeChallenge,
}: {
  identityUrl: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  state: string;
  nonce: string;
  codeChallenge: string;
}): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return `${identityUrl}/connect/authorize?${params.toString()}`;
}

export function buildTokenRequestBody({
  clientId,
  code,
  redirectUri,
  codeVerifier,
}: {
  clientId: string;
  code: string;
  redirectUri: string;
  codeVerifier: string;
}): string {
  return new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier,
  }).toString();
}

export function buildLogoutUrl({
  identityUrl,
  clientId,
  idTokenHint,
  postLogoutRedirectUri,
}: {
  identityUrl: string;
  clientId: string;
  idTokenHint: string | undefined;
  postLogoutRedirectUri: string;
}): string {
  const params = new URLSearchParams({
    client_id: clientId,
    post_logout_redirect_uri: postLogoutRedirectUri,
  });

  if (idTokenHint) {
    params.set('id_token_hint', idTokenHint);
  }

  return `${identityUrl}/connect/logout?${params.toString()}`;
}

export type CallbackResult =
  | { ok: true; code: string }
  | { ok: false; error: string };

export function parseCallback(
  search: string,
  expectedState: string | undefined
): CallbackResult {
  const params = new URLSearchParams(search);
  const error = params.get('error');

  if (error) {
    return { ok: false, error };
  }

  if (!expectedState || params.get('state') !== expectedState) {
    return { ok: false, error: 'state_mismatch' };
  }

  const code = params.get('code');

  if (!code) {
    return { ok: false, error: 'missing_code' };
  }

  return { ok: true, code };
}

function decodeJwtPayload(jwt: string): Record<string, unknown> | null {
  try {
    const payload = jwt.split('.')[1] ?? '';
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));

    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

export function checkIdToken(
  idToken: string | undefined,
  { clientId, nonce }: { clientId: string; nonce: string }
): string | null {
  if (!idToken) {
    return 'missing_id_token';
  }

  const claims = decodeJwtPayload(idToken);

  if (!claims) {
    return 'malformed_id_token';
  }

  if (claims.nonce !== nonce) {
    return 'nonce_mismatch';
  }

  const audience = Array.isArray(claims.aud) ? claims.aud : [claims.aud];

  if (!audience.includes(clientId)) {
    return 'audience_mismatch';
  }

  return null;
}

export const EXPIRY_SKEW_MS = 60_000;

export function computeExpiresAt(
  nowMs: number,
  expiresInSeconds: number
): number {
  return nowMs + expiresInSeconds * 1000;
}

export function isExpired(expiresAt: number, nowMs: number): boolean {
  return nowMs >= expiresAt - EXPIRY_SKEW_MS;
}
