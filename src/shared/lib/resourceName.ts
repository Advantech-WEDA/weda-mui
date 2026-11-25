export const getResourceNameErrorMessage = (
  value: string,
  label: string,
  maxLength: number
): string => {
  if (!value.trim()) {
    return `${label} is required`;
  }

  if (!/^[a-z0-9-]+$/.test(value)) {
    return `${label} can only contain lowercase letters (a-z), numbers (0-9), and hyphens (-)`;
  }

  if (value.startsWith('-') || value.endsWith('-')) {
    return `${label} must start and end with a letter or number`;
  }

  if (value.includes('--')) {
    return `${label} cannot contain consecutive hyphens (-)`;
  }

  if (value.length > maxLength) {
    return `${label} must not exceed ${maxLength} characters`;
  }

  return '';
};
