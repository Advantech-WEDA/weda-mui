import { useDeviceTelemetryTab } from '../../../hooks/useDeviceTelemetryTab';
import TelemetryView from './TelemetryView';

interface IProps {
  loading: boolean;
  onFetchTelemetryTable: () => Promise<unknown>;
}

export default function Telemetry(props: IProps) {
  return <TelemetryView {...useDeviceTelemetryTab(props)} />;
}
