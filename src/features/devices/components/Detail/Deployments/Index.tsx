import type {
  IDeploymentItem,
  IGetListStacksInDeviceParams,
} from '@features/container-stacks';

import { useDeviceStacksTab } from '../../../hooks/useDeviceStacksTab';
import StacksView from './StacksView';

interface IProps {
  deploymentItems: IDeploymentItem[];
  loading: boolean;
  totalCount: number;
  rowsPerPage: number;
  onRowsPerPageChange: (rows: number) => void;
  onFetchDeployments: (
    params: Omit<IGetListStacksInDeviceParams, 'deviceId'>,
    signal?: AbortSignal
  ) => Promise<unknown>;
}

export default function Deployments(props: IProps) {
  return <StacksView {...useDeviceStacksTab(props)} />;
}
