import type { FileHashWorkerMessage } from './fileHash.types';
import { hashFileInChunks } from './hashFileInChunks';

function report(message: FileHashWorkerMessage) {
  self.postMessage(message);
}

self.onmessage = async (event: MessageEvent<File>) => {
  let lastProgressAt = 0;

  try {
    const hash = await hashFileInChunks(
      event.data,
      (bytesProcessed, totalBytes) => {
        const now = performance.now();

        if (now - lastProgressAt >= 100 || bytesProcessed === totalBytes) {
          report({ type: 'progress', bytesProcessed, totalBytes });
          lastProgressAt = now;
        }
      }
    );

    report({ type: 'done', hash });
  } catch (error: unknown) {
    report({
      type: 'error',
      message:
        error instanceof Error ? error.message : 'File preparation failed.',
    });
  }
};
