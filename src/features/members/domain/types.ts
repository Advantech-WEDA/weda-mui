export type RoleType = 'admin' | 'operator' | 'viewer';

export type TableHeaderSortKey = 'name' | 'orgRole';

export type MemberItem = {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: RoleType;
  orgId: string;
};
