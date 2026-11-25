import { RedeployStackDialog } from '@features/container-stacks';
import { DeleteConfirmDialog } from '@shared/ui';

import DeviceStackDetailContent from '@/features/devices/components/DeviceStackDetailContent';
import { useDeviceStackDetailPage } from '@/features/devices/hooks/useDeviceStackDetailPage';

export default function DeviceStackDetailPage() {
  const {
    loading,
    stackData,
    hasPermission,
    deploymentStatus,
    dialogOpenDeleteStack,
    handleBack,
    handleDeploymentAction,
    handleCloseDeleteStack,
    handleConfirmDeleteStack,
    redeployDialog,
  } = useDeviceStackDetailPage();

  if (loading) return null;

  return (
    <>
      <DeviceStackDetailContent
        stackData={stackData}
        onBack={handleBack}
        hasPermission={hasPermission}
        deploymentStatus={deploymentStatus}
        onDeploymentAction={handleDeploymentAction}
      />

      <DeleteConfirmDialog
        open={dialogOpenDeleteStack}
        title="Delete Container Stack"
        content={`Are you sure you want to delete stack "${stackData.stackName}"? This action cannot be undone. All active deployments using this stack will continue to run but will no longer receive updates.`}
        confirmName={stackData.stackName ?? ''}
        nameLabel="stack"
        onClose={handleCloseDeleteStack}
        onConfirm={handleConfirmDeleteStack}
      />

      <RedeployStackDialog {...redeployDialog} />
    </>
  );
}
