import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useIAmStore } from '@shared/session/useIAmStore';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import { useState } from 'react';

import type { IMemberItem } from '../api/members.api.types';
import { useMemberStore } from '../store/useMemberStore';

export function useMemberTableActions(
  rows: IMemberItem[],
  onMemberDeleted: () => void
) {
  const navigate = useAppNavigate();

  const currentOrgName = useOrgContentStore((s) => s.currentOrgName);
  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [targetMember, setTargetMember] = useState<string | null>(null);

  const hasPermission = useManagementPermission().canManageMembers;

  const DELETE_MEMBER = useMemberStore((s) => s.DELETE_MEMBER);
  const currentUserId = useIAmStore((s) => s.userIAmUserProfile?.sub);
  const { showError } = useNotification();

  const selectableRows = rows.filter((r) => r.userId !== currentUserId);
  const allSelected =
    selectableRows.length > 0 && selectedIds.length === selectableRows.length;

  const someSelected =
    selectedIds.length > 0 && selectedIds.length < selectableRows.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(selectableRows.map((x) => x.userId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    } else {
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    }
  };

  const handleBatchEdit = () => {
    if (!selectedIds.length) return;

    navigate('/members/edit', {
      state: {
        selectedIds,
      },
    });
  };

  const handleEditOne = (userId: string) => {
    navigate('/members/edit', {
      state: {
        selectedIds: [userId],
      },
    });
  };

  const handleOpenDialog = (member: IMemberItem) => {
    setTargetMember(member.name);
    setSelectedIds([member.userId]);
    setDeleteOpen(true);
  };

  const handleCloseDialog = () => {
    setDeleteOpen(false);
    setTargetMember(null);
    setSelectedIds([]);
  };

  const handleBatchDelete = () => {
    if (!selectedIds.length) return;
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    const targets = selectedIds.filter((id) => id !== currentUserId);

    if (targets.length === 0) return;

    for (const userId of targets) {
      const success = await DELETE_MEMBER({ orgId: currentOrgId, userId });
      if (!success) {
        showError('Delete failed. Remaining members were not deleted.');
        onMemberDeleted();
        setDeleteOpen(false);
        setTargetMember(null);
        setSelectedIds([]);
        return;
      }
    }

    onMemberDeleted();

    setSelectedIds([]);
    setDeleteOpen(false);
  };

  return {
    currentOrgName,
    currentUserId,
    selectedIds,
    deleteOpen,
    targetMember,
    hasPermission,
    allSelected,
    someSelected,
    handleSelectAll,
    handleSelectOne,
    handleBatchEdit,
    handleEditOne,
    handleOpenDialog,
    handleCloseDialog,
    handleBatchDelete,
    handleConfirmDelete,
  };
}
