import { extractErrorMessage } from '@shared/api/extractErrorMessage';
import axios from 'axios';
import { create } from 'zustand';

import { clientCredentialsApi } from '../api/client-credentials.api';
import type {
  IClientCredentialResponse,
  IClientCredentialResult,
} from '../api/client-credentials.api.types';
import type { ClientCredentialForm } from '../domain/types';

interface IClientCredentialState {
  clientCredentialList: IClientCredentialResult[] | null;
  GET_CLIENT_CREDENTIALS: (
    signal?: AbortSignal
  ) => Promise<IClientCredentialResult[]>;
  POST_CLIENT_CREDENTIALS: (
    clientCredential: ClientCredentialForm
  ) => Promise<IClientCredentialResponse>;
  DELETE_CLIENT_CREDENTIALS: (clientCredentialId: string) => Promise<void>;
}

export const useClientCredentialStore = create<IClientCredentialState>()(
  (set) => ({
    clientCredentialList: null,
    async GET_CLIENT_CREDENTIALS(
      signal?: AbortSignal
    ): Promise<IClientCredentialResult[]> {
      try {
        const data = await clientCredentialsApi.getClientCredentials(signal);

        set({ clientCredentialList: data });

        return data;
      } catch (error) {
        if (axios.isCancel(error)) {
          throw error;
        }

        set({ clientCredentialList: null });

        const message = extractErrorMessage(
          error,
          'Failed to fetch client credentials'
        );

        console.error('[Get Client Credentials] Fetch failed:', error);

        return Promise.reject(new Error(message));
      }
    },
    async POST_CLIENT_CREDENTIALS(
      clientCredential: ClientCredentialForm
    ): Promise<IClientCredentialResponse> {
      try {
        return await clientCredentialsApi.postClientCredential(
          clientCredential
        );
      } catch (error) {
        const message = extractErrorMessage(
          error,
          'Failed to create client credential'
        );

        console.error('[Create Client Credentials] Fetch failed:', error);

        return Promise.reject(new Error(message));
      }
    },
    async DELETE_CLIENT_CREDENTIALS(clientCredentialId: string): Promise<void> {
      try {
        await clientCredentialsApi.deleteClientCredential(clientCredentialId);

        set((state) => ({
          clientCredentialList:
            state.clientCredentialList?.filter(
              (item) => item.clientCredentialId !== clientCredentialId
            ) || [],
        }));
      } catch (error) {
        const message = extractErrorMessage(
          error,
          'Failed to delete client credential'
        );

        console.error('[Delete Client Credentials] Fetch failed:', error);

        return Promise.reject(new Error(message));
      }
    },
  })
);
