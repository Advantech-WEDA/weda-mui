import { editionDeploymentStateChipProps } from '@features/ai-models';
import { TableCell, TableRow, Tooltip } from '@mui/material';
import { getAppBasePath } from '@shared/lib/appRoute';
import { formatLocalTime } from '@shared/lib/dayjs';
import { AppChip, PageTableInfoCell } from '@shared/ui';
import { Link as RouterLink, useParams } from 'react-router-dom';

import ActionButtons from '@/features/devices/components/Detail/AiModels/ActionButtons';
import type { DeviceAiModelRow } from '@/features/devices/domain/types';

interface IProps {
  row: DeviceAiModelRow;
  hasPermission: boolean;
  onRetry: (row: DeviceAiModelRow) => void;
  onDelete: (row: DeviceAiModelRow) => void;
}

export default function TableContent({
  row,
  hasPermission,
  onRetry,
  onDelete,
}: IProps) {
  const { tenant } = useParams<'tenant'>();

  if (!tenant) {
    throw new Error('TableContent must be rendered under a /:tenant route');
  }

  return (
    <TableRow hover>
      <TableCell sx={{ px: 2, py: 1 }}>
        <PageTableInfoCell
          primary={
            <Tooltip
              title={
                row.isDeleted
                  ? 'This edition was deleted from WEDA Core.'
                  : `${row.modelName}/ ${row.edition}`
              }
            >
              {row.isDeleted ? (
                <span
                  style={{
                    color: 'var(--action-disabled, rgba(0, 0, 0, 0.26))',
                    textDecoration: 'none',
                    display: 'inline-block',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    verticalAlign: 'bottom',
                  }}
                >
                  {row.modelName}/ {row.edition}
                </span>
              ) : (
                <RouterLink
                  to={`${getAppBasePath(tenant)}/devices/${row.deviceId}/ai-model/${row.id}`}
                  style={{
                    color: 'var(--primary-main, #1976D2)',
                    textDecoration: 'underline',
                    display: 'inline-block',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    verticalAlign: 'bottom',
                  }}
                >
                  {row.modelName}/ {row.edition}
                </RouterLink>
              )}
            </Tooltip>
          }
          secondary={
            row.isDeleted ? (
              <span
                style={{ color: 'var(--action-disabled, rgba(0, 0, 0, 0.26))' }}
              >
                {row.modelId}
              </span>
            ) : (
              row.modelId
            )
          }
        />
      </TableCell>

      <TableCell sx={{ px: 2, py: 1 }}>
        <AppChip {...editionDeploymentStateChipProps(row.state)} />
      </TableCell>

      <TableCell sx={{ px: 2, py: 1 }}>
        {row.dateModified ? formatLocalTime(row.dateModified) : '-'}
      </TableCell>

      <TableCell sx={{ px: 2, py: 1 }}>
        {row.dateCreated ? formatLocalTime(row.dateCreated) : '-'}
      </TableCell>

      <TableCell sx={{ px: 2, py: 1 }}>
        <ActionButtons
          row={row}
          hasPermission={hasPermission}
          onRetry={onRetry}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
}
