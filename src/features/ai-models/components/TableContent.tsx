import { Box, IconButton, Link, TableCell } from '@mui/material';
import { getAppBasePath } from '@shared/lib/appRoute';
import {
  PageTableActionsCell,
  PageTableInfoCell,
  PageTableRow,
  SvgIcon,
} from '@shared/ui';
import { Fragment, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';

import type {
  AiModelEditionWithDeviceCount,
  AiModelWithEditions,
  IAiModelEditionListItem,
} from '@/features/ai-models/api/aiModels.api.types';
import {
  AI_MODEL_COLUMNS,
  type Column,
} from '@/features/ai-models/components/aiModelTable.columns';
import {
  EDITION_ACTION_ICON_MAP,
  EDITION_ACTION_LABEL_MAP,
} from '@/features/ai-models/components/editionActionDisplay';
import EditionUploadStatusCell from '@/features/ai-models/components/EditionUploadStatusCell';
import { getVisibleEditionActions } from '@/features/ai-models/domain/editionActions';
import { useAiModelTableRow } from '@/features/ai-models/hooks/useAiModelTableRow';

interface IProps {
  row: AiModelWithEditions;
  hasPermission: boolean;
  onEdit: (modelId: string) => void;
  onEditEdition: (modelId: string, edition: string) => void;
  onDeploy: (modelId: string, edition: string) => void;
  onDelete: (row: AiModelWithEditions) => void;
  onDeleteEdition: (edition: IAiModelEditionListItem) => void;
}

export default function TableContent({
  row,
  hasPermission,
  onEdit,
  onEditEdition,
  onDeploy,
  onDelete,
  onDeleteEdition,
}: IProps) {
  const [open, setOpen] = useState(true);
  const { tenant } = useParams<'tenant'>();
  const {
    fileInputRef,
    getEffectiveStatus,
    isEditionPaused,
    handleReuploadFileSelected,
    handleEditionAction,
  } = useAiModelTableRow({ row, onEditEdition, onDeploy, onDeleteEdition });

  if (!tenant) {
    throw new Error('TableContent must be rendered under a /:tenant route');
  }

  const hasEditions = row.editions.length > 0;

  const [nameCol, ...restCols] = AI_MODEL_COLUMNS;

  const middleCols = restCols.slice(0, -1);
  const actionsCol = restCols[restCols.length - 1];

  const renderModelCellValue = (col: Column) => {
    if (col.label === 'Edition count') return row.editions.length;

    return '-';
  };

  const renderEditionCellValue = (
    col: Column,
    edition: AiModelEditionWithDeviceCount
  ) => {
    if (col.label === 'Status') {
      return (
        <EditionUploadStatusCell
          orgId={edition.orgId}
          modelId={edition.modelId}
          edition={edition.edition}
          uploadId={edition.uploadId}
          initialStatus={edition.status}
          fileSize={edition.file?.fileSize ?? null}
        />
      );
    }

    if (col.label === 'Deployed devices') return edition.deployedDeviceCount;

    return '-';
  };

  return (
    <Fragment>
      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={handleReuploadFileSelected}
      />

      <PageTableRow hover>
        <TableCell
          sx={{
            pl: hasEditions ? 2 : '58px',
            pr: 2,
            py: 1,
            height: '56px',
            width: nameCol.width,
            minWidth: nameCol.minWidth,
          }}
        >
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}
          >
            {hasEditions && (
              <IconButton size="small" onClick={() => setOpen((prev) => !prev)}>
                <SvgIcon
                  name={open ? 'ExpandMoreFilled' : 'ChevronRightFilled'}
                  sx={{ color: 'var(--action-active)' }}
                />
              </IconButton>
            )}

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <PageTableInfoCell
                primary={row.modelName ?? '-'}
                secondary={row.modelId ?? '-'}
              />
            </Box>
          </Box>
        </TableCell>

        {middleCols.map((col) => (
          <TableCell key={col.label} sx={{ px: 2, py: 1, width: col.width }}>
            {renderModelCellValue(col)}
          </TableCell>
        ))}

        <TableCell sx={{ px: 2, py: 1, width: actionsCol.width }}>
          <PageTableActionsCell
            actions={[
              {
                key: 'edit',
                label: 'Edit',
                icon: 'EditOutlined',
                disabled: !hasPermission,
                onClick: () => onEdit(row.modelId),
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

      {hasEditions &&
        open &&
        row.editions.map((edition) => (
          <PageTableRow hover key={`${row.modelId}-${edition.edition}`}>
            <TableCell
              sx={{
                pl: 2,
                py: 1,
                width: nameCol.width,
                minWidth: nameCol.minWidth,
                height: '50px',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  minWidth: 0,
                }}
              >
                <IconButton
                  size="small"
                  disabled
                  tabIndex={-1}
                  aria-hidden
                  sx={{ visibility: 'hidden' }}
                >
                  <SvgIcon name="ChevronRightFilled" />
                </IconButton>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <PageTableInfoCell
                    primary={
                      <Box
                        component="span"
                        title={`${edition.modelName ?? row.modelName ?? '-'} / ${edition.edition ?? '-'}`}
                      >
                        {edition.edition ? (
                          <Link
                            component={RouterLink}
                            to={`${getAppBasePath(tenant)}/ai-models/${row.modelId}/editions/${encodeURIComponent(edition.edition)}/information`}
                            underline="hover"
                            sx={{ color: 'var(--primary-main, #1976D2)' }}
                          >
                            {edition.edition}
                          </Link>
                        ) : (
                          <Box
                            component="span"
                            sx={{ color: 'var(--primary-main, #1976D2)' }}
                          >
                            -
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </Box>
              </Box>
            </TableCell>

            {middleCols.map((col) => (
              <TableCell
                key={col.label}
                sx={{ px: 2, py: 1, width: col.width }}
              >
                {renderEditionCellValue(col, edition)}
              </TableCell>
            ))}

            <TableCell sx={{ px: 2, py: 1, width: actionsCol.width }}>
              {edition.edition && (
                <PageTableActionsCell
                  actions={getVisibleEditionActions(
                    getEffectiveStatus(edition)
                  ).map((action) => {
                    const effectiveStatus = getEffectiveStatus(edition);
                    const paused = isEditionPaused(edition);
                    const disabled =
                      !hasPermission ||
                      (action === 'pause' && paused) ||
                      (action === 'resume' &&
                        effectiveStatus === 'Uploading' &&
                        !paused);

                    return {
                      key: action,
                      label: EDITION_ACTION_LABEL_MAP[action],
                      icon: EDITION_ACTION_ICON_MAP[action],
                      disabled,
                      onClick: () => handleEditionAction(action, edition),
                    };
                  })}
                />
              )}
            </TableCell>
          </PageTableRow>
        ))}
    </Fragment>
  );
}
