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

export const registryOptions: { label: string; value: RegistryType }[] = [
  {
    label: 'Docker Hub',
    value: 'DockerHub',
  },
  {
    label: 'AWS ECR',
    value: 'AwsECR',
  },
  {
    label: 'Azure ACR',
    value: 'AzureACR',
  },
  {
    label: 'Custom',
    value: 'Custom',
  },
];
