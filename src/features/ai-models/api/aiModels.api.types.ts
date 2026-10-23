import type { IDataStreamsLatestResponse } from '@features/devices';

import type { DeploymentDeviceState } from '@/features/ai-models/domain/types';

export type { DeploymentDeviceState };

export interface IGetAiModelsParams {
  orgId: string;
  sorting?: string;
  skipCount?: number;
  maxResultCount?: number;
}

export interface IGetAiModelEditionParams {
  orgId: string;
  modelId: string;
  edition: string;
}

export type AiModelEditionStatus = 'Pending' | 'Uploaded';

export interface IAiModelEditionFile {
  fileId: string | null;
  fileName: string | null;
  fileSize: number;
  fileHash: string | null;
  hashAlg: string | null;
  fileUri: string | null;
}

export interface IAiModelEditionDetail {
  uploadId: string | null;
  modelId: string;
  modelName: string | null;
  edition: string | null;
  description: string | null;
  tenantId: string | null;
  orgId: string;
  changeSummary: string | null;
  status: AiModelEditionStatus | null;

  file?: IAiModelEditionFile | null;
  tusEndpoint: string | null;
  maxFileSize: number | null;
  uploadExpiresAt: string | null;
}

export interface IUpdateAiModelEditionPayload {
  orgId: string;
  modelId: string;
  edition: string;
  description: string;
}

export interface IDeleteAiModelEditionResponse {
  modelId: string;
  edition: string | null;
  deleted: boolean;
  deletedAt: string;
  deletedBy: string | null;
  storageFreedBytes: number;
  note: string | null;
}

export interface IAiModelItem {
  modelId: string;
  modelName: string | null;
  tenantId: string | null;
  orgId: string;
  description: string | null;
}

export interface IAiModelsListResponse {
  items: IAiModelItem[] | null;
  totalCount: number;
}

export interface IUpdateAiModelPayload {
  orgId: string;
  modelId: string;
  modelName?: string | null;
  description?: string | null;
}

export interface IAiModelIdParams {
  orgId: string;
  modelId: string;
}

export interface IDeleteAiModelResponse {
  modelId: string;
  modelName: string | null;
  deleted: boolean;
  deletedAt: string;
  deletedBy: string | null;
  editionsDeleted: number;
  storageFreedBytes: number;
  note: string | null;
}

export interface ICreateAiModelPayload {
  orgId: string;
  modelName: string;
  description?: string | null;
}

export interface ICreateAiModelEditionPayload {
  orgId: string;
  modelId: string;
  edition: string;
  fileName?: string | null;
  fileSize?: number | null;
  fileHash?: string | null;
  description?: string | null;
  changeSummary?: string | null;
}

export interface IGetAiModelEditionsParams {
  orgId: string;
  modelId: string;
  status?: string;
  sorting?: string;
  skipCount?: number;
  maxResultCount?: number;
}

export interface IAiModelEditionListItem {
  modelId: string;
  modelName: string | null;
  edition: string | null;
  tenantId: string | null;
  orgId: string;
  description: string | null;
  status: UploadStatus | null;
  uploadId: string | null;

  file?: IAiModelEditionFile | null;
}

export interface IAiModelEditionsListResponse {
  items: IAiModelEditionListItem[] | null;
  totalCount: number;
}

export type PreCmdAction = 'NOOP' | 'CHECK_DISK_USAGE';
export type ValidateCmdAction = 'NOOP' | 'CHECKSUM_VERIFY';
export type ApplyCmdAction = 'NOOP' | 'ATOMIC_SWAP_AND_RESTART_CONTAINER';
export type PostCmdAction = 'NOOP';

export interface IAiModelPreCmd {
  action: PreCmdAction;
  params?: Record<string, string> | null;
}

export interface IAiModelValidateCmd {
  action: ValidateCmdAction;
  params?: Record<string, string> | null;
}

export interface IAiModelApplyCmd {
  action: ApplyCmdAction;
  params?: Record<string, string> | null;
}

export interface IAiModelPostCmd {
  action: PostCmdAction;
  params?: Record<string, string> | null;
}

export interface IAiModelDeploymentAcl {
  allowedSubnets?: string[] | null;
  allowedContainers?: string[] | null;
}

export interface IAiModelDeploymentTask {
  acl?: IAiModelDeploymentAcl;
  preCmd?: IAiModelPreCmd;
  validateCmd?: IAiModelValidateCmd;
  applyCmd?: IAiModelApplyCmd;
  postCmd?: IAiModelPostCmd;
}

export interface IAiModelDeploymentTarget {
  deviceIdList: string[];
  tasks?: IAiModelDeploymentTask[] | null;
}

