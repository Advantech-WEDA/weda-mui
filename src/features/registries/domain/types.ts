export type RegistryType = 'DockerHub' | 'AzureACR' | 'Custom' | 'AwsECR';

export type TableHeaderSortKey = 'RegistryName' | 'createdAt';

export interface RegistryCredentials {
  registryType?: RegistryType;
  accessKey?: string;
  accessSecretKey?: string;
  region?: string;
  username?: string;
  accessToken?: string;
  userPassword?: string;
}

export interface RegistryForm {
  registryName: string;
  registryUrl: string;
  registryCredentials: RegistryCredentials;
}

export interface RegistrySubmitPayload {
  registryName: string;
  registryUrl: string;
  registryCredentials?: RegistryCredentials;
}

export type RegistryFormErrors = {
  registryName: string;
  registryUrl: string;
  registryType: string;
  region: string;
  accessKey: string;
  accessSecretKey: string;
  accessToken: string;
  userPassword: string;
  username: string;
};

export const REGISTRY_TYPE_LABEL: Record<RegistryType, string> = {
  DockerHub: 'Docker Hub',
  AwsECR: 'AWS ECR',
  AzureACR: 'Azure ACR',
  Custom: 'Custom',
};

export function getRegistryTypeLabel(type?: string | null): string {
  if (!type) return '-';
  return REGISTRY_TYPE_LABEL[type as RegistryType] ?? type;
}

export const registryOptions: { label: string; value: RegistryType }[] = (
  ['DockerHub', 'AwsECR', 'AzureACR', 'Custom'] as const
).map((value) => ({ label: REGISTRY_TYPE_LABEL[value], value }));
