import { type IMemberItem, useMemberStore } from '@features/members';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import {
  useHasTenantTypeManagementPermission,
  useManagementPermission,
} from '@shared/session/useHasManagementPermission';
import { useIAmStore } from '@shared/session/useIAmStore';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useProfileStore } from '@shared/session/useProfileStore';
import { useNotification } from '@shared/ui';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { organizationsApi } from '../api/organizations.api';
import {
  canSubmitOrganizationForm,
  flattenParentOrgOptions,
  flattenParentOrgOptionsExcluding,
  resolveEffectiveParentOrgId,
} from '../domain/organization.rules';
import type { OrgAdminOption } from '../domain/types';
import { useOrgTree } from './useOrgTree';

export function useOrganizationEditorPage(mode: 'add' | 'edit') {
  const navigate = useAppNavigate();
  const { organizationId } = useParams<{
    organizationId: string;
  }>();
  const { showError, showSuccess } = useNotification();
  const hasManagementPermission = useManagementPermission();
  const hasTenantTypePermission = useHasTenantTypeManagementPermission();

  const { rows: orgTreeNodes } = useOrgTree('');

  const userProfile = useProfileStore((s) => s.userProfile);
  const currentUserId = useIAmStore((s) => s.userIAmUserProfile?.sub);
  const jwtEmail = useIAmStore((s) => s.userIAmUserProfile?.email);

  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);
  const userOrgList = useOrgContentStore((s) => s.userOrgList);

  const GET_ORG_USERS_BY_ORG_ID = useMemberStore(
    (s) => s.GET_ORG_USERS_BY_ORG_ID
  );
  const [parentOrgId, setParentOrgId] = useState('');
  const [orgName, setOrgName] = useState('');
  const [description, setDescription] = useState('');
  const [adminOptions, setAdminOptions] = useState<OrgAdminOption[]>([]);
  const [selectedAdmins, setSelectedAdmins] = useState<OrgAdminOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const parentOptions = useMemo(() => {
    if (mode === 'add') {
      return flattenParentOrgOptions(userOrgList?.items || []);
    }

    return flattenParentOrgOptionsExcluding(
      userOrgList?.items || [],
      '',
      organizationId
    );
  }, [mode, userOrgList, organizationId]);

  const effectiveParentOrgId = resolveEffectiveParentOrgId({
    parentOrgId,
    isSingleTenant: hasTenantTypePermission,
    currentOrgId,
  });

  const canSubmit = canSubmitOrganizationForm({
    hasNoOrgData: parentOptions.length === 0,
    currentOrgId,
    canCreateRootOrg: hasManagementPermission.canCreateRootOrg,
    isOrgAdmin: hasManagementPermission.isOrgAdmin,
  });

  useEffect(() => {
    if (mode !== 'add') return;

    const parentId = useOrgContentStore.getState().getParentOrgId();

    setParentOrgId(parentId);
  }, [mode, currentOrgId, userOrgList]);

  useEffect(() => {
    if (mode !== 'add') return;

    let ignore = false;

    const fetchAdmins = async () => {
      if (!parentOrgId) {
        const fullName = [userProfile?.firstName, userProfile?.lastName]
          .filter(Boolean)
          .join(' ');

        const selfAdmin = {
          id: currentUserId || '',
          name: fullName || '-',
          email: userProfile?.email || jwtEmail || '',
        };

        setAdminOptions([selfAdmin]);
        setSelectedAdmins([selfAdmin]);

        return;
      }

      try {
        const result = await GET_ORG_USERS_BY_ORG_ID({
          orgId: parentOrgId,
          skipCount: undefined,
          maxResultCount: undefined,
          name: undefined,
          sorting: 'name asc',
        });

        if (ignore) return;

        const options: OrgAdminOption[] = (result?.items || []).map(
          (item: IMemberItem) => ({
            id: item.userId,
            name: item.name || '-',
            email: item.email || '',
          })
        );

        const currentUserData = (result?.items || []).find(
          (item) => item.userId === currentUserId
        );

        setAdminOptions(options);

        if (currentUserData) {
          setSelectedAdmins([
            {
              id: currentUserData.userId,
              name: currentUserData.name || '-',
              email: currentUserData.email || '',
            },
          ]);
        }
      } catch (error) {
        if (ignore) return;

        console.error('[AddOrganization] Fetch org admins failed:', error);

        setAdminOptions([]);
      }
    };

    fetchAdmins();

    return () => {
      ignore = true;
    };
  }, [
    mode,
    parentOrgId,
    currentUserId,
    userProfile,
    jwtEmail,
    GET_ORG_USERS_BY_ORG_ID,
  ]);

  useEffect(() => {
    if (mode !== 'edit') return;

    const controller = new AbortController();

    const fetchOrganizationDetail = async () => {
      if (!organizationId) return;

      try {
        const orgDetailById = await organizationsApi.getOrgByOrgId(
          organizationId,
          controller.signal
        );

        setOrgName(orgDetailById?.name || '');
        setParentOrgId(orgDetailById?.parentOrgId || '');
        setDescription(orgDetailById?.description || '');

        const admins: OrgAdminOption[] = (orgDetailById?.admins || []).map(
          (admin) => ({
            id: admin.userId,
            name: admin.name || '-',
            email: admin.email || '',
          })
        );

        setSelectedAdmins(admins);
      } catch (error) {
        if (axios.isCancel(error)) return;

        showError(
          error instanceof Error
            ? error.message
            : 'Failed to load organization detail'
        );
      }
    };

    fetchOrganizationDetail();

    return () => controller.abort();
  }, [mode, organizationId, showError]);

  useEffect(() => {
    if (mode !== 'edit') return;

    let ignore = false;

    const fetchOrgUsers = async () => {
      if (!organizationId) {
        setAdminOptions([]);
        return;
      }

      try {
        const result = await GET_ORG_USERS_BY_ORG_ID({
          orgId: organizationId,
          skipCount: undefined,
          maxResultCount: undefined,
          sorting: 'name asc',
        });

        if (ignore) return;

        const options: OrgAdminOption[] = (result?.items || []).map(
          (item: IMemberItem) => ({
            id: item.userId,
            name: item.name || '-',
            email: item.email || '',
          })
        );

        setAdminOptions(options);
      } catch (error) {
        if (ignore) return;

        console.error('[EditOrganization] Fetch org users failed:', error);
        setAdminOptions([]);
      }
    };

    fetchOrgUsers();

    return () => {
      ignore = true;
    };
  }, [mode, organizationId, GET_ORG_USERS_BY_ORG_ID]);

  const handleCancel = () => {
    navigate('/organizations');
  };

  const handleSubmit = async () => {
    if (mode === 'add') {
      if (!orgName.trim() || !selectedAdmins.length) return;

      setSubmitting(true);

      try {
        await organizationsApi.postOrganization({
          parentOrgId: effectiveParentOrgId,
          name: orgName.trim(),
          description: description.trim(),
          admins: selectedAdmins.map((admin) => ({ userId: admin.id })),
        });

        await useIAmStore.getState().POST_REFRESH_JWT_ACCESS_TOKEN();
        await useOrgContentStore.getState().GET_ORGANIZATION();

        showSuccess('Organization created successfully');
        navigate('/organizations');
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Create organization failed';
        showError(message);
        console.error('[AddOrganization] Create organization failed:', message);
      } finally {
        setSubmitting(false);
      }

      return;
    }

    if (!organizationId || !orgName.trim()) return;

    setSubmitting(true);

    try {
      await organizationsApi.patchOrganizationByOrgId({
        orgId: organizationId,
        name: orgName.trim(),
        description: description.trim(),
        admins: selectedAdmins.map((admin) => ({ userId: admin.id })),
      });

      await useOrgContentStore.getState().GET_ORGANIZATION();

      showSuccess('Organization updated successfully');
      navigate('/organizations');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Update organization failed';
      showError(message);
      console.error('[EditOrganization] Update failed:', message);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    parentOrgId,
    effectiveParentOrgId,
    orgName,
    description,
    parentOptions,
    orgTreeNodes,
    canSelectEmptyParent: hasTenantTypePermission,
    canSubmit,
    currentUserId,
    adminOptions,
    selectedAdmins,
    submitting,
    setParentOrgId,
    setOrgName,
    setDescription,
    setSelectedAdmins,
    handleSubmit,
    handleCancel,
  };
}
