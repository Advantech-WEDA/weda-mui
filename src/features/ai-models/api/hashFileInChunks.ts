import { createSHA256 } from 'hash-wasm';

const HASH_CHUNK_BYTES = 8 * 1024 * 1024;

export async function hashFileInChunks(
  file: Blob,
  onProgress?: (bytesProcessed: number, totalBytes: number) => void
): Promise<string> {
  const hasher = await createSHA256();

  for (let offset = 0; offset < file.size; offset += HASH_CHUNK_BYTES) {
    const end = Math.min(offset + HASH_CHUNK_BYTES, file.size);
    const buffer = await file.slice(offset, end).arrayBuffer();

    if (buffer.byteLength !== end - offset) {
      throw new Error('The file changed or could not be read completely.');
    }

    hasher.update(new Uint8Array(buffer));
    onProgress?.(end, file.size);
  }

  return hasher.digest('hex');
}
