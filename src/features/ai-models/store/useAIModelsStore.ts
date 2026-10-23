import { extractErrorMessage } from '@shared/api/extractErrorMessage';
import { fetchAllPages, MAX_PAGE_SIZE } from '@shared/api/fetchAllPages';
import axios from 'axios';
import { create, type StoreApi } from 'zustand';

import { aiModelsApi } from '@/features/ai-models/api/aiModels.api';
import type {
  IAiModelDeployment,
  IAiModelDeviceDeploymentItem,
  IAiModelDeviceDeploymentsResponse,
  IAiModelEditionDeploymentsResponse,
  IAiModelEditionDetail,
  IAiModelEditionsListResponse,
  IAiModelIdParams,
  IAiModelItem,
  IAiModelsListResponse,
  IAiModelTusParams,
  IAiModelUploadIdParams,
  IAiModelUploadSessionResult,
  IAiModelUploadStatus,
  ICreateAiModelDeploymentPayload,
  ICreateAiModelEditionPayload,
  ICreateAiModelPayload,
  ICreateAiModelUploadSessionParams,
  IDeleteAiModelEditionResponse,
  IDeleteAiModelFromDeviceParams,
  IDeleteAiModelResponse,
  IGetAiModelDeviceDeploymentsParams,
  IGetAiModelEditionDeploymentsParams,
  IGetAiModelEditionParams,
  IGetAiModelEditionsParams,
  IGetAiModelsParams,
  IUpdateAiModelEditionPayload,
  IUpdateAiModelPayload,
} from '@/features/ai-models/api/aiModels.api.types';

interface IAiModelState {
  loading: boolean;
  aiModelItems: IAiModelItem[];
  aiModelDeviceDeploymentsList: IAiModelDeviceDeploymentsResponse | null;
  deviceAiModelsMap: Record<string, IAiModelDeviceDeploymentItem[]>;
  aiModelEditionDeploymentsList: IAiModelEditionDeploymentsResponse | null;

  GET_AI_MODELS: (
    params: IGetAiModelsParams,
    signal?: AbortSignal
  ) => Promise<IAiModelsListResponse>;

  GET_ALL_AI_MODELS: (
    params: Omit<IGetAiModelsParams, 'skipCount' | 'maxResultCount'>,
    signal?: AbortSignal
  ) => Promise<IAiModelsListResponse>;

  POST_AI_MODEL: (params: ICreateAiModelPayload) => Promise<IAiModelItem>;

  DELETE_AI_MODEL: (
    params: IAiModelIdParams
  ) => Promise<IDeleteAiModelResponse>;

  GET_AI_MODEL_EDITION: (
    params: IGetAiModelEditionParams
  ) => Promise<IAiModelEditionDetail>;

  PATCH_AI_MODEL_EDITION: (
    params: IUpdateAiModelEditionPayload
  ) => Promise<IAiModelEditionDetail>;

  DELETE_AI_MODEL_EDITION: (
    params: IGetAiModelEditionParams
  ) => Promise<IDeleteAiModelEditionResponse>;

  PATCH_AI_MODEL: (params: IUpdateAiModelPayload) => Promise<IAiModelItem>;

  POST_AI_MODEL_EDITION: (
    params: ICreateAiModelEditionPayload
  ) => Promise<IAiModelEditionDetail>;

  GET_AI_MODEL_EDITIONS: (
    params: IGetAiModelEditionsParams,
    signal?: AbortSignal
  ) => Promise<IAiModelEditionsListResponse>;

  GET_ALL_AI_MODEL_EDITIONS: (
    params: Omit<IGetAiModelEditionsParams, 'skipCount' | 'maxResultCount'>,
    signal?: AbortSignal
  ) => Promise<IAiModelEditionsListResponse>;

  POST_AI_MODEL_DEPLOYMENT: (
    params: ICreateAiModelDeploymentPayload
  ) => Promise<IAiModelDeployment>;

  GET_DEVICE_AI_MODELS: (
    params: IGetAiModelDeviceDeploymentsParams,
    signal?: AbortSignal
  ) => Promise<IAiModelDeviceDeploymentsResponse>;

  GET_ALL_DEVICE_AI_MODELS: (
    params: Omit<
      IGetAiModelDeviceDeploymentsParams,
      'skipCount' | 'maxResultCount'
    >,
    signal?: AbortSignal
  ) => Promise<IAiModelDeviceDeploymentsResponse>;

