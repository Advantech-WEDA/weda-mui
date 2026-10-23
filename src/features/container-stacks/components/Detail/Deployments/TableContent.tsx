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
  Typography,
} from '@mui/material';
import { getAppBasePath } from '@shared/lib/appRoute';
import { formatLocalTime } from '@shared/lib/dayjs';
import { AppChip, SvgIcon } from '@shared/ui';
import { Fragment, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';

import {
  getDeploymentActions,
  isDeploymentApiAction,
  isRedeployAction,
  isRemoveAction,
} from '../../../domain/deployment.rules';
import {
  type Action,
  type DeploymentAction,
  type DeploymentDeviceRow,
} from '../../../domain/types';
import {
  DEPLOYMENT_ACTION_ICON_MAP,
  DEPLOYMENT_ACTION_LABEL_MAP,
} from '../../deploymentActionDisplay';
import {
  containerStatusChipProps,
  deploymentStatusChipProps,
} from '../../deploymentStatusChip';

interface IProps {
  row: DeploymentDeviceRow;
  hasPermission: boolean;
  onDeploy: (
    deviceId: string,
    stackConfigId: string,
    stackRevisionId: string
  ) => void;
  onAction: (deviceId: string, stackConfigId: string, action: Action) => void;
  onDeleteStack: (stackConfigId: string, deviceId: string) => void;
}

export default function TableContent({
  row,
  hasPermission,
  onAction,
  onDeploy,
  onDeleteStack,
}: IProps) {
  const [open, setOpen] = useState(true);
  const { stackRevisionId, stackConfigId, tenant } = useParams<{
    stackRevisionId: string;
    stackConfigId: string;
    tenant: string;
  }>();

  const [moreAnchorEl, setMoreAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<string>('');

  if (!tenant) {
    throw new Error('TableContent must be rendered under a /:tenant route');
  }

  const moreMenuOpen = Boolean(moreAnchorEl);

  const renderActionButton = (action: DeploymentAction, deviceId: string) => (
    <Tooltip
      key={`${deviceId}-${action}`}
      title={DEPLOYMENT_ACTION_LABEL_MAP[action]}
    >
      <span style={{ display: 'inline-flex' }}>
        <IconButton
          size="small"
          disabled={!hasPermission}
          onClick={() => handleDeploymentAction(action, deviceId)}
        >
          <SvgIcon
            name={DEPLOYMENT_ACTION_ICON_MAP[action]}
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
    action: DeploymentAction,
    deviceId: string
  ) => {
    if (isRemoveAction(action)) {
      if (stackConfigId) {
        onDeleteStack(stackConfigId, deviceId);
      }
      return;
    }

    if (isRedeployAction(action)) {
      if (stackConfigId && stackRevisionId) {
        onDeploy(row.deviceId, stackConfigId, stackRevisionId);
      }
      return;
    }

    if (isDeploymentApiAction(action)) {
      if (stackConfigId) {
        onAction(row.deviceId, stackConfigId, action);
      }
    }
  };

  return (
    <Fragment>
      <TableRow hover>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" onClick={() => setOpen((prev) => !prev)}>
              <SvgIcon
                name={open ? 'ExpandMoreFilled' : 'ChevronRightFilled'}
                sx={{ color: 'var(--action-active)' }}
              />
            </IconButton>
            <Box>
              <Typography
                variant="body2"
                className="page-table__info-name"
                sx={{ color: 'var(--primary-main, #1976d2)', fontWeight: 500 }}
                color="text.primary"
              >
                <Link
                  component={RouterLink}
                  to={`${getAppBasePath(tenant)}/devices/${row.deviceId}/container-stacks`}
                  state={{ device: row }}
                  underline="hover"
                  color="inherit"
                >
                  {row.deviceName ?? '-'}
                </Link>
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {row.deviceId ?? '-'}
              </Typography>
            </Box>
          </Box>
        </TableCell>

        <TableCell>
          {row.status ? (
            <AppChip {...containerStatusChipProps(row.status)} />
          ) : (
            '-'
          )}
        </TableCell>

        <TableCell>
          {row.dateCreated ? formatLocalTime(row.dateCreated) : '-'}
        </TableCell>

        <TableCell sx={{ px: 2, py: 1 }}>
          {(() => {
            const actions = getDeploymentActions(row.status);
            const visibleActions = actions.slice(0, 2);
            const moreActions = actions.slice(2);
            const isCurrentMenu = selectedDeploymentId === row.id;

            return (
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                }}
              >
                {visibleActions.map((action) =>
                  renderActionButton(action, row.deviceId)
                )}

                {moreActions.length > 0 && (
                  <>
                    <Tooltip title="More">
                      <span
                        style={{
                          display: 'inline-flex',
                        }}
                      >
                        <IconButton
                          size="small"
                          disabled={!hasPermission}
                          onClick={(event) => handleMoreOpen(event, row.id)}
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
                      slotProps={{
                        paper: {
                          sx: {
                            minWidth: 140,
                            boxShadow: '0px 3px 8px rgba(0,0,0,0.16)',
                          },
                        },
                      }}
                    >
                      {moreActions.map((action) => (
                        <MenuItem
                          key={action}
                          onClick={() => {
                            handleMoreClose();

                            handleDeploymentAction(action, row.deviceId);
                          }}
                        >
                          <ListItemIcon>
                            {action === 'remove' ? (
                              <SvgIcon
                                name="DeleteOutlined"
                                sx={{
                                  color: !hasPermission
                                    ? 'var(--action-disabled)'
                                    : 'var(--action-active)',
                                }}
                              />
                            ) : (
                              <SvgIcon
                                name={DEPLOYMENT_ACTION_ICON_MAP[action]}
                                sx={{
                                  color: !hasPermission
                                    ? 'var(--action-disabled)'
                                    : 'var(--action-active)',
                                }}
                              />
                            )}
                          </ListItemIcon>

                          {DEPLOYMENT_ACTION_LABEL_MAP[action]}
                        </MenuItem>
                      ))}
                    </Menu>
                  </>
                )}
              </Box>
            );
          })()}
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell
          colSpan={4}
          sx={{
            p: 0,
            borderBottom: 0,
          }}
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box>
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
                </colgroup>

                <tbody>
                  {row.containers.map((container) => (
                    <TableRow
                      key={container.id}
                      hover
                      sx={{
                        '& td': {
                          borderBottom: '1px solid var(--divider)',
                        },
                      }}
                    >
                      <TableCell sx={{ pl: 8 }}>
                        <Typography variant="body2">
                          {container.name}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {container.state && (
                          <AppChip
                            {...deploymentStatusChipProps(
                              container.state.toLowerCase()
                            )}
                          />
                        )}
                      </TableCell>

                      <TableCell>-</TableCell>

                      <TableCell>-</TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}
