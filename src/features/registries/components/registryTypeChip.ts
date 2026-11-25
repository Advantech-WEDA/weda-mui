import type { Tone } from '@shared/ui';

import { REGISTRY_TYPE_LABEL, type RegistryType } from '../domain/types';

export const REGISTRY_TYPE_CHIP: Record<
  RegistryType,
  { label: string; tone: Tone }
> = {
  DockerHub: { label: REGISTRY_TYPE_LABEL.DockerHub, tone: 'primary' },
  Custom: { label: REGISTRY_TYPE_LABEL.Custom, tone: 'primary' },
  AzureACR: { label: REGISTRY_TYPE_LABEL.AzureACR, tone: 'secondary' },
  AwsECR: { label: REGISTRY_TYPE_LABEL.AwsECR, tone: 'secondary' },
};
