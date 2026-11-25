export interface StackCommandResult {
  reqSeqId: string | null;
  phase: string | null;

  status: number | null;
  message: string | null;

  errorMessage: string | null;

  stackStatus: string | null;
}

export type StackCommandOutcome =
  | { kind: 'pending' }
  | { kind: 'succeeded'; stackStatus: string | null }
  | { kind: 'failed'; message: string }
  | { kind: 'timedOut' };

export const STACK_COMMAND_POLL_INTERVAL_MS = 1000;

export const STACK_COMMAND_TIMEOUT_MS = 30_000;

export const STACK_COMMAND_FAILED_MESSAGE = 'Stack command failed';

const FINAL_PHASE = 'result';

export const decideStackCommandOutcome = (
  results: StackCommandResult[],
  reqSeqId: string,
  elapsedMs: number
): StackCommandOutcome => {
  const result = results.find(
    (item) =>
      item.reqSeqId === reqSeqId && item.phase?.toLowerCase() === FINAL_PHASE
  );

  if (result) {
    if (result.status === 0) {
      return { kind: 'succeeded', stackStatus: result.stackStatus };
    }

    return {
      kind: 'failed',
      message:
        result.errorMessage || result.message || STACK_COMMAND_FAILED_MESSAGE,
    };
  }

  if (elapsedMs >= STACK_COMMAND_TIMEOUT_MS) {
    return { kind: 'timedOut' };
  }

  return { kind: 'pending' };
};
