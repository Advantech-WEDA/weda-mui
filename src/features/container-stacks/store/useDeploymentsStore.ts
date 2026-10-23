import { extractErrorMessage } from '@shared/api/extractErrorMessage';
import { fetchAllPages, MAX_PAGE_SIZE } from '@shared/api/fetchAllPages';
import axios from 'axios';
import { create, type StoreApi } from 'zustand';

import { stacksApi } from '../api/stacks.api';
import type {
  ICreateStackConfigPayload,
  IDeleteStackFromDeviceParams,
  IDeploymentItem,
  IDeploymentListResponse,
  IDeployStackToDevicesPayload,
  IGetDeploymentsParams,
  IGetListStacksInDeviceParams,
  IGetStackConfigByIdParams,
  IGetStackConfigsParams,
  IStackActionPayload,
  IStackActionResponse,
  IStackConfigsItem,
  IStackConfigsListResponse,
  IUpdateStackConfigPayload,
} from '../api/stacks.api.types';

interface IDeploymentsState {
  totalCount: number;
  loading: boolean;
  deploymentItems: IDeploymentItem[];
  stackConfigsItems: IStackConfigsItem[];
  stackConfigById: IStackConfigsItem | null;

  GET_DEPLOYMENTS: (
    params: IGetDeploymentsParams,
    signal?: AbortSignal
  ) => Promise<IDeploymentListResponse>;

  GET_ALL_DEPLOYMENTS: (
    params: Omit<IGetDeploymentsParams, 'skipCount' | 'maxResultCount'>,
    signal?: AbortSignal
  ) => Promise<IDeploymentListResponse>;

  GET_STACK_CONFIGS: (
    params: IGetStackConfigsParams,
    signal?: AbortSignal
  ) => Promise<IStackConfigsListResponse>;

  POST_STACK_CONFIG: (
    payload: ICreateStackConfigPayload
  ) => Promise<IStackConfigsItem>;

  GET_STACK_CONFIG_BY_ID: (
    params: IGetStackConfigByIdParams,
    signal?: AbortSignal
  ) => Promise<IStackConfigsItem>;

  PATCH_STACK_CONFIG_BY_ID: (
    params: IUpdateStackConfigPayload
  ) => Promise<IStackConfigsItem>;

  DELETE_STACK_CONFIG_BY_ID: (
    params: IGetStackConfigByIdParams
  ) => Promise<void>;

  POST_STACK_ACTION: (
    payload: IStackActionPayload
  ) => Promise<IStackActionResponse>;

  DELETE_STACK_FROM_DEVICE: (
    params: IDeleteStackFromDeviceParams
  ) => Promise<void>;

  POST_DEPLOY_STACK_TO_DEVICES: (
    payload: IDeployStackToDevicesPayload
  ) => Promise<IDeploymentItem>;

  GET_LIST_STACKS_IN_DEVICE: (
    params: IGetListStacksInDeviceParams,
    signal?: AbortSignal
  ) => Promise<IDeploymentListResponse>;
}

type DeploymentsSet = StoreApi<IDeploymentsState>['setState'];

const withLoading = async <T>(
  set: DeploymentsSet,
  callback: () => Promise<T>
): Promise<T> => {
  set({ loading: true });

  try {
    const result = await callback();

    set({ loading: false });

    return result;
  } catch (error) {
    if (!axios.isCancel(error)) {
      set({ loading: false });
    }

    throw error;
  }
};

const handleStoreError = (
  error: unknown,
  fallbackMessage: string,
  onError?: () => void
): never => {
  if (axios.isCancel(error)) {
    throw error;
  }

  const errorMessage = extractErrorMessage(error, fallbackMessage);

  onError?.();
  console.error(errorMessage, error);

  throw new Error(errorMessage);
};

const resetDeploymentState = () => ({
  totalCount: 0,
  deploymentItems: [],
});

const resetStackConfigsState = () => ({
  totalCount: 0,
  stackConfigsItems: [],
});

const removeDeploymentItem = (
  items: IDeploymentItem[],
  params: IDeleteStackFromDeviceParams
) =>
  items.filter(
    (item) =>
      !(
        item.stackConfigId === params.stackConfigId &&
        item.deviceId === params.deviceId
      )
  );

