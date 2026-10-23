import type { RoleType } from '@features/members';

export interface OrganizationAdmin {
  userId: string;
  name: string;
  email: string;
  orgRole?: RoleType;
}

export interface OrganizationNode {
  orgId: string;
  name: string;
  description?: string | null;

  myOrgRole?: RoleType;
  admins: OrganizationAdmin[];
  children: OrganizationNode[];
}

export interface OrganizationRow extends OrganizationNode {
  isCurrent: boolean;
  disableEdit: boolean;
  disableDelete: boolean;
  children: OrganizationRow[];
}

export interface ParentOrgOption {
  orgId: string;
  label: string;
}

export interface OrgAdminOption {
  id: string;
  name: string;
  email?: string;
}
