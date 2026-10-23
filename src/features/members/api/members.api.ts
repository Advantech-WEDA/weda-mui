import { apiPath } from '@shared/api/apiPath';
import axiosInstance from '@shared/api/axiosInstance';

import type {
  IAppUserList,
  IAppUserListParameters,
  IGetEditMemberListParams,
  IMemberDetailItem,
  IMemberItem,
  IMemberList,
  IMemberListParameters,
} from './members.api.types';

const getAppUsers = async ({
  skipCount,
  maxResultCount,
  sorting,
  filter,
}: IAppUserListParameters): Promise<IAppUserList> => {
  const queryParams = new URLSearchParams();

  if (skipCount !== undefined) {
    queryParams.append('skipCount', String(skipCount));
  }

  if (maxResultCount !== undefined) {
    queryParams.append('maxResultCount', String(maxResultCount));
  }

  if (sorting?.trim()) {
    queryParams.append('sorting', sorting.trim());
  }

  if (filter?.trim()) {
    queryParams.append('filter', filter.trim());
  }

  const { data } = await axiosInstance.get<IAppUserList>(
    apiPath(`/api/v1/users?${queryParams.toString()}`)
  );

  return data;
};

const getOrgUsersByOrgId = async (
  {
    orgId,
    skipCount,
    maxResultCount,
    name,
    sorting,
    orgRole,
  }: IMemberListParameters,
  signal?: AbortSignal
): Promise<IMemberList> => {
  const queryParams = new URLSearchParams();

  if (skipCount !== undefined) {
    queryParams.append('skipCount', String(skipCount));
  }

  if (maxResultCount !== undefined) {
    queryParams.append('maxResultCount', String(maxResultCount));
  }

  if (name?.trim()) {
    queryParams.append('name', name.trim());
  }

  if (sorting?.trim()) {
    queryParams.append('sorting', sorting.trim());
  }

  if (orgRole?.trim()) {
    queryParams.append('orgRole', orgRole.trim());
  }

  const { data } = await axiosInstance.get<IMemberList>(
    apiPath(`/api/v1/orgs/${orgId}/users?${queryParams.toString()}`),
    { signal }
  );

  return data;
};

const getEditMemberList = async (
  { orgId, userIds }: IGetEditMemberListParams,
  signal?: AbortSignal
): Promise<IMemberDetailItem[]> => {
  const requests = userIds.map((userId) =>
    axiosInstance.get<IMemberDetailItem>(
      apiPath(`/api/v1/orgs/${orgId}/users/${userId}`),
      { signal }
    )
  );

  const responses = await Promise.all(requests);

  return responses.map((res) => res.data);
};

const postUsers = async (params: {
  orgId: string;
  users: { userId: string; orgRole: string }[];
}): Promise<IMemberItem[]> => {
  const { data } = await axiosInstance.post<IMemberItem[]>(
    apiPath(`/api/v1/orgs/${params.orgId}/users`),
    params.users
  );

  return data;
};

const patchMemberById = async (params: {
  orgId: string;
  users: { userId: string; orgRole: string }[];
}): Promise<IMemberItem[]> => {
  const requests = params.users.map((item) =>
    axiosInstance.patch<IMemberItem>(
      apiPath(`/api/v1/orgs/${params.orgId}/users/${item.userId}`),
      { orgRole: item.orgRole }
    )
  );

  const responses = await Promise.all(requests);

  return responses.map((res) => res.data);
};

const deleteMember = async (params: {
  orgId: string;
  userId: string;
}): Promise<void> => {
  await axiosInstance.delete(
    apiPath(`/api/v1/orgs/${params.orgId}/users/${params.userId}`)
  );
};

export const membersApi = {
  getAppUsers,
  getOrgUsersByOrgId,
  getEditMemberList,
  postUsers,
  patchMemberById,
  deleteMember,
};
