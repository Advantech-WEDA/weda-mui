export type FileHashWorkerMessage =
  | { type: 'progress'; bytesProcessed: number; totalBytes: number }
  | { type: 'done'; hash: string }
  | { type: 'error'; message: string };
