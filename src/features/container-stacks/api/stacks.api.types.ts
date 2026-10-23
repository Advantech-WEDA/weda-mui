import type { IDataStreamsLatestResponse } from '@features/devices';

import type { Action } from '../domain/types';

export interface IDeploymentContainerItem {
  id: string;
  name: string;
  state: string;
  error: string | null;
}

export interface IDeploymentItem {
  stackConfigId: string;
  stackRevisionId: string;
  deploymentId: string;
  taskId: string;
  stackName: string;
  deviceId: string;
  deviceName?: string;
  version: string;
  status: string;
  containers: IDeploymentContainerItem[];
  error: string | null;
  operationAction: string | null;
  operationStatus: string | null;
  reason: string | null;
  active: boolean;
  createdAt: string;
}

export interface IDeploymentListResponse {
  totalCount: number;
  items: IDeploymentItem[];
}

export interface IGetDeploymentsParams {
  orgId: string;
  stackRevisionId?: string[];
  stackNames?: string[];
  deviceIds?: string[];
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
}

export interface IGetStackConfigsParams {
  orgId: string;
  stackName?: string;
  type?: string;
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
}

export type IStackEnvironment = Record<
  string,
  string | number | boolean | null
>;

export interface IStackConfigsItem {
  stackConfigId: string;
  stackRevisionId: string;
  stackName: string;
  type: string;
  composeFileContent: string;
  environment?: IStackEnvironment;
  description: string;
  createdAt: string;
  orgId: string;
  version: number;
}

export type StackWithDeployments = IStackConfigsItem & {
  deployments: IDeploymentItem[];
};

export type DeploymentWithDeviceName = IDeploymentItem & {
  deviceName?: string;
};

export interface IStackConfigsListResponse {
  totalCount: number;
  items: IStackConfigsItem[];
}

export interface ICreateStackConfigPayload {
  orgId: string;
  stackName: string;
  type: string;
  composeFileContent: string;
  environment?: IStackEnvironment;
  description?: string;
}

export interface IGetStackConfigByIdParams {
  orgId: string;
  stackConfigId: string;
  stackRevisionId: string;
}

export interface IDeleteStackFromDeviceParams {
  deviceId: string;
  stackConfigId: string;
}

export interface IUpdateStackConfigPayload {
  orgId: string;
  stackConfigId: string;
  composeFileContent: string;
  environment?: IStackEnvironment;
  description?: string;
}

export interface IStackActionPayload {
  deviceId: string;
  stackConfigId: string;
  action: Action;
}

export interface IStackActionResponse {
  deviceId: string;
  seqId: number;
  reqSeqId: string;
  rspSeqId: string;
  cmd: string;
  status: number;
  message: string;
}

export interface IDeployStackToDevicesPayload {
  orgId: string;
  stackConfigId: string;
  stackRevisionId: string;
  deviceIds: string[];
}

export interface IGetListStacksInDeviceParams {
  deviceId: string;
  stackConfigId?: string;
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
}

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
}
