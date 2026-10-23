import { apiPath } from '@shared/api/apiPath';
import axiosInstance from '@shared/api/axiosInstance';
import { callApi } from '@shared/api/callApi';
import axios from 'axios';

import type { RegistrySubmitPayload } from '../domain/types';
import type {
  IEncryptedContainerRegistry,
  IRegistriesList,
  IRegistryItem,
} from './registries.api.types';

const getRegistries = async (
  params?: {
    orgId: string;
    skipCount?: number;
    maxResultCount?: number;
    sorting?: string;
  },
  signal?: AbortSignal
): Promise<IRegistriesList> =>
  callApi('Get Registries Data', async () => {
    const { data } = await axiosInstance.get<IRegistriesList>(
      apiPath(`/api/v1/orgs/${params?.orgId}/containers/registries`),
      {
        params: {
          skipCount: params?.skipCount,
          maxResultCount: params?.maxResultCount,
          sorting: params?.sorting,
        },
        signal,
      }
    );

    return data;
  });

const REGISTRY_HOST_EXISTS_TITLE = 'WEDA.ContainerMgmt.RegistryHostExists';

const rethrowRegistryHostExists = (error: unknown): never => {
  if (
    axios.isAxiosError(error) &&
    error.response?.status === 409 &&
    (error.response.data as { title?: string } | undefined)?.title ===
      REGISTRY_HOST_EXISTS_TITLE
  ) {
    throw new Error(
      'A registry with the same host already exists in this organization.'
    );
  }

  throw error;
};

const postRegistry = async (params: {
  orgId: string;
  registryData: RegistrySubmitPayload;
}): Promise<IEncryptedContainerRegistry> =>
  callApi('Create registry', async () => {
    const { data } = await axiosInstance
      .post(apiPath(`/api/v1/orgs/${params.orgId}/containers/registries`), {
        ...params.registryData,
      })
      .catch(rethrowRegistryHostExists);

    return data;
  });

const getRegistryById = async (
  params: {
    orgId: string;
    registryId: string;
  },
  signal?: AbortSignal
): Promise<IRegistryItem> =>
  callApi('Get registry by id', async () => {
    const { data } = await axiosInstance.get<IRegistryItem>(
      apiPath(
        `/api/v1/orgs/${params.orgId}/containers/registries/${params.registryId}`
      ),
      { signal }
    );

    return data;
  });

const putRegistryById = async (params: {
  orgId: string;
  registryId: string;
  registryData: RegistrySubmitPayload;
}): Promise<IEncryptedContainerRegistry> =>
  callApi('Update registry', async () => {
    const { data } = await axiosInstance
      .put(
        apiPath(
          `/api/v1/orgs/${params.orgId}/containers/registries/${params.registryId}`
        ),
        { ...params.registryData }
      )
      .catch(rethrowRegistryHostExists);

    return data;
  });

const deleteRegistry = async (params: {
  orgId: string;
  registryId: string;
}): Promise<void> =>
  callApi('Delete registry', async () => {
    await axiosInstance.delete(
      apiPath(
        `/api/v1/orgs/${params.orgId}/containers/registries/${params.registryId}`
      )
    );
  });

export const registriesApi = {
  getRegistries,
  postRegistry,
  getRegistryById,
  putRegistryById,
  deleteRegistry,
};
