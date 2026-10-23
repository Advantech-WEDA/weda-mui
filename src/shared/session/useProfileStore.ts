import { apiPath } from '@shared/api/apiPath';
import axiosInstance, { redirectToLoginOnce } from '@shared/api/axiosInstance';
import { signOut } from '@shared/auth/authCodeSession';
import { isAuthCodeMode } from '@shared/auth/authMode';
import { getAppBasePath } from '@shared/lib/appRoute';
import { getTenant } from '@shared/lib/baseUrl';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { create } from 'zustand';

export interface IUserProfile {
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  email: string | null;
}

interface IProfileState {
  userProfile: IUserProfile | null;
  GET_CURRENT_USER: (userId: string) => Promise<IUserProfile | null>;
  CLEAR_USER_PROFILE: () => void;
  HANDLE_LOGIN: () => void;
  HANDLE_SIGNOUT: () => void;
}

const trimTrailingSlash = (value: string): string => value.replace(/\/$/, '');

const getPortalOrigin = (): string => {
  if (window.location.origin.includes('localhost')) {
    return trimTrailingSlash(import.meta.env.VITE_ORIGIN);
  }

  return trimTrailingSlash(window.location.origin);
};

const buildPortalUrl = (
  path: 'login' | 'logout' | 'signout' | 'external-logout',
  returnUrl: string
): string => {
  const tenant = getTenant();

  return `${getPortalOrigin()}/${tenant}/portal/${path}?returnUrl=${encodeURIComponent(
    returnUrl
  )}`;
};

const clearLocalProfileSession = (): void => {
  useOrgContentStore.getState().clearCurrentOrg();
};

export const useProfileStore = create<IProfileState>()((set, get) => ({
  userProfile: null,

  async GET_CURRENT_USER(userId: string): Promise<IUserProfile | null> {
    try {
      const { data } = await axiosInstance.get<IUserProfile>(
        apiPath(`/api/v1/users/${userId}`)
      );

      const userProfile: IUserProfile = {
        firstName: data.firstName,
        lastName: data.lastName,
        name: data.name,
        email: data.email,
      };

      set({ userProfile });

      return userProfile;
    } catch (error) {
      console.error('[GET_CURRENT_USER] fetch failed:', error);

      set({ userProfile: null });

      return null;
    }
  },

  CLEAR_USER_PROFILE: (): void => {
    set({ userProfile: null });
  },

  HANDLE_LOGIN: (): void => {
    redirectToLoginOnce();
  },

  HANDLE_SIGNOUT: (): void => {
    if (isAuthCodeMode()) {
      clearLocalProfileSession();
      get().CLEAR_USER_PROFILE();
      signOut();

      return;
    }

    const originDomain = getPortalOrigin();
    const tenant = getTenant();

    const signOutUrl = buildPortalUrl(
      'signout',
      `${originDomain}${getAppBasePath(tenant)}`
    );

    const logoutUrl = buildPortalUrl('external-logout', signOutUrl);

    clearLocalProfileSession();
    get().CLEAR_USER_PROFILE();

    window.location.assign(logoutUrl);
  },
}));
