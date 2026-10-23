export type TenantType = 'singleTenant' | 'saas';

const DEFAULT_TENANT_TYPE: TenantType = 'singleTenant';

const getRuntimeEnv = (): Window['__ENV__'] => {
  return window.__ENV__;
};

export const getTenantType = (): TenantType => {
  return getRuntimeEnv()?.tenantType ?? DEFAULT_TENANT_TYPE;
};

export const isSingleTenant = (): boolean => {
  return getTenantType() === 'singleTenant';
};
