import { useCallback, useEffect, useRef, useState } from 'react';

import { computeFileHashHex } from '@/features/ai-models/api/fileHash';
import type { FileHashState } from '@/features/ai-models/domain/fileHash';

interface IHashJob {
  file: File;
  controller: AbortController;
  hash?: string;
}

export function useFileHash() {
  const [fileHash, setFileHash] = useState<FileHashState>({ status: 'idle' });
  const jobRef = useRef<IHashJob | null>(null);

  useEffect(() => () => jobRef.current?.controller.abort(), []);

  const startHash = useCallback((file: File | null) => {
    jobRef.current?.controller.abort();
    jobRef.current = null;

    if (!file) {
      setFileHash({ status: 'idle' });
      return;
    }

    const job: IHashJob = { file, controller: new AbortController() };
    jobRef.current = job;
    setFileHash({ status: 'hashing', progress: 0 });

    void computeFileHashHex(file, {
      signal: job.controller.signal,
      onProgress: (progress) => {
        if (jobRef.current === job && !job.controller.signal.aborted)
          setFileHash({ status: 'hashing', progress });
      },
    })
      .then((hash) => {
        if (jobRef.current !== job || job.controller.signal.aborted) return;

        job.hash = hash;
        setFileHash({ status: 'done', hash });
      })
      .catch(() => {
        if (jobRef.current !== job || job.controller.signal.aborted) return;

        setFileHash({
          status: 'error',
          message:
            'Could not prepare this file for upload. Retry or select it again.',
        });
      });
  }, []);

  const cancelHash = () => {
    jobRef.current?.controller.abort();
    setFileHash({ status: 'cancelled' });
  };
  const retryHash = () => {
    if (jobRef.current) startHash(jobRef.current.file);
  };
  const getFileHash = (file: File): string => {
    const job = jobRef.current;

    if (job?.file !== file || !job.hash || job.controller.signal.aborted) {
      throw new Error('Prepare the selected file before submitting.');
    }

    return job.hash;
  };

  return { fileHash, startHash, cancelHash, retryHash, getFileHash };
}
