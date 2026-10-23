import { useStackDeploymentsTab } from '../../../hooks/useStackDeploymentsTab';
import DeploymentsView from './DeploymentsView';

export default function Deployments() {
  return <DeploymentsView {...useStackDeploymentsTab()} />;
}
