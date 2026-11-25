import type { AnalyzerType, DataAssemblyOnTimeout } from '../domain/types';

export interface IAnalyzerInputParameter {
  parameterName: string;

  dataStreamId: string;
}

export interface IAnalyzerOutput {
  dataStreamId: string;

  valueJsonPath?: string | null;

  timeJsonPath?: string | null;
}

export interface ITransferFunctionConfig {
  expression: string;
}

export interface IJavaScriptConfig {
  script: string;
}

export interface IDataAssemblyPolicy {
  queueLimit?: number | null;

  timeoutSeconds?: number | null;

  onTimeout?: DataAssemblyOnTimeout;
}

export interface IResolvedDataAssemblyPolicy {
  queueLimit: number;
  timeoutSeconds: number;
  onTimeout: DataAssemblyOnTimeout;
}

export interface IAnalyzerItem {
  analyzerId: string;

  isEnabled: boolean;
  name: string | null;
  description: string | null;
  type: AnalyzerType;
  inputParameters: IAnalyzerInputParameter[] | null;

  config: Partial<ITransferFunctionConfig> & Partial<IJavaScriptConfig>;
  outputs: IAnalyzerOutput[] | null;

  dataAssemblyPolicy: IResolvedDataAssemblyPolicy | null;

  createdAt: string;

  updatedAt: string | null;
}

export interface IAnalyzersList {
  items: IAnalyzerItem[] | null;
  totalCount: number;
}

interface ICreateAnalyzerRequestBase {
  name: string;

  description?: string | null;

  inputParameters: IAnalyzerInputParameter[];

  dataAssemblyPolicy?: IDataAssemblyPolicy;
}

export interface ICreateTransferFunctionAnalyzerRequest extends ICreateAnalyzerRequestBase {
  type: 'TransferFunction';

  inputParameters: IAnalyzerInputParameter[];
  config: ITransferFunctionConfig;

  outputs: [IAnalyzerOutput];
}

export interface ICreateJavaScriptAnalyzerRequest extends ICreateAnalyzerRequestBase {
  type: 'JavaScript';

  inputParameters: IAnalyzerInputParameter[];
  config: IJavaScriptConfig;

  outputs: IAnalyzerOutput[];
}

export type ICreateAnalyzerRequest =
  | ICreateTransferFunctionAnalyzerRequest
  | ICreateJavaScriptAnalyzerRequest;

export type IUpdateAnalyzerRequest = ICreateAnalyzerRequest;

export interface IPatchAnalyzerRequest {
  name?: string | null;

  description?: string | null;

  inputParameters?: IAnalyzerInputParameter[] | null;

  config?: { expression?: string | null; script?: string | null };

  outputs?: IAnalyzerOutput[] | null;

  dataAssemblyPolicy?: IDataAssemblyPolicy;
}