  GET_AI_MODEL_EDITION_DEPLOYMENTS: (
    params: IGetAiModelEditionDeploymentsParams,
    signal?: AbortSignal
  ) => Promise<IAiModelEditionDeploymentsResponse>;

  GET_ALL_AI_MODEL_EDITION_DEPLOYMENTS: (
    params: Omit<
      IGetAiModelEditionDeploymentsParams,
      'skipCount' | 'maxResultCount'
    >,
    signal?: AbortSignal
  ) => Promise<IAiModelEditionDeploymentsResponse>;

  DELETE_AI_MODEL_EDITION_DEPLOYMENTS: (
    params: IGetAiModelEditionParams
  ) => Promise<void>;

  DELETE_AI_MODEL_FROM_DEVICE: (
    params: IDeleteAiModelFromDeviceParams
  ) => Promise<void>;

  GET_AI_MODEL_UPLOAD_STATUS: (
    params: IAiModelUploadIdParams
  ) => Promise<IAiModelUploadStatus>;

  POST_AI_MODEL_UPLOAD: (
    params: ICreateAiModelUploadSessionParams
  ) => Promise<IAiModelUploadSessionResult>;

  DELETE_AI_MODEL_UPLOAD: (params: IAiModelTusParams) => Promise<void>;
}

type AiModelSet = StoreApi<IAiModelState>['setState'];

