export interface IClientCredentialResult {
  clientCredentialId: string;
  name: string;
  clientId: string;
  createdAt?: string;
  expiredAt?: string;
  scopes?: string[];
  deviceIds?: string[];
}

export interface IClientCredentialResponse {
  clientCredentialId: string;
  clientId: string;
  clientSecret: string;
  createdAt: string;
  expiredAt: string | null;
  name: string;
}
