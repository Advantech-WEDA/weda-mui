import { SimpleConfirmDialog } from '@shared/ui';

interface IProps {
  open: boolean;
  stackName?: string;
  version?: number | string;
  deviceName?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function RedeployStackDialog({
  open,
  stackName,
  version,
  deviceName,
  loading,
  onClose,
  onConfirm,
}: IProps) {
  const stack = stackName
    ? `"${stackName}"${version != null ? ` (v${version})` : ''}`
    : 'this stack';
  const device = deviceName ? `"${deviceName}"` : 'this device';

  return (
    <SimpleConfirmDialog
      open={open}
      title="Redeploy stack"
      content={`Are you sure you want to redeploy ${stack} to ${device}?`}
      confirmLabel="Redeploy"
      loading={loading}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