const withLoading = async <T>(
  set: AiModelSet,
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

const fetchAllAsOnePage = async <T>(
  fetchPage: Parameters<typeof fetchAllPages<T>>[0]
) => {
  const data = await fetchAllPages(fetchPage, MAX_PAGE_SIZE);

  return {
    ...data,
    skipCount: 0,
    maxResultCount: data.totalCount,
    totalPages: 1,
  };
};

const resetAiModelsState = () => ({
  aiModelItems: [],
});

export const useAIModelsStore = create<IAiModelState>()((set) => ({
  loading: false,
  aiModelItems: [],
  aiModelDeviceDeploymentsList: null,
  deviceAiModelsMap: {},
  aiModelEditionDeploymentsList: null,

  async GET_AI_MODELS(params, signal): Promise<IAiModelsListResponse> {
    try {
      return await withLoading(set, async () => {
        const data = await aiModelsApi.getAiModels(params, signal);

        set({ aiModelItems: data.items ?? [] });

        return data;
      });
    } catch (error) {
      return handleStoreError(error, '[Get AI models] Fetch failed', () =>
        set(resetAiModelsState())
      );
    }
  },

  async GET_ALL_AI_MODELS(params, signal): Promise<IAiModelsListResponse> {
    try {
      return await withLoading(set, async () => {
        const data = await fetchAllPages(
          (page) => aiModelsApi.getAiModels({ ...params, ...page }, signal),
          MAX_PAGE_SIZE
        );

        set({ aiModelItems: data.items });

        return data;
      });
    } catch (error) {
      return handleStoreError(error, '[Get all AI models] Fetch failed', () =>
        set(resetAiModelsState())
      );
    }
  },

  async POST_AI_MODEL(params): Promise<IAiModelItem> {
    try {
      return await withLoading(set, async () => {
        const data = await aiModelsApi.postAiModel(params);

        set((state) => ({
          aiModelItems: [data, ...state.aiModelItems],
        }));

        return data;
      });
    } catch (error) {
      return handleStoreError(error, '[Create AI model] Fetch failed');
    }
  },

  async DELETE_AI_MODEL(params): Promise<IDeleteAiModelResponse> {
    try {
      return await withLoading(set, async () => {
        const data = await aiModelsApi.deleteAiModel(params);

        set((state) => ({
          aiModelItems: state.aiModelItems.filter(
            (item) => item.modelId !== params.modelId
          ),
        }));

        return data;
      });
    } catch (error) {
      return handleStoreError(error, '[Delete AI model] Fetch failed');
    }
  },

  async GET_AI_MODEL_EDITION(params): Promise<IAiModelEditionDetail> {
    try {
      return await withLoading(set, async () => {
        return await aiModelsApi.getAiModelEdition(params);
      });
    } catch (error) {
      return handleStoreError(error, '[Get AI model edition] Fetch failed');
    }
  },

  async PATCH_AI_MODEL_EDITION(params): Promise<IAiModelEditionDetail> {
    try {
      return await withLoading(set, async () => {
        return await aiModelsApi.patchAiModelEdition(params);
      });
    } catch (error) {
      return handleStoreError(error, '[Update AI model edition] Fetch failed');
    }
  },

  async DELETE_AI_MODEL_EDITION(
    params
  ): Promise<IDeleteAiModelEditionResponse> {
    try {
      return await withLoading(set, async () => {
        return await aiModelsApi.deleteAiModelEdition(params);
      });
    } catch (error) {
      return handleStoreError(error, '[Delete AI model edition] Fetch failed');
    }
  },

  async PATCH_AI_MODEL(params): Promise<IAiModelItem> {
    try {
      return await withLoading(set, async () => {
        const data = await aiModelsApi.patchAiModel(params);

        set((state) => ({
          aiModelItems: state.aiModelItems.map((item) =>
            item.modelId === params.modelId ? data : item
          ),
        }));

        return data;
      });
    } catch (error) {
      return handleStoreError(error, '[Update AI model] Fetch failed');
    }
  },

  async POST_AI_MODEL_EDITION(params): Promise<IAiModelEditionDetail> {
    try {
      return await withLoading(set, async () => {
        return await aiModelsApi.postAiModelEdition(params);
      });
    } catch (error) {
      return handleStoreError(
        error,
        '[Register AI model edition] Fetch failed'
      );
    }
  },

  async GET_AI_MODEL_EDITIONS(
    params,
    signal
  ): Promise<IAiModelEditionsListResponse> {
    try {
      return await withLoading(set, async () => {
        return await aiModelsApi.getAiModelEditions(params, signal);
      });
    } catch (error) {
      return handleStoreError(error, '[Get AI model editions] Fetch failed');
    }
  },

  async GET_ALL_AI_MODEL_EDITIONS(
    params,
    signal
  ): Promise<IAiModelEditionsListResponse> {
    try {
      return await withLoading(set, async () => {
        return await fetchAllPages(
          (page) =>
            aiModelsApi.getAiModelEditions({ ...params, ...page }, signal),
          MAX_PAGE_SIZE
        );
      });
    } catch (error) {
      return handleStoreError(
        error,
        '[Get all AI model editions] Fetch failed'
      );
    }
  },

  async POST_AI_MODEL_DEPLOYMENT(params): Promise<IAiModelDeployment> {
    try {
      return await withLoading(set, async () => {
        return await aiModelsApi.postAiModelDeployment(params);
      });
    } catch (error) {
      return handleStoreError(
        error,
        '[Create AI model deployment] Fetch failed'
      );
    }
  },

  async GET_DEVICE_AI_MODELS(
    params,
    signal
  ): Promise<IAiModelDeviceDeploymentsResponse> {
    try {
      return await withLoading(set, async () => {
        const data = await aiModelsApi.getDeviceAiModels(params, signal);

        set((state) => ({
          aiModelDeviceDeploymentsList: data,
          deviceAiModelsMap: {
            ...state.deviceAiModelsMap,
            [params.deviceId]: data.items ?? [],
          },
        }));

        return data;
      });
    } catch (error) {
      return handleStoreError(
        error,
        '[Get device AI models] Fetch failed',
        () => set({ aiModelDeviceDeploymentsList: null })
      );
    }
  },

  async GET_ALL_DEVICE_AI_MODELS(
    params,
    signal
  ): Promise<IAiModelDeviceDeploymentsResponse> {
    try {
      return await withLoading(set, async () => {
        const data = await fetchAllAsOnePage((page) =>
          aiModelsApi.getDeviceAiModels({ ...params, ...page }, signal)
        );

        set((state) => ({
          aiModelDeviceDeploymentsList: data,
          deviceAiModelsMap: {
            ...state.deviceAiModelsMap,
            [params.deviceId]: data.items,
          },
        }));

        return data;
      });
    } catch (error) {
      return handleStoreError(
        error,
        '[Get all device AI models] Fetch failed',
        () => set({ aiModelDeviceDeploymentsList: null })
      );
    }
  },

  async GET_AI_MODEL_EDITION_DEPLOYMENTS(
    params,
    signal
  ): Promise<IAiModelEditionDeploymentsResponse> {
    try {
      return await withLoading(set, async () => {
        const data = await aiModelsApi.getAiModelEditionDeployments(
          params,
          signal
        );

        set({ aiModelEditionDeploymentsList: data });

        return data;
      });
    } catch (error) {
      return handleStoreError(
        error,
        '[Get AI model edition deployments] Fetch failed',
        () => set({ aiModelEditionDeploymentsList: null })
      );
    }
  },

  async GET_ALL_AI_MODEL_EDITION_DEPLOYMENTS(
    params,
    signal
  ): Promise<IAiModelEditionDeploymentsResponse> {
    try {
      return await withLoading(set, async () => {
        const data = await fetchAllAsOnePage((page) =>
          aiModelsApi.getAiModelEditionDeployments(
            { ...params, ...page },
            signal
          )
        );

        set({ aiModelEditionDeploymentsList: data });

        return data;
      });
    } catch (error) {
      return handleStoreError(
        error,
        '[Get all AI model edition deployments] Fetch failed',
        () => set({ aiModelEditionDeploymentsList: null })
      );
    }
  },

  async DELETE_AI_MODEL_EDITION_DEPLOYMENTS(params): Promise<void> {
    try {
      await withLoading(set, async () => {
        await aiModelsApi.deleteAiModelEditionDeployments(params);

        set({
          aiModelEditionDeploymentsList: null,
          aiModelDeviceDeploymentsList: null,
          deviceAiModelsMap: {},
        });
      });
    } catch (error) {
      handleStoreError(
        error,
        '[Delete AI model edition deployments] Fetch failed'
      );
    }
  },

  async DELETE_AI_MODEL_FROM_DEVICE(params): Promise<void> {
    try {
      await withLoading(set, async () => {
        await aiModelsApi.deleteAiModelFromDevice(params);

        set((state) => ({
          aiModelDeviceDeploymentsList: state.aiModelDeviceDeploymentsList
            ? {
                ...state.aiModelDeviceDeploymentsList,
                items: (state.aiModelDeviceDeploymentsList.items ?? []).filter(
                  (item) =>
                    !(
                      item.modelId === params.modelId &&
                      item.edition === params.edition
                    )
                ),
              }
            : state.aiModelDeviceDeploymentsList,
          aiModelEditionDeploymentsList: state.aiModelEditionDeploymentsList
            ? {
                ...state.aiModelEditionDeploymentsList,
                items: (state.aiModelEditionDeploymentsList.items ?? []).filter(
                  (item) => item.deviceId !== params.deviceId
                ),
              }
            : state.aiModelEditionDeploymentsList,
          deviceAiModelsMap: state.deviceAiModelsMap[params.deviceId]
            ? {
                ...state.deviceAiModelsMap,
                [params.deviceId]: state.deviceAiModelsMap[
                  params.deviceId
                ].filter(
                  (item) =>
                    !(
                      item.modelId === params.modelId &&
                      item.edition === params.edition
                    )
                ),
              }
            : state.deviceAiModelsMap,
        }));
      });
    } catch (error) {
      handleStoreError(error, '[Delete AI model from device] Fetch failed');
    }
  },

  async GET_AI_MODEL_UPLOAD_STATUS(params): Promise<IAiModelUploadStatus> {
    try {
      return await withLoading(set, async () => {
        return await aiModelsApi.getAiModelUploadStatus(params);
      });
    } catch (error) {
      return handleStoreError(
        error,
        '[Get AI model upload status] Fetch failed'
      );
    }
  },

  async POST_AI_MODEL_UPLOAD(params): Promise<IAiModelUploadSessionResult> {
    try {
      return await withLoading(set, async () => {
        return await aiModelsApi.postAiModelUploadSession(params);
      });
    } catch (error) {
      return handleStoreError(
        error,
        '[Create AI model upload session] Fetch failed'
      );
    }
  },

  async DELETE_AI_MODEL_UPLOAD(params): Promise<void> {
    try {
      await withLoading(set, async () => {
        await aiModelsApi.deleteAiModelUpload(params);
      });
    } catch (error) {
      handleStoreError(error, '[Terminate AI model upload] Fetch failed');
    }
  },
}));
