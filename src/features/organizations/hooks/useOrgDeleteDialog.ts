import { useDeviceStore } from '@features/devices';
import { useIAmStore } from '@shared/session/useIAmStore';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import { useState } from 'react';

import { organizationsApi } from '../api/organizations.api';

interface IOrgRow {
  orgId: string;
  name: string;
}

async function deleteOrganization(orgId: string, orgName: string) {
  const userId = useIAmStore.getState().userIAmUserProfile?.sub;

  await organizationsApi.deleteOrganization(orgId, orgName);

  if (!userId) return;

  const data = await useOrgContentStore
    .getState()
    .GET_USER_ORGS_BY_USER_ID({ userId, maxResultCount: 20 });

  const { currentOrgId } = useOrgContentStore.getState();

  if (data && currentOrgId === orgId) {
    const firstOrg = data.items.find((org) => !org.parentOrgId) ?? null;

    if (firstOrg) {
      useOrgContentStore
        .getState()
        .setCurrentOrg(firstOrg.orgId, firstOrg.name ?? '-');
    }
  }
}

export function useOrgDeleteDialog() {
  const [target, setTarget] = useState<IOrgRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [deviceCount, setDeviceCount] = useState<number | null>(null);

  const { showError, showSuccess } = useNotification();

  const GET_DEVICES = useDeviceStore((s) => s.GET_DEVICES);
  const loading = useDeviceStore((s) => s.loading);

  const canDelete =
    !loading &&
    deviceCount === 0 &&
    target !== null &&
    inputValue.trim() === target.name.trim();

  const handleOpenDialog = async (row: IOrgRow) => {
    setTarget(row);
    setDialogOpen(true);
    setInputValue('');
    setDeviceCount(null);

    const res = await GET_DEVICES({ orgId: row.orgId });
    setDeviceCount(res?.totalCount ?? 0);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setInputValue('');
  };

  const handleConfirm = async () => {
    if (!target) return;
    if (inputValue.trim() !== target.name.trim()) return;

    const { orgId, name } = target;

    try {
      await deleteOrganization(orgId, name);

      showSuccess(`Organization [${name}] has been permanently deleted.`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Delete organization failed';
      showError(message);
      console.error('[Delete organization] failed:', message);
    } finally {
      setDialogOpen(false);
      setInputValue('');
    }
  };

  return {
    dialogOpen,
    orgName: target?.name ?? '',
    inputValue,
    deviceCount,
    loading,
    canDelete,
    handleOpenDialog,
    handleClose,
    handleConfirm,
    setInputValue,
  };
}
