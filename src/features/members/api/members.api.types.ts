import type { RoleType } from '../domain/types';

export interface IAppUserListParameters {
  skipCount?: number;

  maxResultCount?: number;

  sorting?: string;
  filter?: string;
}
export interface IMemberListParameters {
  orgId: string;
  skipCount?: number;
  maxResultCount?: number;
  name?: string;
  sorting?: string;
  orgRole?: RoleType;
}

export type UserOrgRole = 'super_admin' | 'admin' | 'operator_' | 'viewer';

export interface IAppUserItem {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  email: string | null;

  role: string | null;
  account: string | null;
}

export interface IMemberItem {
  userId: string;
  orgRole?: RoleType;
  name: string;
  email: string;
  role: string;
  orgId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IMemberDetailItem {
  userId: string;
  orgRole?: RoleType;
  name: string;
  email: string;
  role: string;
  orgId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IGetEditMemberListParams {
  orgId: string;
  userIds: string[];
}

export interface IAppUserList {
  totalCount: number;
  items: IAppUserItem[] | null;
}
export interface IMemberList {
  skipCount: number;
  maxResultCount: number;
  totalPages: number;
  totalCount: number;
  items: IMemberItem[];
}
