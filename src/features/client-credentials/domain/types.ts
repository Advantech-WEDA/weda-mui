export interface ScopeItem {
  id: string;
  name: string;
  description: string;
  read: boolean;
  write: boolean;
  canRead: boolean;
  canWrite: boolean;
}

export const INITIAL_SCOPES: ScopeItem[] = [
  {
    id: 'object',
    name: 'Object',
    description: 'Allow uploading and managing files or images.',
    read: false,
    write: true,
    canRead: false,
    canWrite: true,
  },
  {
    id: 'telemetry',
    name: 'Telemetry',
    description: 'Allow uploading data points to generate telemetry charts.',
    read: false,
    write: true,
    canRead: false,
    canWrite: true,
  },
  {
    id: 'dataobject',
    name: 'Dataobject',
    description:
      'Allow external tools to query data points for dashboards and alerts.',
    read: true,
    write: false,
    canRead: true,
    canWrite: false,
  },
];

export type ClientCredentialForm = {
  name: string;
  scopes: string[];
};
