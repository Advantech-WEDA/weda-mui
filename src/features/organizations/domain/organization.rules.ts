import type {
  OrganizationNode,
  OrganizationRow,
  ParentOrgOption,
} from './types';

export interface OrgHierarchyNode {
  orgId: string;
  name?: string | null;
  children?: OrgHierarchyNode[] | null;
}

export function flattenParentOrgOptions(
  nodes: OrgHierarchyNode[] = []
): ParentOrgOption[] {
  if (!Array.isArray(nodes)) return [];

  return nodes.flatMap((node) => [
    { orgId: node.orgId, label: node.name ?? '' },
    ...flattenParentOrgOptions(node.children || []),
  ]);
}

export function flattenParentOrgOptionsExcluding(
  nodes: OrgHierarchyNode[] = [],
  prefix = '',
  excludeOrgId?: string
): ParentOrgOption[] {
  return nodes.flatMap((node) => {
    const label = prefix ? `${prefix} / ${node.name}` : (node.name ?? '');
    const children = flattenParentOrgOptionsExcluding(
      node.children || [],
      label,
      excludeOrgId
    );

    if (node.orgId === excludeOrgId) return children;

    return [{ orgId: node.orgId, label }, ...children];
  });
}

export function resolveEffectiveParentOrgId(input: {
  parentOrgId: string;
  isSingleTenant: boolean;
  currentOrgId: string;
}): string {
  if (input.parentOrgId) return input.parentOrgId;

  return input.isSingleTenant ? '' : input.currentOrgId;
}

export function canSubmitOrganizationForm(input: {
  hasNoOrgData: boolean;
  currentOrgId: string;
  canCreateRootOrg: boolean;
  isOrgAdmin: boolean;
}): boolean {
  return input.hasNoOrgData && !input.currentOrgId
    ? input.canCreateRootOrg
    : input.isOrgAdmin;
}

export function isOrganizationDeletable(input: {
  canDeleteOrg: boolean;
  hasChildren: boolean;
  hasOtherAdmins: boolean;
  isRootOrg: boolean;
}): boolean {
  return (
    input.canDeleteOrg &&
    !input.hasChildren &&
    !input.hasOtherAdmins &&
    !input.isRootOrg
  );
}

export function buildOrganizationRows(
  nodes: OrganizationNode[],
  context: {
    currentOrgId: string;
    currentUserId?: string;
    canEditOrg: boolean;
    canDeleteOrg: boolean;
    isRootOrg: (orgId: string) => boolean;
  }
): OrganizationRow[] {
  return nodes.map((node) => {
    const admins = node.admins ?? [];

    return {
      ...node,
      isCurrent: node.orgId === context.currentOrgId,
      disableEdit: !context.canEditOrg,
      disableDelete: !isOrganizationDeletable({
        canDeleteOrg: context.canDeleteOrg,
        hasChildren: Boolean(node.children?.length),
        hasOtherAdmins: admins.some(
          (admin) => admin.userId !== context.currentUserId
        ),
        isRootOrg: context.isRootOrg(node.orgId),
      }),
      children: buildOrganizationRows(node.children ?? [], context),
    };
  });
}
