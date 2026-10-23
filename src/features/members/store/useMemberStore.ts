import axios from 'axios';
import { create } from 'zustand';

import { membersApi } from '../api/members.api';
import type {
  IAppUserList,
  IAppUserListParameters,
  IGetEditMemberListParams,
  IMemberDetailItem,
  IMemberItem,
  IMemberList,
  IMemberListParameters,
} from '../api/members.api.types';

interface IMemberState {
  editMemberList: IMemberDetailItem[];
  editMemberListLoading: boolean;
  editMemberListError: string | null;

  CLEAR_EDIT_MEMBER_LIST: () => void;

  GET_ROOT_ORG_USERS: (
    params: IAppUserListParameters
  ) => Promise<IAppUserList | null>;

  GET_ORG_USERS_BY_ORG_ID: (
    params: IMemberListParameters,
    signal?: AbortSignal
  ) => Promise<IMemberList | null>;

  GET_EDIT_MEMBER_LIST: (
    params: IGetEditMemberListParams,
    signal?: AbortSignal
  ) => Promise<IMemberDetailItem[] | null>;
  POST_USERS: (params: {
    orgId: string;
    users: { userId: string; orgRole: string }[];
  }) => Promise<IMemberItem[] | null>;
  PATCH_MEMBER_BY_ID: (params: {
    orgId: string;
    users: { userId: string; orgRole: string }[];
  }) => Promise<IMemberItem[] | null>;
  DELETE_MEMBER: (params: {
    orgId: string;
    userId: string;
  }) => Promise<boolean>;
}

export const useMemberStore = create<IMemberState>()((set) => ({
  editMemberList: [],
  editMemberListLoading: false,
  editMemberListError: null,

  CLEAR_EDIT_MEMBER_LIST: () => {
    set({
      editMemberList: [],
      editMemberListLoading: false,
      editMemberListError: null,
    });
  },

  async GET_ROOT_ORG_USERS(
    params: IAppUserListParameters
  ): Promise<IAppUserList | null> {
    try {
      return await membersApi.getAppUsers(params);
    } catch (error) {
      console.error('[GET_ROOT_ORG_USERS] fetch failed:', error);

      return null;
    }
  },

  async GET_ORG_USERS_BY_ORG_ID(
    {
      orgId,
      skipCount,
      maxResultCount,
      name,
      sorting,
      orgRole,
    }: IMemberListParameters,
    signal?: AbortSignal
  ): Promise<IMemberList | null> {
    if (!orgId) {
      console.warn('[GET_ORG_USERS_BY_ORG_ID] orgId not found');
      return Promise.reject('No orgId');
    }

    try {
      return await membersApi.getOrgUsersByOrgId(
        {
          orgId,
          skipCount,
          maxResultCount,
          name,
          sorting,
          orgRole,
        },
        signal
      );
    } catch (error) {
      if (axios.isCancel(error)) {
        return null;
      }

      console.error('[GET_ORG_USERS_BY_ORG_ID] fetch failed:', error);

      return null;
    }
  },

  async GET_EDIT_MEMBER_LIST(
    { orgId, userIds }: IGetEditMemberListParams,
    signal?: AbortSignal
  ): Promise<IMemberDetailItem[] | null> {
    if (!orgId) {
      set({
        editMemberList: [],
        editMemberListLoading: false,
        editMemberListError: 'orgId not found',
      });
      console.warn('[GET_EDIT_MEMBER_LIST] orgId not found');
      return Promise.reject('No orgId');
    }

    if (!userIds?.length) {
      set({
        editMemberList: [],
        editMemberListLoading: false,
        editMemberListError: 'userIds is empty',
      });
      console.warn('[GET_EDIT_MEMBER_LIST] userIds is empty');
      return Promise.reject('No userIds');
    }

    set({
      editMemberList: [],
      editMemberListLoading: true,
      editMemberListError: null,
    });

    try {
      const data = await membersApi.getEditMemberList(
        { orgId, userIds },
        signal
      );

      set({
        editMemberList: data,
        editMemberListLoading: false,
        editMemberListError: null,
      });

      return data;
    } catch (error) {
      if (axios.isCancel(error)) {
        return null;
      }

      console.error('[GET_EDIT_MEMBER_LIST] fetch failed:', error);

      set({
        editMemberList: [],
        editMemberListLoading: false,
        editMemberListError: 'Failed to fetch edit member list',
      });

      return null;
    }
  },

  async POST_USERS({
    orgId,
    users,
  }: {
    orgId: string;
    users: { userId: string; orgRole: string }[];
  }): Promise<IMemberItem[] | null> {
    if (!orgId) {
      console.warn('[POST_USERS] orgId not found');
      return Promise.reject('No orgId');
    }

    if (!users || users.length === 0) {
      console.warn('[POST_USERS] users is empty');
      return Promise.reject('Users empty');
    }

    try {
      return await membersApi.postUsers({ orgId, users });
    } catch (error) {
      console.error('[POST_USERS] failed:', error);
      throw error;
    }
  },

  async PATCH_MEMBER_BY_ID({
    orgId,
    users,
  }: {
    orgId: string;
    users: { userId: string; orgRole: string }[];
  }): Promise<IMemberItem[] | null> {
    if (!orgId) {
      console.warn('[PATCH_MEMBER_BY_ID] orgId not found');
      return Promise.reject('No orgId');
    }

    if (!users?.length) {
      console.warn('[PATCH_MEMBER_BY_ID] users empty');
      return Promise.reject('Users empty');
    }

    try {
      return await membersApi.patchMemberById({ orgId, users });
    } catch (error) {
      console.error('[PATCH_MEMBER_BY_ID] failed:', error);
      throw error;
    }
  },

  async DELETE_MEMBER({
    orgId,
    userId,
  }: {
    orgId: string;
    userId: string;
  }): Promise<boolean> {
    if (!orgId || !userId) return false;

    try {
      await membersApi.deleteMember({ orgId, userId });

      return true;
    } catch (error) {
      console.error('[DELETE_MEMBER]', error);
      return false;
    }
  },
}));
