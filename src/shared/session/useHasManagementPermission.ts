import { isSingleTenant } from '@shared/config/runtimeEnv';
import { isTenantAdmin as isTenantAdminClaims } from '@shared/session/tenantRole';
import { useIAmStore } from '@shared/session/useIAmStore';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';

export interface ManagementPermissions {
  isTenantAdmin: boolean;
  isOrgAdmin: boolean;
  isOrgOperator: boolean;
  isOrgViewer: boolean;

  canManageDevices: boolean;

  canDeleteDevices: boolean;

  canCreateRootMembers: boolean;

  canManageMembers: boolean;

  canCreateRootOrg: boolean;

  canCreateSubOrg: boolean;

  canEditOrg: boolean;

  canDeleteOrg: boolean;

  canChangeParentOrg: boolean;

  canManageRegistries: boolean;

  canManageAiModels: boolean;

  canManageMqttBrokerConfigs: boolean;
}

export const useManagementPermission = (): ManagementPermissions => {
  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);
  const userIAmUserProfile = useIAmStore((s) => s.userIAmUserProfile);

  const orgRole = currentOrgId
    ? userIAmUserProfile?.resource_access?.[currentOrgId]?.orgRole
    : undefined;

  const isTenantAdmin = isTenantAdminClaims(userIAmUserProfile);
  const isOrgAdmin = orgRole === 'admin';
  const isOrgOperator = orgRole === 'operator';
  const isOrgViewer = orgRole === 'viewer';

  return {
    isTenantAdmin,
    isOrgAdmin,
    isOrgOperator,
    isOrgViewer,

    canCreateRootMembers: isOrgAdmin || isTenantAdmin,
    canManageMembers: isOrgAdmin,
    canEditOrg: isOrgAdmin,
    canCreateRootOrg: isOrgAdmin || isTenantAdmin,
    canCreateSubOrg: isOrgAdmin,
    canManageDevices: isOrgAdmin || isOrgOperator,
    canDeleteDevices: isOrgAdmin,
    canDeleteOrg: isOrgAdmin,
    canChangeParentOrg: isOrgAdmin,
    canManageRegistries: isOrgAdmin || isOrgOperator,
    canManageAiModels: isOrgAdmin || isOrgOperator,
    canManageMqttBrokerConfigs: isOrgAdmin || isOrgOperator,
  };
};

export const useHasManagementPermission = (): boolean => {
  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);
  const userIAmUserProfile = useIAmStore((s) => s.userIAmUserProfile);

  const myOrgRole =
    currentOrgId &&
    userIAmUserProfile?.resource_access?.[currentOrgId]?.orgRole;

  return myOrgRole === 'admin' || myOrgRole === 'operator';
};

export const useHasTenantTypeManagementPermission = (): boolean => {
  return isSingleTenant();
};
