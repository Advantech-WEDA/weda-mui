export type FileHashState =
  | { status: 'idle' }
  | { status: 'hashing'; progress: number }
  | { status: 'done'; hash: string }
  | { status: 'error'; message: string }
  | { status: 'cancelled' };