export interface ICreateAiModelDeploymentPayload {
  orgId: string;
  modelId: string;
  edition: string;
  targets: IAiModelDeploymentTarget[];
  description?: string | null;
}

export type DeploymentAggregateState =
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'PARTIAL_FAILED'
  | 'FAILED';

export interface IAiModelDeploymentTargetResult {
  deviceId: string | null;
  deviceDeploymentId?: string;
  edgeFilePath: string | null;
  state: DeploymentDeviceState;
}

export interface IAiModelDeployment {
  modelDeploymentId?: string;
  modelId: string | null;
  edition: string | null;
  status: DeploymentAggregateState;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  targets: IAiModelDeploymentTargetResult[] | null;
}

export interface IGetAiModelDeviceDeploymentsParams {
  deviceId: string;
  state?: DeploymentDeviceState;
  skipCount?: number;
  maxResultCount?: number;
}

export interface IAiModelDeviceDeploymentItem {
  modelId: string | null;
  modelName: string | null;
  edition: string | null;
  tenantId: string | null;
  orgId: string | null;
  deviceId: string | null;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  deploymentStartTime: string | null;
  deploymentEndTime: string | null;
  deviceDeploymentId: string;
  edgeFilePath: string | null;
  state: DeploymentDeviceState;

  rejectedReason: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
}

export interface IAiModelDeviceDeploymentsResponse {
  items: IAiModelDeviceDeploymentItem[] | null;
  totalCount: number;
  skipCount: number;
  maxResultCount: number;
  totalPages: number;
}

export interface IGetAiModelEditionDeploymentsParams {
  orgId: string;
  modelId: string;
  edition: string;
  state?: DeploymentDeviceState;
  skipCount?: number;
  maxResultCount?: number;
}

export interface IAiModelEditionDeploymentItem {
  deviceId: string | null;
  modelId: string | null;
  modelName: string | null;
  edition: string | null;
  tenantId: string | null;
  orgId: string | null;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  deploymentStartTime: string | null;
  deploymentEndTime: string | null;
  deviceDeploymentId: string;
  edgeFilePath: string | null;
  state: DeploymentDeviceState;

  rejectedReason: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  lastTransitionTime: string;
}

export interface IAiModelEditionDeploymentsResponse {
  items: IAiModelEditionDeploymentItem[] | null;
  totalCount: number;
  skipCount: number;
  maxResultCount: number;
  totalPages: number;
}

export interface IDeleteAiModelFromDeviceParams {
  deviceId: string;
  modelId: string;
  edition: string;
}

export type UploadStatus =
  | 'Pending'
  | 'Uploading'
  | 'Verifying'
  | 'Uploaded'
  | 'UploadFailed'
  | 'VerifyFailed';

export interface IAiModelUploadIdParams {
  orgId: string;
  modelId: string;
  edition: string;
  uploadId: string;
}

export interface IAiModelUploadStatus {
  status: UploadStatus;
  uploadExpiresAt?: string;
}

export interface IAiModelTusParams extends IAiModelUploadIdParams {
  tusResumable?: string;
}

export interface ICreateAiModelUploadSessionParams extends IAiModelTusParams {
  uploadLength: number;
}

export interface IAiModelUploadSessionResult {
  location: string | null;
  tusResumable: string | null;
}

export interface IGetAiModelUploadOffsetResult {
  uploadOffset: number | null;
  uploadLength: number | null;
}

export interface IUploadAiModelChunkParams extends IAiModelTusParams {
  uploadOffset: number;
  chunk: Blob | ArrayBuffer;
}

export interface IUploadAiModelChunkResult {
  uploadOffset: number | null;
}

export interface AiModelEditionWithDeviceCount extends IAiModelEditionListItem {
  deployedDeviceCount: number;
}

export interface AiModelWithEditions extends IAiModelItem {
  editions: AiModelEditionWithDeviceCount[];
}

export const DEFAULT_AI_MODEL_DEPLOYMENT_TASKS: IAiModelDeploymentTask[] = [
  {
    preCmd: {
      action: 'CHECK_DISK_USAGE',
      params: { maxUsagePercent: '95' },
    },
    validateCmd: {
      action: 'NOOP',
      params: {},
    },
    applyCmd: {
      action: 'NOOP',
      params: {},
    },
    postCmd: {
      action: 'NOOP',
      params: {},
    },
  },
];

export interface DeployDeviceRow {
  deviceId: string;
  deviceName: string;

  hwModel: string | null;
  parentDeviceId?: string | null;
  orgId: string;
  status: string;
  createdAt: string;
  lastSeen?: string;
  latestData?: IDataStreamsLatestResponse;
  deploymentStatus?: string | null;
  deployedEditions?: string;
}