export const useDeploymentsStore = create<IDeploymentsState>()((set) => ({
  totalCount: 0,
  loading: false,
  deploymentItems: [],
  stackConfigsItems: [],
  stackConfigById: null,

  async GET_DEPLOYMENTS(params, signal): Promise<IDeploymentListResponse> {
    try {
      return await withLoading(set, async () => {
        const data = await stacksApi.getDeployments(params, signal);

        set({
          deploymentItems: data.items,
          totalCount: data.totalCount,
        });

        return data;
      });
    } catch (error) {
      return handleStoreError(error, '[Get deployments] Fetch failed');
    }
  },

  async GET_ALL_DEPLOYMENTS(params, signal): Promise<IDeploymentListResponse> {
    try {
      return await withLoading(set, async () => {
        set(resetDeploymentState());

        const data = await fetchAllPages(
          (page) => stacksApi.getDeployments({ ...params, ...page }, signal),
          MAX_PAGE_SIZE
        );

        set({
          deploymentItems: data.items,
          totalCount: data.totalCount,
        });

        return data;
      });
    } catch (error) {
      return handleStoreError(error, '[Get all deployments] Fetch failed', () =>
        set(resetDeploymentState())
      );
    }
  },

  async GET_STACK_CONFIGS(params, signal): Promise<IStackConfigsListResponse> {
    try {
      return await withLoading(set, async () => {
        const data = await stacksApi.getStackConfigs(params, signal);

        set({
          stackConfigsItems: data.items,
          totalCount: data.totalCount,
        });

        return data;
      });
    } catch (error) {
      return handleStoreError(error, 'Failed to get stack configs list.', () =>
        set(resetStackConfigsState())
      );
    }
  },

  async POST_STACK_CONFIG(params): Promise<IStackConfigsItem> {
    try {
      return await withLoading(set, async () => {
        const data = await stacksApi.postStackConfig(params);

        set((state) => ({
          stackConfigsItems: [data, ...state.stackConfigsItems],
          totalCount: state.totalCount + 1,
        }));

        return data;
      });
    } catch (error) {
      return handleStoreError(error, 'Failed to create stack config.');
    }
  },

  async GET_STACK_CONFIG_BY_ID(
    params: IGetStackConfigByIdParams,
    signal?: AbortSignal
  ): Promise<IStackConfigsItem> {
    try {
      return await withLoading(set, async () => {
        const data = await stacksApi.getStackConfigById(params, signal);

        set({
          stackConfigById: data,
        });

        return data;
      });
    } catch (error) {
      return handleStoreError(error, 'Failed to get stack config by ID.', () =>
        set({ stackConfigById: null })
      );
    }
  },

  async PATCH_STACK_CONFIG_BY_ID(params): Promise<IStackConfigsItem> {
    if (!params.orgId || !params.stackConfigId) {
      throw new Error(
        '[Update stack config] orgId and stackConfigId are required'
      );
    }

    try {
      return await withLoading(set, async () => {
        const data = await stacksApi.patchStackConfigById(params);

        set((state) => ({
          stackConfigById:
            state.stackConfigById?.stackConfigId === params.stackConfigId
              ? data
              : state.stackConfigById,
          stackConfigsItems: state.stackConfigsItems.map((item) =>
            item.stackConfigId === params.stackConfigId ? data : item
          ),
        }));

        return data;
      });
    } catch (error) {
      return handleStoreError(error, '[Update stack config] Fetch failed');
    }
  },

  async DELETE_STACK_CONFIG_BY_ID(
    params: IGetStackConfigByIdParams
  ): Promise<void> {
    try {
      await withLoading(set, async () => {
        await stacksApi.deleteStackConfigById(params);

        set((state) => ({
          stackConfigsItems: state.stackConfigsItems.filter(
            (item) => item.stackConfigId !== params.stackConfigId
          ),
          totalCount: Math.max(state.totalCount - 1, 0),
          stackConfigById:
            state.stackConfigById?.stackConfigId === params.stackConfigId
              ? null
              : state.stackConfigById,
        }));
      });
    } catch (error) {
      handleStoreError(error, '[Delete stack config] Fetch failed');
    }
  },

  async POST_STACK_ACTION(
    params: IStackActionPayload
  ): Promise<IStackActionResponse> {
    try {
      return await withLoading(set, async () => {
        const data = await stacksApi.postStackAction(params);

        return data;
      });
    } catch (error) {
      return handleStoreError(error, 'Failed to execute stack action.');
    }
  },

  async DELETE_STACK_FROM_DEVICE(
    params: IDeleteStackFromDeviceParams
  ): Promise<void> {
    try {
      await withLoading(set, async () => {
        await stacksApi.deleteStackFromDevice(params);

        set((state) => {
          const deploymentItems = removeDeploymentItem(
            state.deploymentItems,
            params
          );

          return {
            deploymentItems,
            totalCount: Math.max(state.totalCount - 1, 0),
          };
        });
      });
    } catch (error) {
      handleStoreError(error, '[Delete stack from device] Fetch failed');
    }
  },

  async POST_DEPLOY_STACK_TO_DEVICES(params): Promise<IDeploymentItem> {
    try {
      return await withLoading(set, async () => {
        const data = await stacksApi.postDeployStackToDevices(params);

        return data;
      });
    } catch (error) {
      return handleStoreError(error, 'Failed to deploy stack to devices.');
    }
  },

  async GET_LIST_STACKS_IN_DEVICE(
    params: IGetListStacksInDeviceParams,
    signal
  ): Promise<IDeploymentListResponse> {
    try {
      return await withLoading(set, async () => {
        const data = await stacksApi.getListStacksInDevice(params, signal);

        set({
          deploymentItems: data.items,
          totalCount: data.totalCount,
        });

        return data;
      });
    } catch (error) {
      return handleStoreError(
        error,
        '[Get list of stacks in device] Fetch failed',
        () => set(resetDeploymentState())
      );
    }
  },
}));
