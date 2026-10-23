import { useEditionDeploymentsTab } from '../../../hooks/useEditionDeploymentsTab';
import DeploymentsView from './DeploymentsView';

export default function Deployments() {
  return <DeploymentsView {...useEditionDeploymentsTab()} />;
}
