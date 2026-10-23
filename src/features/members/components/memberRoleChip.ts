import type { Tone, ToneAppearance } from '@shared/ui';

export interface MemberRoleChip {
  label: string;
  tone: Tone;
  appearance: ToneAppearance;
}

const MEMBER_ROLE_CHIPS: Record<string, MemberRoleChip> = {
  TenantAdmin: { label: 'Tenant Admin', tone: 'primary', appearance: 'plain' },
  TenantUser: { label: 'Tenant User', tone: 'secondary', appearance: 'plain' },
  admin: { label: 'Admin', tone: 'primary', appearance: 'plain' },
  operator: { label: 'Operator', tone: 'secondary', appearance: 'plain' },
  viewer: { label: 'Viewer', tone: 'warning', appearance: 'plain' },
};

export function memberRoleChipProps(orgRole?: string): Partial<MemberRoleChip> {
  return MEMBER_ROLE_CHIPS[orgRole ?? ''] ?? {};
}
