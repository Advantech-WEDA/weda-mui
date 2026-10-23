const NAME_PATTERN = /^[A-Za-z0-9_-]+$/;

const RESERVED_SUFFIXES = ['.lock', '.tmp', '.staging'];

export const MODEL_NAME_MAX_LENGTH = 255;
export const EDITION_NAME_MAX_LENGTH = 255;

const hasReservedSuffix = (value: string): boolean =>
  RESERVED_SUFFIXES.some((suffix) => value.toLowerCase().endsWith(suffix));

const validateName = (
  value: string,
  label: string,
  maxLength: number
): string | null => {
  if (!value) return `${label} is required`;
  if (value.length > maxLength)
    return `${label} must not exceed ${maxLength} characters`;
  if (!NAME_PATTERN.test(value))
    return `${label} may contain only letters, digits, hyphen (-), and underscore (_)`;
  if (hasReservedSuffix(value))
    return `${label} must not end with .lock, .tmp, or .staging`;

  return null;
};

export const validateModelName = (value: string): string | null =>
  validateName(value.trim(), 'AI model name', MODEL_NAME_MAX_LENGTH);

export const validateEditionName = (value: string): string | null =>
  validateName(value.trim(), 'Edition name', EDITION_NAME_MAX_LENGTH);

export const MAX_FILE_SIZE_BYTES = 53_687_091_200; // 50 GiB

export const validateFileSize = (file: Pick<File, 'size'>): string | null => {
  if (file.size > MAX_FILE_SIZE_BYTES)
    return 'File size must not exceed 50 GiB';

  return null;
};
