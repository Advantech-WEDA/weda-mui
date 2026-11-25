import type { StackCommandResult } from '../domain/stackCommand';
import type { IStackCommandResultItem } from './stacks.api.types';

const asString = (value: unknown): string | null =>
  typeof value === 'string' && value ? value : null;

export const toStackCommandResult = (
  item: IStackCommandResultItem
): StackCommandResult => ({
  reqSeqId: item.reqSeqId,
  phase: item.data?.phase ?? null,
  status: item.data?.status ?? null,
  message: item.data?.message ?? null,
  errorMessage: asString(item.data?.error?.message),
  stackStatus: asString(item.data?.resultData?.status),
});
