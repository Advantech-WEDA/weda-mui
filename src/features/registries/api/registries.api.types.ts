import type { RegistryType } from '../domain/types';

export interface EncryptedIRegistryCredentials {
  registryType?: RegistryType;
  encryptedAccessKey?: string;
  encryptedAccessSecretKey?: string;
  region?: string;
  username?: string;
  encryptedAccessToken?: string;
  encryptedUserPassword?: string;
}

export interface IEncryptedContainerRegistry {
  registryName: string;
  registryUrl: string;
  createdAt: string;
  registryId: string;
  orgId: string;
  registryCredentials: EncryptedIRegistryCredentials;
}

export interface IRegistryItem {
  registryId: string;
  registryName: string;
  registryUrl: string;
  createdAt?: string;
  orgId: string;
  registryEncryptedCredentials: EncryptedIRegistryCredentials;
}

export interface IRegistriesList {
  totalCount: number;
  items: IRegistryItem[];
}
