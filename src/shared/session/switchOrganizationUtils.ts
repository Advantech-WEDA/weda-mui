import { getAppBasePath } from '@shared/lib/appRoute';

import type { IUserOrgItem } from './useOrgContentStore';

export const ROOT_BLOCKED_PATHS = new Set([
  '/add-member',
  '/edit-member',
  '/batch-edit',
]);

export const ROOT_FALLBACK_PATH = '/members';

export function flattenTree(
  nodes: IUserOrgItem[] | null,
  parent?: IUserOrgItem
): (IUserOrgItem & { parentName?: string })[] {
  let result: (IUserOrgItem & { parentName?: string })[] = [];

  if (!nodes) return result;

  for (const node of nodes) {
    result.push({ ...node, parentName: parent?.name ?? undefined });

    if (node.children) {
      result = result.concat(flattenTree(node.children, node));
    }
  }

  return result;
}

export function isRootOrg(node: IUserOrgItem): boolean {
  return node.parentOrgId == null;
}

export function getSubPath(pathname: string, tenant: string): string {
  const base = getAppBasePath(tenant);
  return pathname.startsWith(base) ? pathname.slice(base.length) : '';
}

export function resolveNextPath(params: {
  tenant: string;
  currentPathname: string;
  targetNode: IUserOrgItem;
}): string {
  const { tenant, currentPathname, targetNode } = params;

  const subPath = getSubPath(currentPathname, tenant);
  let nextSubPath = subPath || '/';

  if (isRootOrg(targetNode) && ROOT_BLOCKED_PATHS.has(subPath)) {
    nextSubPath = ROOT_FALLBACK_PATH;
  }

  return `${getAppBasePath(tenant)}${nextSubPath === '/' ? '' : nextSubPath}`;
}
