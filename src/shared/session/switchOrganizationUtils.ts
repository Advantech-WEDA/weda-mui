import type { IUserOrgItem } from './useOrgContentStore';

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
