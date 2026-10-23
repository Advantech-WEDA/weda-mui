import {
  DEPLOYMENT_ACTION_ICON_MAP,
  DEPLOYMENT_ACTION_LABEL_MAP,
  type DeploymentAction,
  getDeploymentActions,
  type ICreateStackConfigPayload,
  StackInformation,
} from '@features/container-stacks';
import { DetailPageLayout, PageHeaderActionButtons } from '@shared/ui';

interface IProps {
  stackData: ICreateStackConfigPayload;
  onBack: () => void;
  hasPermission: boolean;
  deploymentStatus?: string;
  onDeploymentAction: (action: DeploymentAction) => void;
}

export default function DeviceStackDetailContent({
  stackData,
  onBack,
  hasPermission,
  deploymentStatus,
  onDeploymentAction,
}: IProps) {
  return (
    <DetailPageLayout
      title={stackData.stackName ?? '-'}
      onBack={onBack}
      tabs={[
        {
          label: 'Information',
          value: 'Information',
          component: (
            <StackInformation
              key={stackData?.stackName}
              stackData={stackData}
            />
          ),
        },
      ]}
      activeTab="Information"
      onChangeTab={() => {}}
      actions={
        <PageHeaderActionButtons
          maxVisible={4}
          actions={getDeploymentActions(deploymentStatus).map((action) => ({
            key: action,
            label: DEPLOYMENT_ACTION_LABEL_MAP[action],
            icon: DEPLOYMENT_ACTION_ICON_MAP[action],
            disabled: !hasPermission,
            onClick: () => onDeploymentAction(action),
          }))}
        />
      }
    />
  );
}
