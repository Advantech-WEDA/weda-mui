import {
  type Action,
  DEPLOYMENT_ACTION_ICON_MAP,
  DEPLOYMENT_ACTION_LABEL_MAP,
  type DeploymentAction,
  deploymentStatusChipProps,
  getDeploymentActions,
  type IDeploymentItem,
  isDeploymentApiAction,
  isRedeployAction,
  isRemoveAction,
} from '@features/container-stacks';
import {
  Box,
  Collapse,
  IconButton,
  Link,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { getAppBasePath } from '@shared/lib/appRoute';
import { formatLocalTime } from '@shared/lib/dayjs';
import { AppChip, PageTableActionsCell, SvgIcon } from '@shared/ui';
import { Fragment, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';

interface IProps {
  row: IDeploymentItem;
  hasPermission: boolean;
  onAction: (deviceId: string, stackConfigId: string, action: Action) => void;
  onDeleteStack: (stackConfigId: string, deviceId: string) => void;
  onDeploy: (
    deviceId: string,
    stackConfigId: string,
    stackRevisionId: string
  ) => void;
}

export default function TableContent({
  row,
  hasPermission,
  onAction,
  onDeleteStack,
  onDeploy,
}: IProps) {
  const { tenant } = useParams<'tenant'>();
  const [open, setOpen] = useState(true);

  if (!tenant) {
    throw new Error('TableContent must be rendered under a /:tenant route');
  }

  const handleDeploymentAction = (action: DeploymentAction) => {
    if (isRemoveAction(action)) {
      onDeleteStack(row.stackConfigId, row.deviceId);

      return;
    }

    if (isRedeployAction(action)) {
      onDeploy(row.deviceId, row.stackConfigId, row.stackRevisionId);

      return;
    }

    if (isDeploymentApiAction(action)) {
      onAction(row.deviceId, row.stackConfigId, action);
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

            <Link
              component={RouterLink}
              to={`${getAppBasePath(tenant)}/devices/${row.deviceId}/container-stacks/${row.stackConfigId}/${row.stackRevisionId}`}
              underline="hover"
              variant="body2"
              sx={{
                color: '#1976D2',
                fontWeight: 500,
              }}
            >
              {row.stackName} (v{row.version})
            </Link>
          </Box>
        </TableCell>

        <TableCell>
          {row.status && <AppChip {...deploymentStatusChipProps(row.status)} />}
        </TableCell>

        <TableCell>
          {row.createdAt ? formatLocalTime(row.createdAt) : '-'}
        </TableCell>

        <TableCell sx={{ px: 2, py: 1 }}>
          <PageTableActionsCell
            maxVisible={2}
            actions={getDeploymentActions(row.status).map((action) => ({
              key: action,
              label: DEPLOYMENT_ACTION_LABEL_MAP[action],
              icon: DEPLOYMENT_ACTION_ICON_MAP[action],
              disabled: !hasPermission,
              onClick: () => handleDeploymentAction(action),
            }))}
          />
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
