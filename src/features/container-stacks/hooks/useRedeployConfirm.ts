import { useState } from 'react';

export interface RedeployTarget {
  deviceId: string;
  stackConfigId: string;
  stackRevisionId: string;
}

export function useRedeployConfirm(
  redeploy: (target: RedeployTarget) => Promise<void>
) {
  const [redeployTarget, setRedeployTarget] = useState<RedeployTarget | null>(
    null
  );
  const [redeployLoading, setRedeployLoading] = useState(false);

  const handleOpenRedeploy = (
    deviceId: string,
    stackConfigId: string,
    stackRevisionId: string
  ) => {
    setRedeployTarget({ deviceId, stackConfigId, stackRevisionId });
  };

  const handleCloseRedeploy = () => {
    setRedeployTarget(null);
  };

  const handleConfirmRedeploy = async () => {
    if (!redeployTarget) return;

    setRedeployLoading(true);

    try {
      await redeploy(redeployTarget);
    } finally {
      setRedeployLoading(false);
      setRedeployTarget(null);
    }
  };

  return {
    redeployTarget,
    redeployLoading,
    handleOpenRedeploy,
    handleCloseRedeploy,
    handleConfirmRedeploy,
  };
}
