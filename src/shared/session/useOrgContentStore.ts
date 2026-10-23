import { apiPath } from '@shared/api/apiPath';
import axiosInstance from '@shared/api/axiosInstance';
import { fetchAllPages, MAX_PAGE_SIZE } from '@shared/api/fetchAllPages';
import { useIAmStore } from '@shared/session/useIAmStore';
import axios from 'axios';
import { create } from 'zustand';

export interface IOrgAdmin {
  userId: string;
  name?: string | null;
  email?: string | null;
  orgRole?: string | null;
}

export interface IUserOrgListParameters {
  userId: string;
  orgId?: string;
  orgName?: string;
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
  filter?: string;
}

export interface IUserOrgItem {
  orgId: string;
  parentOrgId: string | null;
  name: string | null;
  description: string | null;
  admins: IOrgAdmin[] | null;
  orgRole: string;
  createdAt: string;
  updatedAt: string | null;
  children: IUserOrgItem[] | null;
}

export interface IUserOrgList {
  totalCount: number;
  items: IUserOrgItem[];
}

const findOrgById = (
  nodes: IUserOrgItem[],
  orgId: string
): IUserOrgItem | undefined => {
  for (const node of nodes) {
    if (node.orgId === orgId) {
      return node;
    }

    const found = findOrgById(node.children || [], orgId);

    if (found) {
      return found;
    }
  }

  return undefined;
};

const getInitialOrgState = () => ({
  currentOrgId: localStorage.getItem('currentOrgId') || '',
  currentOrgName: localStorage.getItem('currentOrgName') || '',
});

interface IOrgContentState {
  currentOrgId: string;
  currentOrgName: string | null;

  userOrgList: IUserOrgList | null;
  userOrgListLoading: boolean;
  userOrgListError: string | null;

  checkIsRootOrgById: (orgId: string) => boolean;

  getParentOrgId: () => string;
  setCurrentOrg: (orgId: string, orgName: string) => void;
  clearCurrentOrg: () => void;

  GET_ORGANIZATION: () => Promise<void>;
  GET_USER_ORGS_BY_USER_ID: (
    params: IUserOrgListParameters
  ) => Promise<IUserOrgList | null>;
  GET_ALL_USER_ORGS_BY_USER_ID: (
    params: Omit<IUserOrgListParameters, 'skipCount' | 'maxResultCount'>
  ) => Promise<IUserOrgList | null>;
}

export const useOrgContentStore = create<IOrgContentState>()((set) => ({
  userOrgList: null,
  userOrgListLoading: false,
  userOrgListError: null,

  ...getInitialOrgState(),

  checkIsRootOrgById: (orgId: string) => {
    const { userOrgList } = useOrgContentStore.getState();

    if (!userOrgList || !orgId) return false;

    const targetOrg = findOrgById(userOrgList.items, orgId);

    return targetOrg?.parentOrgId === null;
  },

  getParentOrgId: () => {
    const { userOrgList, currentOrgId } = useOrgContentStore.getState();

    if (!userOrgList || !currentOrgId) {
      return '';
    }

    const currentOrg = findOrgById(userOrgList.items, currentOrgId);

    return currentOrg?.parentOrgId ?? '';
  },

  setCurrentOrg: (orgId: string, orgName: string) => {
    localStorage.setItem('currentOrgId', orgId);
    localStorage.setItem('currentOrgName', orgName);

    set({
      currentOrgId: orgId,
      currentOrgName: orgName,
    });
  },

  clearCurrentOrg: () => {
    localStorage.removeItem('currentOrgId');
    localStorage.removeItem('currentOrgName');

    set({
      currentOrgId: '',
      currentOrgName: '',
    });
  },

  async GET_ORGANIZATION(): Promise<void> {
    const { userIAmUserProfile } = useIAmStore.getState();
    const userId = userIAmUserProfile?.sub;

    try {
      const url = apiPath(
        `/api/v1/users/${encodeURIComponent(userId ?? '')}/orgs`
      );

      const { data } = await axiosInstance.get(url);

      const orgList: IUserOrgItem[] = Array.isArray(data)
        ? data
        : (data?.items ?? []);

      set({
        userOrgList: {
          totalCount: orgList.length,
          items: orgList,
        },
      });

      const { currentOrgId } = useOrgContentStore.getState();

      if (currentOrgId) {
        const savedOrg = findOrgById(orgList, currentOrgId);

        if (savedOrg) {
          set({
            currentOrgId: savedOrg.orgId,
            currentOrgName: savedOrg.name,
          });

          localStorage.setItem('currentOrgId', savedOrg.orgId);
          localStorage.setItem('currentOrgName', savedOrg.name ?? '');
          return;
        }
      }
      const firstOrg = orgList.find((org) => !org.parentOrgId) ?? null;

      if (firstOrg) {
        set({
          currentOrgId: firstOrg.orgId,
          currentOrgName: firstOrg.name,
        });

        localStorage.setItem('currentOrgId', firstOrg.orgId);
        localStorage.setItem('currentOrgName', firstOrg.name ?? '');
      } else {
        useOrgContentStore.getState().clearCurrentOrg();
      }
    } catch (error: unknown) {
      set({ userOrgList: null });

      let errorMessage = '[Get Organization Data] Fetch failed';

      if (axios.isAxiosError(error)) {
        errorMessage =
          (error.response?.data as { detail?: string })?.detail || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }

      console.error(errorMessage, error);
      return Promise.reject(new Error(errorMessage));
    }
  },

  GET_USER_ORGS_BY_USER_ID(params): Promise<IUserOrgList | null> {
    return loadUserOrgs(params, () => fetchUserOrgsPage(params));
  },

  GET_ALL_USER_ORGS_BY_USER_ID(params): Promise<IUserOrgList | null> {
    return loadUserOrgs(params, () =>
      fetchAllPages(
        (page) => fetchUserOrgsPage({ ...params, ...page }),
        MAX_PAGE_SIZE
      )
    );
  },
}));

