import AnalyzersView from '@/features/devices/components/Detail/Analyzers/AnalyzersView.tsx';
import { useDeviceAnalyzersTab } from '@/features/devices/hooks/useDeviceAnalyzersTab';

export default function Analyzers() {
  return <AnalyzersView {...useDeviceAnalyzersTab()} />;
}
