import { apiPath } from '@shared/api/apiPath';
import axiosInstance, {
  setAccessTokenGetter,
  setTokenRefresher,
} from '@shared/api/axiosInstance';
import { getAccessToken } from '@shared/auth/authCodeSession';
import { isAuthCodeMode } from '@shared/auth/authMode';
import { jwtDecode } from 'jwt-decode';
import { create } from 'zustand';

export interface IUserIAmToken {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface IResourceAccessItem {
  orgName: string;
  orgRole: string;
  roles: string[];
}

export interface IUserIAmUserProfile {
  exp: number;
  id: string;
  sub: string;
  role: string;
  iss: string;
  aud: string;
  realm_access: {
    roles: string[];
  };
  resource_access?: Record<string, IResourceAccessItem>;

  preferred_username: string;
  email: string;
  tenantId: string;
  srp_name: string;
}

interface IIamState {
  userIAmToken: IUserIAmToken | null;
  userIAmUserProfile: IUserIAmUserProfile | null;

  POST_CREATE_JWT_ACCESS_TOKEN: () => Promise<IUserIAmToken>;
  POST_REFRESH_JWT_ACCESS_TOKEN: () => Promise<IUserIAmToken | null>;
}

let createTokenRequest: Promise<IUserIAmToken> | null = null;

function getExchangeHeaders(): { Authorization: string } | undefined {
  const identityToken = isAuthCodeMode() ? getAccessToken() : undefined;

  return identityToken
    ? { Authorization: `Bearer ${identityToken}` }
    : undefined;
}

export const useIAmStore = create<IIamState>()((set, get) => ({
  userIAmToken: null,
  userIAmUserProfile: null,

  POST_CREATE_JWT_ACCESS_TOKEN(): Promise<IUserIAmToken> {
    if (createTokenRequest) {
      return createTokenRequest;
    }

    createTokenRequest = (async () => {
      try {
        const { data } = await axiosInstance.post<IUserIAmToken>(
          apiPath('/api/v1/auth/tokens'),
          {},
          { headers: getExchangeHeaders() }
        );

        if (!data?.accessToken) {
          throw new Error('accessToken is missing from API response.');
        }

        const iAmUserData = jwtDecode<IUserIAmUserProfile>(data.accessToken);

        set({
          userIAmToken: data,
          userIAmUserProfile: iAmUserData,
        });

        return data;
      } catch (error: unknown) {
        console.error('[POST_CREATE_JWT_ACCESS_TOKEN] failed:', error);

        set({
          userIAmToken: null,
          userIAmUserProfile: null,
        });

        throw error;
      } finally {
        createTokenRequest = null;
      }
    })();

    return createTokenRequest;
  },

  async POST_REFRESH_JWT_ACCESS_TOKEN(): Promise<IUserIAmToken | null> {
    const currentToken = get().userIAmToken;

    if (!currentToken?.refreshToken) {
      const error = new Error(
        '[Refresh JWT access token] refreshToken not found'
      );
      console.warn(error.message);
      throw error;
    }

    try {
      const { data } = await axiosInstance.post<IUserIAmToken>(
        apiPath('/api/v1/auth/tokens?grant_type=refresh_token'),
        { refreshToken: currentToken.refreshToken }
      );

      const iAmUserData = jwtDecode<IUserIAmUserProfile>(data.accessToken);

      set({
        userIAmToken: data,
        userIAmUserProfile: iAmUserData,
      });

      return data;
    } catch (error) {
      set({
        userIAmToken: null,
        userIAmUserProfile: null,
      });

      console.error('[Refresh JWT access token] Fetch failed:', error);
      throw error;
    }
  },
}));

setAccessTokenGetter(() => useIAmStore.getState().userIAmToken?.accessToken);

setTokenRefresher(() =>
  useIAmStore
    .getState()
    .POST_REFRESH_JWT_ACCESS_TOKEN()
    .then(() => undefined)
);
