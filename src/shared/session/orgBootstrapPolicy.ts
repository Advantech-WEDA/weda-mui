export type OrgBootstrapAction =
  | 'none'
  | 'notify-no-organization'
  | 'notify-no-organization-and-redirect';

export interface OrgBootstrapPolicyInput {
  orgList: { items?: unknown[] | null } | null;

  currentPath: string;

  organizationsPath: string;
}

function isUnderOrganizations(
  currentPath: string,
  organizationsPath: string
): boolean {
  return (
    currentPath === organizationsPath ||
    currentPath.startsWith(`${organizationsPath}/`)
  );
}

export function decideOrgBootstrapAction({
  orgList,
  currentPath,
  organizationsPath,
}: OrgBootstrapPolicyInput): OrgBootstrapAction {
  if (!orgList) {
    return 'none';
  }

  if (orgList.items?.length) {
    return 'none';
  }

  if (isUnderOrganizations(currentPath, organizationsPath)) {
    return 'notify-no-organization';
  }

  return 'notify-no-organization-and-redirect';
}
