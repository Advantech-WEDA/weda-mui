import type { ScopeItem } from './types';

export const hasSelectedScope = (scopes: ScopeItem[]): boolean => {
  return scopes.some((item) => item.read || item.write);
};

export const buildScopesPayload = (scopes: ScopeItem[]): string[] => {
  const result: string[] = [];

  scopes.forEach((item) => {
    if (item.read) {
      result.push(`${item.id}.read`);
    }
    if (item.write) {
      result.push(`${item.id}.write`);
    }
  });

  return result;
};
