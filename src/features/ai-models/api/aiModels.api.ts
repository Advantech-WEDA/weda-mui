import { apiPath } from '@shared/api/apiPath';
import axiosInstance from '@shared/api/axiosInstance';

import type {
  IAiModelDeployment,
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
  IGetAiModelUploadOffsetResult,
  IUpdateAiModelEditionPayload,
  IUpdateAiModelPayload,
  IUploadAiModelChunkParams,
  IUploadAiModelChunkResult,
} from '@/features/ai-models/api/aiModels.api.types';

const getAiModels = async (
  params: IGetAiModelsParams,
  signal?: AbortSignal
): Promise<IAiModelsListResponse> => {
  const { data } = await axiosInstance.get<IAiModelsListResponse>(
    apiPath(`/api/v1/orgs/${params.orgId}/ai-models`),
    {
      params: {
        sorting: params.sorting,
        skipCount: params.skipCount,
        maxResultCount: params.maxResultCount,
      },
      signal,
    }
  );

  return data;
};

const getAiModelEdition = async (
  params: IGetAiModelEditionParams,
  signal?: AbortSignal
): Promise<IAiModelEditionDetail> => {
  const { data } = await axiosInstance.get<IAiModelEditionDetail>(
    apiPath(
      `/api/v1/orgs/${params.orgId}/ai-models/${params.modelId}/editions/${params.edition}`
    ),
    { signal }
  );

  return data;
};

const patchAiModelEdition = async (
  params: IUpdateAiModelEditionPayload
): Promise<IAiModelEditionDetail> => {
  const { data } = await axiosInstance.patch<IAiModelEditionDetail>(
    apiPath(
      `/api/v1/orgs/${params.orgId}/ai-models/${params.modelId}/editions/${params.edition}`
    ),
    {
      description: params.description,
    }
  );

  return data;
};

const deleteAiModelEdition = async (
  params: IGetAiModelEditionParams
): Promise<IDeleteAiModelEditionResponse> => {
  const { data } = await axiosInstance.delete<IDeleteAiModelEditionResponse>(
    apiPath(
      `/api/v1/orgs/${params.orgId}/ai-models/${params.modelId}/editions/${params.edition}`
    )
  );

  return data;
};

const patchAiModel = async (
  params: IUpdateAiModelPayload
): Promise<IAiModelItem> => {
  const { data } = await axiosInstance.patch<IAiModelItem>(
    apiPath(`/api/v1/orgs/${params.orgId}/ai-models/${params.modelId}`),
    {
      modelName: params.modelName,
      description: params.description,
    }
  );

  return data;
};

const postAiModel = async (
  params: ICreateAiModelPayload
): Promise<IAiModelItem> => {
  const { data } = await axiosInstance.post<IAiModelItem>(
    apiPath(`/api/v1/orgs/${params.orgId}/ai-models`),
    {
      modelName: params.modelName,
      description: params.description,
    }
  );

  return data;
};

const deleteAiModel = async (
  params: IAiModelIdParams
): Promise<IDeleteAiModelResponse> => {
  const { data } = await axiosInstance.delete<IDeleteAiModelResponse>(
    apiPath(`/api/v1/orgs/${params.orgId}/ai-models/${params.modelId}`)
  );

  return data;
};

const postAiModelEdition = async (
  params: ICreateAiModelEditionPayload
): Promise<IAiModelEditionDetail> => {
  const { data } = await axiosInstance.post<IAiModelEditionDetail>(
    apiPath(
      `/api/v1/orgs/${params.orgId}/ai-models/${params.modelId}/editions`
    ),
    {
      edition: params.edition,
      fileName: params.fileName,
      fileSize: params.fileSize,
      fileHash: params.fileHash,
      description: params.description,
      changeSummary: params.changeSummary,
    }
  );

  return data;
};

const getAiModelEditions = async (
  params: IGetAiModelEditionsParams,
  signal?: AbortSignal
): Promise<IAiModelEditionsListResponse> => {
  const { data } = await axiosInstance.get<IAiModelEditionsListResponse>(
    apiPath(
      `/api/v1/orgs/${params.orgId}/ai-models/${params.modelId}/editions`
    ),
    {
      params: {
        status: params.status,
        sorting: params.sorting,
        skipCount: params.skipCount,
        maxResultCount: params.maxResultCount,
      },
      signal,
    }
  );

  return data;
};

const postAiModelDeployment = async (
  params: ICreateAiModelDeploymentPayload
): Promise<IAiModelDeployment> => {
  const { data } = await axiosInstance.post<IAiModelDeployment>(
    apiPath(
      `/api/v1/orgs/${params.orgId}/ai-models/${params.modelId}/editions/${params.edition}:deploy`
    ),
    {
      targets: params.targets,
      description: params.description,
    }
  );

  return data;
};

const getDeviceAiModels = async (
  params: IGetAiModelDeviceDeploymentsParams,
  signal?: AbortSignal
): Promise<IAiModelDeviceDeploymentsResponse> => {
  const { data } = await axiosInstance.get<IAiModelDeviceDeploymentsResponse>(
    apiPath(`/api/v1/devices/${params.deviceId}/ai-models`),
    {
      params: {
        state: params.state,
        skipCount: params.skipCount,
        maxResultCount: params.maxResultCount,
      },
      signal,
    }
  );

  return data;
};

