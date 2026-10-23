import type { FileHashWorkerMessage } from './fileHash.types';

interface IFileHashOptions {
  signal?: AbortSignal;
  onProgress?: (progress: number) => void;
}

export function computeFileHashHex(
  file: File,
  { signal, onProgress }: IFileHashOptions = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('File preparation cancelled', 'AbortError'));
      return;
    }

    const worker = new Worker(
      new URL('./fileHash.worker.ts', import.meta.url),
      {
        type: 'module',
      }
    );
    const cleanup = () => {
      signal?.removeEventListener('abort', onAbort);
      worker.terminate();
    };
    const fail = (error: Error) => {
      cleanup();
      reject(error);
    };
    const onAbort = () =>
      fail(new DOMException('File preparation cancelled', 'AbortError'));

    worker.onmessage = (event: MessageEvent<FileHashWorkerMessage>) => {
      const message = event.data;

      if (message.type === 'progress') {
        onProgress?.(
          message.totalBytes === 0
            ? 100
            : Math.floor((message.bytesProcessed / message.totalBytes) * 100)
        );
      } else if (message.type === 'done') {
        cleanup();
        resolve(message.hash);
      } else {
        fail(new Error(message.message));
      }
    };
    worker.onerror = (event) => {
      event.preventDefault();
      fail(new Error(event.message || 'File preparation worker failed.'));
    };
    worker.onmessageerror = () =>
      fail(new Error('File preparation worker returned an unreadable result.'));
    signal?.addEventListener('abort', onAbort, { once: true });

    try {
      worker.postMessage(file);
    } catch (error: unknown) {
      fail(
        error instanceof Error ? error : new Error('File preparation failed.')
      );
    }
  });
}
