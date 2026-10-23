import type { RoleType } from '@features/members';

export interface IOrganizationAdmin {
  userId: string;

  orgRole?: RoleType;
  name: string;
  email: string;
  role: string;
  orgId: string;
}

export interface IOrganizationResult {
  name: string;
  orgId: string;
  parentOrgId?: string | null;
  description?: string | null;
  admins: IOrganizationAdmin[];
  createdAt?: string;
  updatedAt?: string | null;
  children?: IOrganizationResult[];
}

export interface IUserItem {
  userId: string;
  orgRole: string;
}

export interface IUserToOrgResponses {
  id: string;
  orgId: string;
  userId: string;
  orgRole: string;
  name: string;
}
