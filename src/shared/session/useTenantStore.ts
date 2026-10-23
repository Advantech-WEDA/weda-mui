import axiosInstance from '@shared/api/axiosInstance';
import { getTenant } from '@shared/lib/baseUrl';
import { useIAmStore } from '@shared/session/useIAmStore';
import { create } from 'zustand';

export interface ITenantApplicationGridResult {
  id: string;
  displayName: string;
  url: string;
  version?: string | null;
  icon?: string | null;
  deployStatus: string;
  licenseStatus: string;
  progressRate?: number | null;
  isVisible: boolean;
  gridOrder: number;
  expiredAt?: string | null;
  updatedAt?: string | null;
  deployedAt?: string | null;
}

export interface ITenantState {
  userTenantApplicationGridState: ITenantApplicationGridResult[] | null;
  GET_TENANT_APP_GRID: () => Promise<ITenantApplicationGridResult[]>;
}

export const useTenantStore = create<ITenantState>()((set) => ({
  userTenantApplicationGridState: null,
  async GET_TENANT_APP_GRID(): Promise<ITenantApplicationGridResult[]> {
    const tenantId = useIAmStore.getState().userIAmUserProfile?.tenantId;
    const domainName = getTenant();

    if (!tenantId || !domainName) {
      set({ userTenantApplicationGridState: null });
      return [];
    }

    try {
      const { data } = await axiosInstance.get<ITenantApplicationGridResult[]>(
        `/${domainName}/portal/api/v1.0/srp/${tenantId}/app-grid`
      );
      set({ userTenantApplicationGridState: data });
      return data;
    } catch (error) {
      set({ userTenantApplicationGridState: null });
      console.error('[Get Organization Data] Fetch failed:', error);
      return Promise.reject(error);
    }
  },
}));
