import { TableCell, TableRow } from '@mui/material';
import { getAppBasePath } from '@shared/lib/appRoute';
import { formatLocalTime } from '@shared/lib/dayjs';
import { AppChip, PageTableInfoCell } from '@shared/ui';
import { Link as RouterLink, useParams } from 'react-router-dom';

import { type EditionDeploymentDeviceRow } from '../../../domain/types';
import { editionDeploymentStateChipProps } from '../../editionDeploymentStatusDisplay';
import ActionButtons from './ActionButtons';

interface IProps {
  row: EditionDeploymentDeviceRow;
  hasPermission: boolean;
  onRetry: (deviceId: string) => void;
  onDelete: (row: EditionDeploymentDeviceRow) => void;
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
      <TableCell sx={{ px: 2, py: 1, pl: 2 }}>
        <PageTableInfoCell
          primary={
            <RouterLink
              to={`${getAppBasePath(tenant)}/devices/${row.deviceId}/ai-models`}
              style={{ color: 'var(--primary-main, #1976D2)' }}
            >
              {row.deviceName}
            </RouterLink>
          }
          secondary={row.deviceId}
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
          onRetry={(r) => onRetry(r.deviceId)}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
}
