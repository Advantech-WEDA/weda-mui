import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useIAmStore } from '@shared/session/useIAmStore';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useState } from 'react';

import { buildOrganizationRows } from '../domain/organization.rules';
import type { OrganizationRow } from '../domain/types';
import { useOrgDeleteDialog } from './useOrgDeleteDialog';
import { useOrgTree } from './useOrgTree';

export function useOrganizationListPage() {
  const navigate = useAppNavigate();

  const [searchWord, setSearchWord] = useState('');
  const { rows: nodes, isLoading, hasError, refetch } = useOrgTree(searchWord);

  const permissions = useManagementPermission();
  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);
  const checkIsRootOrgById = useOrgContentStore((s) => s.checkIsRootOrgById);
  const currentUserId = useIAmStore((s) => s.userIAmUserProfile?.sub);

  const deleteDialog = useOrgDeleteDialog();

  const rows = buildOrganizationRows(nodes, {
    currentOrgId,
    currentUserId,
    canEditOrg: permissions.canEditOrg,
    canDeleteOrg: permissions.canDeleteOrg,
    isRootOrg: checkIsRootOrgById,
  });

  const handleAdd = () => {
    navigate('/organizations/add');
  };

  const handleEdit = (row: OrganizationRow) => {
    if (row.disableEdit) return;

    navigate(`/organizations/${row.orgId}/edit`, {
      state: { name: row.name },
    });
  };

  const handleClearFilters = () => {
    setSearchWord('');
  };

  return {
    rows,
    isLoading,
    hasError,
    searchWord,
    canCreateRootOrg: permissions.canCreateRootOrg,
    deleteDialog,
    setSearchWord,
    handleAdd,
    handleEdit,
    handleClearFilters,
    handleRetryFetch: refetch,
  };
}
