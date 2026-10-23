import {
  Box,
  Collapse,
  IconButton,
  Link,
  ListItemIcon,
  Menu,
  MenuItem,
  TableCell,
  TableRow,
  Tooltip,
} from '@mui/material';
import { getAppBasePath } from '@shared/lib/appRoute';
import { formatLocalTime } from '@shared/lib/dayjs';
import {
  AppChip,
  PageTableActionsCell,
  PageTableInfoCell,
  PageTableRow,
  SvgIcon,
} from '@shared/ui';
import { Fragment, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';

import type { StackWithDeployments } from '../api/stacks.api.types';
import { getDeploymentActions } from '../domain/deployment.rules';
import { type Action, type DeploymentAction } from '../domain/types';
import {
  DEPLOYMENT_ACTION_ICON_MAP,
  DEPLOYMENT_ACTION_LABEL_MAP,
} from './deploymentActionDisplay';
import { containerStatusChipProps } from './deploymentStatusChip';

interface IProps {
  row: StackWithDeployments;
  hasPermission: boolean;
  onEdit: (stackConfigId: string, stackRevisionId: string) => void;
  onDeploy: (stackConfigId: string, stackRevisionId: string) => void;
  onRedeploy: (
    deviceId: string,
    stackConfigId: string,
    stackRevisionId: string
  ) => void;
  onAction: (deviceId: string, stackConfigId: string, action: Action) => void;
  onDelete: (row: StackWithDeployments) => void;
  onDeleteStack: (stackConfigId: string, deviceId: string) => void;
}

export default function TableContent({
  row,
  hasPermission,
  onEdit,
  onDeploy,
  onRedeploy,
  onAction,
  onDelete,
  onDeleteStack,
}: IProps) {
  const [open, setOpen] = useState(true);
  const [moreAnchorEl, setMoreAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<string>('');

  const moreMenuOpen = Boolean(moreAnchorEl);
  const { tenant } = useParams<'tenant'>();

  if (!tenant) {
    throw new Error('TableContent must be rendered under a /:tenant route');
  }

  const handleMoreOpen = (
    event: React.MouseEvent<HTMLElement>,
    deploymentId: string
  ) => {
    setMoreAnchorEl(event.currentTarget);
    setSelectedDeploymentId(deploymentId);
  };

  const handleMoreClose = () => {
    setMoreAnchorEl(null);
    setSelectedDeploymentId('');
  };

  const handleDeploymentAction = (
    deploymentAction: DeploymentAction,
    deviceId: string
  ) => {
    if (deploymentAction === 'remove') {
      onDeleteStack(row.stackConfigId, deviceId);
      return;
    }

    if (deploymentAction === 'redeploy') {
      onRedeploy(deviceId, row.stackConfigId, row.stackRevisionId);
      return;
    }

    onAction(deviceId, row.stackConfigId, deploymentAction as Action);
  };

  const renderActionButton = (
    deploymentAction: DeploymentAction,
    deviceId: string
  ) => {
    const label = DEPLOYMENT_ACTION_LABEL_MAP[deploymentAction];

    return (
      <Tooltip key={deploymentAction} title={label}>
        <span style={{ display: 'inline-flex' }}>
          <IconButton
            size="small"
            disabled={!hasPermission}
            onClick={() => handleDeploymentAction(deploymentAction, deviceId)}
          >
            <SvgIcon
              name={DEPLOYMENT_ACTION_ICON_MAP[deploymentAction]}
              sx={{
                color: !hasPermission
                  ? 'var(--action-disabled)'
                  : 'var(--action-active)',
              }}
            />
          </IconButton>
        </span>
      </Tooltip>
    );
  };

  return (
    <Fragment>
      <PageTableRow hover>
        <TableCell sx={{ px: 2, py: 1, height: '56px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" onClick={() => setOpen((prev) => !prev)}>
              <SvgIcon
                name={open ? 'ExpandMoreFilled' : 'ChevronRightFilled'}
                sx={{ color: 'var(--action-active)' }}
              />
            </IconButton>

            <PageTableInfoCell
              primary={
                <Link
                  component={RouterLink}
                  to={`${getAppBasePath(tenant)}/container-stacks/${row.stackConfigId}/${row.stackRevisionId}/information`}
                  underline="hover"
                  sx={{ color: 'var(--primary-main, #1976D2)' }}
                >
                  {row.stackName} (v{row.version})
                </Link>
              }
            />
          </Box>
        </TableCell>

        <TableCell sx={{ px: 2, py: 1 }}>{row.type}</TableCell>
        <TableCell sx={{ px: 2, py: 1 }}>-</TableCell>

        <TableCell sx={{ px: 2, py: 1 }}>
          {row.createdAt ? formatLocalTime(row.createdAt) : '-'}
        </TableCell>

        <TableCell sx={{ px: 2, py: 1 }}>
          <PageTableActionsCell
            actions={[
              {
                key: 'deploy',
                label: 'Deploy',
                icon: 'InstallDesktopOutlined',
                disabled: !hasPermission,
                onClick: () => onDeploy(row.stackConfigId, row.stackRevisionId),
              },
              {
                key: 'edit',
                label: 'Edit',
                icon: 'EditOutlined',
                disabled: !hasPermission,
                onClick: () => onEdit(row.stackConfigId, row.stackRevisionId),
              },
              {
                key: 'delete',
                label: 'Delete',
                icon: 'DeleteOutlined',
                disabled: !hasPermission,
                onClick: () => onDelete(row),
              },
            ]}
          />
        </TableCell>
      </PageTableRow>

      {row.deployments.length > 0 && (
        <TableRow>
          <TableCell colSpan={5} sx={{ p: 0, borderBottom: 0 }}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  tableLayout: 'fixed',
                }}
              >
                <colgroup>
                  <col />
                  <col style={{ width: 200 }} />
                  <col style={{ width: 200 }} />
                  <col style={{ width: 200 }} />
                  <col style={{ width: 200 }} />
                </colgroup>

                <tbody>
                  {row.deployments.map((deployment) => {
                    const actions = getDeploymentActions(deployment.status);
                    const visibleActions = actions.slice(0, 2);

                    const moreActions = actions.slice(2);
                    const isCurrentMenu =
                      selectedDeploymentId === deployment.deploymentId;

                    return (
                      <PageTableRow key={deployment.deploymentId} hover>
                        <TableCell sx={{ pl: 8, py: 1, height: '56px' }}>
                          <PageTableInfoCell
                            primary={
                              <Box
                                component="span"
                                sx={{ color: 'var(--primary-main, #1976D2)' }}
                              >
                                {deployment.deviceName ?? '-'}
                              </Box>
                            }
                            secondary={deployment.deviceId ?? '-'}
                          />
                        </TableCell>

                        <TableCell sx={{ px: 2, py: 1 }}>-</TableCell>

                        <TableCell sx={{ px: 2, py: 1 }}>
                          {deployment.status ? (
                            <AppChip
                              {...containerStatusChipProps(deployment.status)}
                            />
                          ) : (
                            '-'
                          )}
                        </TableCell>

                        <TableCell sx={{ px: 2, py: 1 }}>
                          {deployment.createdAt
                            ? formatLocalTime(deployment.createdAt)
                            : '-'}
                        </TableCell>

                        <TableCell sx={{ px: 2, py: 1 }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {visibleActions.map((action) =>
                              renderActionButton(action, deployment.deviceId)
                            )}

                            {moreActions.length > 0 && (
                              <>
                                <Tooltip title="More">
                                  <span style={{ display: 'inline-flex' }}>
                                    <IconButton
                                      size="small"
                                      disabled={!hasPermission}
                                      onClick={(event) =>
                                        handleMoreOpen(
                                          event,
                                          deployment.deploymentId
                                        )
                                      }
                                    >
                                      <SvgIcon
                                        name="MoreVertFilled"
                                        sx={{
                                          color: !hasPermission
                                            ? 'var(--action-disabled)'
                                            : 'var(--action-active)',
                                        }}
                                      />
                                    </IconButton>
                                  </span>
                                </Tooltip>

                                <Menu
                                  className="more-menu"
                                  anchorEl={moreAnchorEl}
                                  open={moreMenuOpen && isCurrentMenu}
                                  onClose={handleMoreClose}
                                  anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                  }}
                                  transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                  }}
                                >
                                  {moreActions.map((action) => (
                                    <MenuItem
                                      key={action}
                                      onClick={() => {
                                        handleMoreClose();
                                        handleDeploymentAction(
                                          action,
                                          deployment.deviceId
                                        );
                                      }}
                                    >
                                      <ListItemIcon>
                                        <SvgIcon
                                          name={
                                            DEPLOYMENT_ACTION_ICON_MAP[action]
                                          }
                                          sx={{
                                            color: !hasPermission
                                              ? 'var(--action-disabled)'
                                              : 'var(--action-active)',
                                          }}
                                        />
                                      </ListItemIcon>
                                      {DEPLOYMENT_ACTION_LABEL_MAP[action]}
                                    </MenuItem>
                                  ))}
                                </Menu>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </PageTableRow>
                    );
                  })}
                </tbody>
              </table>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
}
