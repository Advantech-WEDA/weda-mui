import {
  type DeploySetup,
  isRestartContainerApply,
  normalizeChecksum,
} from '@/features/ai-models/domain/deploySetup';

import type {
  IAiModelDeploymentTarget,
  IAiModelDeploymentTask,
} from './aiModels.api.types';

const buildTask = (
  setup: DeploySetup,
  containerName?: string
): IAiModelDeploymentTask => ({
  preCmd:
    setup.preCheck === 'CHECK_DISK_USAGE'
      ? {
          action: 'CHECK_DISK_USAGE',
          params: { maxUsagePercent: setup.maxUsagePercent.trim() },
        }
      : { action: 'NOOP', params: {} },
  validateCmd:
    setup.validate === 'CHECKSUM_VERIFY'
      ? {
          action: 'CHECKSUM_VERIFY',
          params: {
            expectedChecksum: normalizeChecksum(setup.expectedChecksum),
            algorithm: setup.algorithm,
          },
        }
      : { action: 'NOOP', params: {} },
  applyCmd:
    isRestartContainerApply(setup.apply) && containerName
      ? {
          action: 'ATOMIC_SWAP_AND_RESTART_CONTAINER',
          params: { name: containerName },
        }
      : { action: 'NOOP', params: {} },
  postCmd: { action: setup.postCheck, params: {} },
});

export const buildDeploymentTargets = (
  setup: DeploySetup,
  deviceIds: string[],
  containerByDeviceId: Record<string, string>
): IAiModelDeploymentTarget[] => {
  if (!isRestartContainerApply(setup.apply)) {
    return [{ deviceIdList: deviceIds, tasks: [buildTask(setup)] }];
  }

  const devicesByContainer = new Map<string, string[]>();

  deviceIds.forEach((deviceId) => {
    const containerName = containerByDeviceId[deviceId];
    devicesByContainer.set(containerName, [
      ...(devicesByContainer.get(containerName) ?? []),
      deviceId,
    ]);
  });

  return Array.from(devicesByContainer, ([containerName, deviceIdList]) => ({
    deviceIdList,
    tasks: [buildTask(setup, containerName)],
  }));
};
