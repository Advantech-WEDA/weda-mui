import { getResourceNameErrorMessage } from '@shared/lib/resourceName';

export const STACK_NAME_MAX_LENGTH = 63;

export const getStackNameErrorMessage = (value: string): string =>
  getResourceNameErrorMessage(value, 'Stack name', STACK_NAME_MAX_LENGTH);
