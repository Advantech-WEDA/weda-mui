import type { InformationRows, InformationSectionData } from './types';

const UPPERCASE_WORDS = ['cpu', 'ram'];

const LABEL_OVERRIDES: Record<string, string> = {
  numofcores: 'Number of Cores',
};

export const formatLabel = (value: string) => {
  const normalizedKey = value.replace(/[_\s]/g, '').toLowerCase();

  if (LABEL_OVERRIDES[normalizedKey]) {
    return LABEL_OVERRIDES[normalizedKey];
  }

  const words = value
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .filter(Boolean);

  return words
    .map((word) =>
      UPPERCASE_WORDS.includes(word.toLowerCase())
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ');
};

export const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
};

const isPrimitive = (value: unknown) => {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
};

const toRows = (value: Record<string, unknown>): InformationRows[] => {
  return Object.entries(value).map(([key, item]) => ({
    label: formatLabel(key),
    value: formatValue(item),
  }));
};

export const normalizeCapabilities = (
  reported: Record<string, unknown>
): InformationSectionData[] => {
  const sections: InformationSectionData[] = [];

  Object.entries(reported).forEach(([key, value]) => {
    if (isPrimitive(value)) {
      return;
    }

    if (Array.isArray(value)) {
      if (key === 'sensors' || key === 'containers') {
        return;
      }

      const firstItem = value[0];

      if (
        firstItem &&
        typeof firstItem === 'object' &&
        !Array.isArray(firstItem)
      ) {
        const columns = Array.from(
          new Set(
            value.flatMap((item) =>
              item && typeof item === 'object' && !Array.isArray(item)
                ? Object.keys(item)
                : []
            )
          )
        );

        sections.push({
          key,
          title: `${formatLabel(key)}`,
          type: 'table',
          tableColumns: columns,
          tableRows: value as Record<string, unknown>[],
        });

        return;
      }

      sections.push({
        key,
        title: `${formatLabel(key)}`,
        type: 'json',
        raw: value,
      });

      return;
    }

    if (value && typeof value === 'object') {
      sections.push({
        key,
        title: formatLabel(key),
        type: 'rows',
        rows: toRows(value as Record<string, unknown>),
      });

      return;
    }

    sections.push({
      key,
      title: formatLabel(key),
      type: 'json',
      raw: value,
    });
  });

  return sections;
};
