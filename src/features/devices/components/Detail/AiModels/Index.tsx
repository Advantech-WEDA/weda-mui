import type {
  IAiModelDeviceDeploymentsResponse,
  IGetAiModelDeviceDeploymentsParams,
} from '@features/ai-models';

import { useDeviceAiModelsTab } from '../../../hooks/useDeviceAiModelsTab';
import AiModelsView from './AiModelsView';

interface IProps {
  aiModelDeviceDeploymentsList: IAiModelDeviceDeploymentsResponse | null;
  loading: boolean;
  rowsPerPage: number;
  onRowsPerPageChange: (rows: number) => void;
  onFetchDeviceAiModels: (
    params: Omit<IGetAiModelDeviceDeploymentsParams, 'deviceId'>,
    signal?: AbortSignal
  ) => Promise<unknown>;
}

export default function AiModels({ loading, ...input }: IProps) {
  return <AiModelsView {...useDeviceAiModelsTab({ loading, ...input })} />;
}
