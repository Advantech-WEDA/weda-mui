import type { RoleType } from './types';

export const mapOrgRoleToRoleType = (orgRole?: string): RoleType => {
  const value = (orgRole || '').toLowerCase();

  if (value === 'admin') return 'admin';
  if (value === 'operator') return 'operator';
  if (value === 'viewer') return 'viewer';
  return 'admin';
};

export const mapEditMemberOrgRoleToRoleType = (orgRole?: string): RoleType => {
  const value = (orgRole || '').toLowerCase();

  if (value === 'admin') return 'admin';
  if (value === 'operator') return 'operator';
  return 'viewer';
};

export const toDisplayName = (name?: string): string => {
  return (name || '').trim();
};
