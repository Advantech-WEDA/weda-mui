import type { StatusDialogContent } from './types';

export type ActivationAction = 'activate' | 'deactivate';

export function isDeviceOperational(
  status: string | null | undefined
): boolean {
  return status !== 'Registered' && status !== 'Deactivated';
}

export function isWedaNode(device: {
  hwModel?: string | null;
  parentDeviceId?: string | null;
}): boolean {
  return Boolean(device.hwModel) && !device.parentDeviceId;
}

export function supportsTelemetryConfig(device: {
  hwModel?: string | null;
  parentDeviceId?: string | null;
}): boolean {
  return isWedaNode(device) || Boolean(device.parentDeviceId);
}

export function canDeleteDevice(status: string | null | undefined): boolean {
  return status === 'Deactivated';
}

export function getActivationAction(
  status: string | null | undefined
): ActivationAction {
  return status === 'Deactivated' ? 'activate' : 'deactivate';
}

export function canChangeActivation(
  status: string | null | undefined
): boolean {
  return status !== 'Registered';
}

export function buildActivationSuccessMsg(action: ActivationAction): string {
  return action === 'activate'
    ? 'Device activated successfully'
    : 'Device deactivated successfully';
}

export const ACTIVATION_ACTION_LABEL_MAP: Record<ActivationAction, string> = {
  activate: 'Activate',
  deactivate: 'Deactivate',
};

export type DeviceStatusDialogSurface = 'list' | 'detail';

export interface DeviceStatusDialogSubject {
  deviceName: string | undefined;
  status: string | undefined;
}

const STATUS_DIALOG_BODY: Record<
  ActivationAction,
  (deviceName: string | undefined) => string
> = {
  activate: (deviceName) =>
    `Activating this device will allow it to receive stack deployments and report telemetry. Are you sure you want to activate device "${deviceName}"?`,
  deactivate: (deviceName) =>
    `Deactivating this device will stop all running stacks and disconnect it from the organization. Are you sure you want to deactivate device "${deviceName}"?`,
};

export function buildStatusDialogContent(
  device: DeviceStatusDialogSubject | null,
  surface: DeviceStatusDialogSurface
): StatusDialogContent {
  if (!device && surface === 'list') {
    return { title: '', content: '', confirmLabel: '' };
  }

  const action = getActivationAction(device?.status);
  const label = ACTIVATION_ACTION_LABEL_MAP[action];

  return {
    title: `${label} Device`,
    content: STATUS_DIALOG_BODY[action](device?.deviceName),
    confirmLabel: label,
  };
}
