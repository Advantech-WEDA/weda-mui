import { apiPath } from '@shared/api/apiPath';
import axiosInstance from '@shared/api/axiosInstance';
import { callApi } from '@shared/api/callApi';
import axios from 'axios';

import type {
  IOrganizationResult,
  IUserItem,
  IUserToOrgResponses,
} from './organizations.api.types';

const postOrganization = async (params: {
  name: string;
  parentOrgId: string;
  description?: string;
  admins: { userId: string }[];
}) =>
  callApi('Create organization', async () => {
    const payload = {
      name: params.name,
      parentOrgId: params.parentOrgId === '' ? null : params.parentOrgId,
      description: params.description ?? '',
      ...(params.admins && params.admins.length > 0
        ? { admins: params.admins }
        : {}),
    };

    const { data } = await axiosInstance.post(apiPath('/api/v1/orgs'), payload);

    return data;
  });

const getOrgByOrgId = (
  orgId: string,
  signal?: AbortSignal
): Promise<IOrganizationResult> => {
  if (!orgId) {
    return Promise.reject(
      new Error('[Get organization by id] orgId is required')
    );
  }

  return callApi('Get organization by id', async () => {
    const { data } = await axiosInstance.get<IOrganizationResult>(
      apiPath(`/api/v1/orgs/${orgId}`),
      { signal }
    );

    return data;
  });
};

const patchOrganizationByOrgId = async (params: {
  orgId: string;
  name: string;
  description?: string;
  admins?: { userId: string }[];
}): Promise<IOrganizationResult> => {
  if (!params.orgId) {
    throw new Error('[Update organization] orgId is required');
  }

  if (!params.name?.trim()) {
    throw new Error('[Update organization] name is required');
  }

  const payload = {
    name: params.name.trim(),
    description: params.description ?? '',
    ...(params.admins && params.admins.length > 0
      ? { admins: params.admins }
      : {}),
  };

  try {
    const { data } = await axiosInstance.patch<IOrganizationResult>(
      apiPath(`/api/v1/orgs/${params.orgId}`),
      payload
    );

    return data;
  } catch (error: unknown) {
    let errorMessage = '[Update organization] Fetch failed';

    if (axios.isAxiosError(error)) {
      const detail = (error.response?.data as { detail?: string })?.detail;

      if (error.response?.status === 400) {
        errorMessage =
          detail || 'Invalid input (name conflict or invalid data)';
      } else if (error.response?.status === 403) {
        errorMessage = 'No permission to update this organization';
      } else if (error.response?.status === 404) {
        errorMessage = 'Organization not found';
      } else {
        errorMessage = detail || errorMessage;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message || errorMessage;
    }

    console.error(errorMessage, error);
    throw new Error(errorMessage);
  }
};

const deleteOrganization = (orgId: string, orgName: string): Promise<void> =>
  callApi('Delete organization', async () => {
    await axiosInstance.delete(
      apiPath(`/api/v1/orgs/${orgId}?orgName=${encodeURIComponent(orgName)}`)
    );
  });

export const postUsersToOrgById = (params: {
  orgId: string;
  userData: IUserItem[];
}): Promise<IUserToOrgResponses> => {
  if (!params.orgId) {
    return Promise.reject(new Error('[Create users] orgId is required'));
  }

  return callApi('Create users', async () => {
    const payload = params.userData.map((user) => ({
      userId: user.userId,
      orgRole: user.orgRole,
    }));

    const { data } = await axiosInstance.post<IUserToOrgResponses>(
      apiPath(`/api/v1/orgs/${params.orgId}/users`),
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    return data;
  });
};

export const organizationsApi = {
  postOrganization,
  getOrgByOrgId,
  patchOrganizationByOrgId,
  deleteOrganization,
  postUsersToOrgById,
};
