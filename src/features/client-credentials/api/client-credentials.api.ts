import { apiPath } from '@shared/api/apiPath';
import axiosInstance from '@shared/api/axiosInstance';

import type { ClientCredentialForm } from '../domain/types';
import type {
  IClientCredentialResponse,
  IClientCredentialResult,
} from './client-credentials.api.types';

const getClientCredentials = async (
  signal?: AbortSignal
): Promise<IClientCredentialResult[]> => {
  const { data } = await axiosInstance.get<IClientCredentialResult[]>(
    apiPath('/api/v1/oauth2/client-credentials'),
    { signal }
  );

  return data;
};

const postClientCredential = async (
  clientCredential: ClientCredentialForm
): Promise<IClientCredentialResponse> => {
  const { data } = await axiosInstance.post<IClientCredentialResponse>(
    apiPath('/api/v1/oauth2/client-credentials'),
    clientCredential
  );

  return data;
};

const deleteClientCredential = async (
  clientCredentialId: string
): Promise<void> => {
  await axiosInstance.delete<void>(
    apiPath(`/api/v1/oauth2/client-credentials/${clientCredentialId}`)
  );
};

export const clientCredentialsApi = {
  getClientCredentials,
  postClientCredential,
  deleteClientCredential,
};
