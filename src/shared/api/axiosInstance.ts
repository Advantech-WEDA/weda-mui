import { startSignIn } from '@shared/auth/authCodeSession';
import { isAuthCodeMode } from '@shared/auth/authMode';
import { getTenant } from '@shared/lib/baseUrl';
import axios, { AxiosError } from 'axios';

import { decideAuthErrorAction } from './authErrorPolicy';

export const AUTH_REDIRECT_KEY = 'weda_auth_redirecting';

export const AUTH_REDIRECT_COOLDOWN_MS = 10_000;

function isWithinRedirectCooldown(): boolean {
  const lastRedirectAt = Number(sessionStorage.getItem(AUTH_REDIRECT_KEY));

  return (
    Boolean(lastRedirectAt) &&
    Date.now() - lastRedirectAt < AUTH_REDIRECT_COOLDOWN_MS
  );
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    _authRetried?: boolean;
  }
}

const axiosInstance = axios.create({
  withCredentials: true,
});

let accessTokenGetter: (() => string | undefined) | null = null;

export function setAccessTokenGetter(getter: () => string | undefined): void {
  accessTokenGetter = getter;
}

let tokenRefresher: (() => Promise<void>) | null = null;

export function setTokenRefresher(refresher: () => Promise<void>): void {
  tokenRefresher = refresher;
}

export function isSameOriginRequestUrl(url: string | undefined): boolean {
  if (!url) return true;

  try {
    return (
      new URL(url, window.location.origin).origin === window.location.origin
    );
  } catch {
    return false;
  }
}

axiosInstance.interceptors.request.use((requestConfig) => {
  if (
    !requestConfig.headers.Authorization &&
    accessTokenGetter &&
    isSameOriginRequestUrl(requestConfig.url)
  ) {
    const accessToken = accessTokenGetter();

    if (accessToken) {
      requestConfig.headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  return requestConfig;
});

function buildLoginUrl(): string {
  const tenant = getTenant();

  const originDomain = window.location.origin.includes('localhost')
    ? import.meta.env.VITE_ORIGIN
    : window.location.origin;

  return `${originDomain}/${tenant}/portal/login?returnUrl=${encodeURIComponent(
    window.location.href
  )}`;
}

export function redirectToLoginOnce(): void {
  if (isWithinRedirectCooldown()) return;

  sessionStorage.setItem(AUTH_REDIRECT_KEY, String(Date.now()));

  if (isAuthCodeMode()) {
    startSignIn(window.location.href).catch((error: unknown) => {
      console.error('[redirectToLoginOnce] sign-in failed to start:', error);
    });

    return;
  }

  window.location.assign(buildLoginUrl());
}

let refreshPromise: Promise<void> | null = null;

function refreshTokenOnce(): Promise<void> {
  if (!tokenRefresher) {
    return Promise.reject(
      new Error('[axiosInstance] no token refresher registered')
    );
  }

  if (!refreshPromise) {
    refreshPromise = tokenRefresher().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url ?? '';
    const isRedirecting = isWithinRedirectCooldown();

    const action = decideAuthErrorAction({
      status,
      requestUrl,
      hasRetried: Boolean(error.config?._authRetried),
      isRedirecting,
    });

    if (action === 'refresh-and-retry' && error.config) {
      try {
        await refreshTokenOnce();
      } catch {
        redirectToLoginOnce();
        return Promise.reject(error);
      }

      error.config._authRetried = true;
      error.config.headers.delete('Authorization');

      return axiosInstance(error.config);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
