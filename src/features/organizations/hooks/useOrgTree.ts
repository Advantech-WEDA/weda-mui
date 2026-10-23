import type { RoleType } from '@features/members';
import { useIAmStore } from '@shared/session/useIAmStore';
import {
  type IUserOrgItem,
  useOrgContentStore,
} from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { OrganizationAdmin, OrganizationNode } from '../domain/types';

const ORG_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toRoleType(orgRole: string | null | undefined): RoleType | undefined {
  if (orgRole === 'admin' || orgRole === 'operator' || orgRole === 'viewer') {
    return orgRole;
  }

  return undefined;
}

function mapUserOrgItems(items: IUserOrgItem[]): OrganizationNode[] {
  return items.map((item) => {
    const admins: OrganizationAdmin[] = (item.admins ?? []).map((admin) => ({
      userId: admin.userId,
      name: admin.name ?? '',
      email: admin.email ?? '',
      orgRole: toRoleType(admin.orgRole),
    }));

    return {
      orgId: item.orgId,
      name: item.name ?? '',
      description: item.description,
      admins: admins.sort((a, b) =>
        (a.name || '').localeCompare(b.name || '', 'en', {
          sensitivity: 'base',
        })
      ),
      myOrgRole: toRoleType(item.orgRole),
      children: mapUserOrgItems(item.children ?? []),
    };
  });
}

function flattenTree(nodes: OrganizationNode[] = []): OrganizationNode[] {
  return nodes.flatMap((node) => [
    { ...node, children: [] },
    ...flattenTree(node.children ?? []),
  ]);
}

export function useOrgTree(searchWord: string) {
  const { userIAmUserProfile } = useIAmStore();
  const GET_ALL_USER_ORGS_BY_USER_ID = useOrgContentStore(
    (s) => s.GET_ALL_USER_ORGS_BY_USER_ID
  );
  const userOrgList = useOrgContentStore((s) => s.userOrgList);
  const userOrgListLoading = useOrgContentStore((s) => s.userOrgListLoading);
  const userOrgListError = useOrgContentStore((s) => s.userOrgListError);
  const { showError } = useNotification();

  const userId = userIAmUserProfile?.sub;

  const orgTreeData = useMemo(
    () => mapUserOrgItems(userOrgList?.items ?? []),
    [userOrgList]
  );

  const [debouncedSearch, setDebouncedSearch] = useState(searchWord.trim());

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchWord.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchWord]);

  const refetch = useCallback(() => {
    if (!userId) return;

    const isOrgId = ORG_ID_PATTERN.test(debouncedSearch);

    GET_ALL_USER_ORGS_BY_USER_ID({
      userId,
      orgId: isOrgId ? debouncedSearch : undefined,
      orgName: isOrgId ? undefined : debouncedSearch || undefined,
    });
  }, [userId, debouncedSearch, GET_ALL_USER_ORGS_BY_USER_ID]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (userOrgListError) {
      showError(userOrgListError);
    }
  }, [userOrgListError, showError]);

  const rows = useMemo(() => {
    const keyword = debouncedSearch.toLowerCase();

    if (!keyword) return orgTreeData;

    return flattenTree(orgTreeData).filter((item) => {
      const nameMatch = (item.name ?? '').toLowerCase().includes(keyword);
      const orgIdMatch = (item.orgId ?? '').toLowerCase().includes(keyword);
      return nameMatch || orgIdMatch;
    });
  }, [orgTreeData, debouncedSearch]);

  return {
    rows,
    isLoading: userOrgListLoading,
    hasError: !!userOrgListError,
    refetch,
  };
}
