import {
  fingerprintOfFile,
  type IFingerprintedFile,
  type IUploadFileFingerprint,
} from '@/features/ai-models/domain/uploadFileFingerprint';
import { getUploadFingerprintKey } from '@/features/ai-models/domain/uploadKey';

export function saveUploadFileFingerprint(
  modelId: string,
  edition: string,
  uploadId: string,
  file: IFingerprintedFile
): void {
  try {
    localStorage.setItem(
      getUploadFingerprintKey(modelId, edition, uploadId),
      JSON.stringify(fingerprintOfFile(file))
    );
  } catch {
    return;
  }
}

export function readUploadFileFingerprint(
  modelId: string,
  edition: string,
  uploadId: string
): IUploadFileFingerprint | null {
  try {
    const raw = localStorage.getItem(
      getUploadFingerprintKey(modelId, edition, uploadId)
    );

    if (!raw) return null;

    return JSON.parse(raw) as IUploadFileFingerprint;
  } catch {
    return null;
  }
}

export function clearUploadFileFingerprint(
  modelId: string,
  edition: string,
  uploadId: string
): void {
  try {
    localStorage.removeItem(
      getUploadFingerprintKey(modelId, edition, uploadId)
    );
  } catch {
    return;
  }
}