const fetchUserOrgsPage = async (
  params: IUserOrgListParameters
): Promise<IUserOrgList> => {
  const queryParams = new URLSearchParams();

  if (params.orgId?.trim()) {
    queryParams.append('orgId', params.orgId.trim());
  }

  if (params.orgName?.trim()) {
    queryParams.append('orgName', params.orgName.trim());
  }

  if (params.skipCount !== undefined) {
    queryParams.append('skipCount', String(params.skipCount));
  }

  if (params.maxResultCount !== undefined) {
    queryParams.append('maxResultCount', String(params.maxResultCount));
  }

  if (params.sorting?.trim()) {
    queryParams.append('sorting', params.sorting.trim());
  }

  if (params.filter?.trim()) {
    queryParams.append('filter', params.filter.trim());
  }

  const url = apiPath(
    `/api/v1/users/${encodeURIComponent(params.userId)}/orgs${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`
  );

  const { data } = await axiosInstance.get<IUserOrgList>(url);

  return data;
};

const loadUserOrgs = async (
  params: IUserOrgListParameters,
  fetchData: () => Promise<IUserOrgList>
): Promise<IUserOrgList | null> => {
  const set = useOrgContentStore.setState;

  if (!params.userId) {
    set({
      userOrgList: null,
      userOrgListLoading: false,
      userOrgListError: 'UserId not found',
    });
    console.warn('[GET_USER_ORGS_BY_USER_ID] UserId not found');
    return Promise.reject('No userId');
  }

  set({
    userOrgListLoading: true,
    userOrgListError: null,
  });

  try {
    const data = await fetchData();
    const isSearchScoped = Boolean(
      params.orgId?.trim() || params.orgName?.trim() || params.filter?.trim()
    );

    if (!isSearchScoped) {
      const { currentOrgId, currentOrgName } = useOrgContentStore.getState();

      if (!data.items || data.items.length === 0) {
        useOrgContentStore.getState().clearCurrentOrg();
      } else {
        const matchedOrg = currentOrgId
          ? findOrgById(data.items, currentOrgId)
          : undefined;

        const isValid =
          !!matchedOrg && (matchedOrg.name ?? '') === (currentOrgName ?? '');

        if (!isValid) {
          const firstItem = data.items[0];

          useOrgContentStore
            .getState()
            .setCurrentOrg(firstItem.orgId, firstItem.name ?? '');
        }
      }
    }

    set({
      userOrgList: data,
      userOrgListLoading: false,
      userOrgListError: null,
    });

    return data;
  } catch (error) {
    console.error('[GET_USER_ORGS_BY_USER_ID] fetch failed:', error);

    set({
      userOrgList: null,
      userOrgListLoading: false,
      userOrgListError: 'Failed to fetch user organization roles',
    });

    return null;
  }
};
