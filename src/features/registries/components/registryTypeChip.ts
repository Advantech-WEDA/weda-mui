import type { Tone } from '@shared/ui';

import type { RegistryType } from '../domain/types';

export const REGISTRY_TYPE_CHIP: Record<
  RegistryType,
  { label: string; tone: Tone }
> = {
  DockerHub: { label: 'DockerHub', tone: 'primary' },
  Custom: { label: 'Custom', tone: 'primary' },
  AzureACR: { label: 'Azure ACR', tone: 'secondary' },
  AwsECR: { label: 'AWS ECR', tone: 'secondary' },
};
