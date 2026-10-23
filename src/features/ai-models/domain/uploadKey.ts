export function getUploadKey(modelId: string, edition: string): string {
  return `${modelId}::${edition}`;
}

const FINGERPRINT_KEY_PREFIX = 'ai-model-upload-fingerprint';

export function getUploadFingerprintKey(
  modelId: string,
  edition: string,
  uploadId: string
): string {
  return `${FINGERPRINT_KEY_PREFIX}::${getUploadKey(modelId, edition)}::${uploadId}`;
}
