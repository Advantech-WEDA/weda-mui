export interface IFingerprintedFile {
  name: string;
  size: number;
  lastModified: number;
}

export interface IUploadFileFingerprint {
  fileName: string;
  fileSize: number;
  lastModified: number;
}

export function fingerprintOfFile(
  file: IFingerprintedFile
): IUploadFileFingerprint {
  return {
    fileName: file.name,
    fileSize: file.size,
    lastModified: file.lastModified,
  };
}

export function isSameUploadFile(
  saved: IUploadFileFingerprint | null,
  file: IFingerprintedFile
): boolean {
  if (!saved) return true;

  return (
    saved.fileName === file.name &&
    saved.fileSize === file.size &&
    saved.lastModified === file.lastModified
  );
}