const getAiModelEditionDeployments = async (
  params: IGetAiModelEditionDeploymentsParams,
  signal?: AbortSignal
): Promise<IAiModelEditionDeploymentsResponse> => {
  const { data } = await axiosInstance.get<IAiModelEditionDeploymentsResponse>(
    apiPath(
      `/api/v1/orgs/${params.orgId}/ai-models/${params.modelId}/editions/${params.edition}/deployments`
    ),
    {
      params: {
        state: params.state,
        skipCount: params.skipCount,
        maxResultCount: params.maxResultCount,
      },
      signal,
    }
  );

  return data;
};

const deleteAiModelEditionDeployments = async (
  params: IGetAiModelEditionParams
): Promise<void> => {
  await axiosInstance.delete(
    apiPath(
      `/api/v1/orgs/${params.orgId}/ai-models/${params.modelId}/editions/${params.edition}/deployments`
    )
  );
};

const deleteAiModelFromDevice = async (
  params: IDeleteAiModelFromDeviceParams
): Promise<void> => {
  await axiosInstance.delete(
    apiPath(
      `/api/v1/devices/${params.deviceId}/ai-models/${params.modelId}/editions/${params.edition}`
    )
  );
};

const TUS_RESUMABLE_VERSION = '1.0.0';

const getAiModelUploadStatus = async (
  params: IAiModelUploadIdParams,
  signal?: AbortSignal
): Promise<IAiModelUploadStatus> => {
  const { data } = await axiosInstance.get<IAiModelUploadStatus>(
    apiPath(
      `/api/v1/orgs/${params.orgId}/ai-models/${params.modelId}/editions/${params.edition}/uploads/${params.uploadId}/status`
    ),
    { signal }
  );

  return data;
};

const postAiModelUploadSession = async (
  params: ICreateAiModelUploadSessionParams
): Promise<IAiModelUploadSessionResult> => {
  const response = await axiosInstance.post(
    apiPath(
      `/api/v1/orgs/${params.orgId}/ai-models/${params.modelId}/editions/${params.edition}/uploads`
    ),
    undefined,
    {
      headers: {
        'Tus-Resumable': params.tusResumable ?? TUS_RESUMABLE_VERSION,
        'Upload-Length': params.uploadLength,
        'Upload-Metadata': `uploadId ${btoa(params.uploadId)}`,
      },
    }
  );

  return {
    location: response.headers.location ?? null,
    tusResumable: response.headers['tus-resumable'] ?? null,
  };
};

const getAiModelUploadOffset = async (
  params: IAiModelTusParams
): Promise<IGetAiModelUploadOffsetResult> => {
  const response = await axiosInstance.head(
    apiPath(
      `/api/v1/orgs/${params.orgId}/ai-models/${params.modelId}/editions/${params.edition}/uploads/${params.uploadId}`
    ),
    {
      headers: {
        'Tus-Resumable': params.tusResumable ?? TUS_RESUMABLE_VERSION,
      },
    }
  );

  const offset = response.headers['upload-offset'];
  const length = response.headers['upload-length'];

  return {
    uploadOffset: offset != null ? Number(offset) : null,
    uploadLength: length != null ? Number(length) : null,
  };
};

const patchAiModelUploadChunk = async (
  params: IUploadAiModelChunkParams
): Promise<IUploadAiModelChunkResult> => {
  const response = await axiosInstance.patch(
    apiPath(
      `/api/v1/orgs/${params.orgId}/ai-models/${params.modelId}/editions/${params.edition}/uploads/${params.uploadId}`
    ),
    params.chunk,
    {
      headers: {
        'Tus-Resumable': params.tusResumable ?? TUS_RESUMABLE_VERSION,
        'Upload-Offset': params.uploadOffset,
        'Content-Type': 'application/offset+octet-stream',
      },
    }
  );

  const offset = response.headers['upload-offset'];

  return {
    uploadOffset: offset != null ? Number(offset) : null,
  };
};

const deleteAiModelUpload = async (
  params: IAiModelTusParams
): Promise<void> => {
  await axiosInstance.delete(
    apiPath(
      `/api/v1/orgs/${params.orgId}/ai-models/${params.modelId}/editions/${params.edition}/uploads/${params.uploadId}`
    ),
    {
      headers: {
        'Tus-Resumable': params.tusResumable ?? TUS_RESUMABLE_VERSION,
      },
    }
  );
};

export const aiModelsApi = {
  getAiModels,
  postAiModel,
  deleteAiModel,
  getAiModelEdition,
  patchAiModelEdition,
  deleteAiModelEdition,
  patchAiModel,
  postAiModelEdition,
  getAiModelEditions,
  postAiModelDeployment,
  getDeviceAiModels,
  getAiModelEditionDeployments,
  deleteAiModelEditionDeployments,
  deleteAiModelFromDevice,
  getAiModelUploadStatus,
  postAiModelUploadSession,
  getAiModelUploadOffset,
  patchAiModelUploadChunk,
  deleteAiModelUpload,
};
