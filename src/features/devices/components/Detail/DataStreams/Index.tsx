import { useDeviceDataStreamsTab } from '../../../hooks/useDeviceDataStreamsTab';
import DataStreamsView from './DataStreamsView';

export default function DataStreams() {
  return <DataStreamsView {...useDeviceDataStreamsTab()} />;
}
