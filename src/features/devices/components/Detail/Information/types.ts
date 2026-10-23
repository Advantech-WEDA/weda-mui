import type { ReactNode } from 'react';

export type InformationSectionType = 'rows' | 'table' | 'json';

export interface InformationRows {
  label: string;
  value: ReactNode;
}

export interface InformationSectionData {
  key: string;
  title: string;
  type: InformationSectionType;
  rows?: InformationRows[];
  tableColumns?: string[];
  tableRows?: Record<string, unknown>[];
  raw?: unknown;
}
