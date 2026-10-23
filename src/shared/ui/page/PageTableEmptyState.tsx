import './PageTableEmptyState.scss';

import { Box, TableCell, Typography } from '@mui/material';
import clsx from 'clsx';

import SvgIcon from '../SvgIcon';
import { PageTableRow } from './PageTable';
import { PageActionButton } from './PageToolbarControls';

interface IProps {
  variant: 'initial' | 'filter' | 'error';
  colSpan: number;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  showAction?: boolean;
}

const PageTableEmptyState = ({
  variant,
  colSpan,
  title,
  description,
  actionLabel,
  onAction,
  showAction = true,
}: IProps) => {
  return (
    <PageTableRow className="page-table-empty-state__row">
      <TableCell
        className={clsx(
          'page-table-empty-state__cell',
          `page-table-empty-state__cell--${variant}`
        )}
        colSpan={colSpan}
        align="center"
      >
        <Box className="page-table-empty-state">
          <Typography variant="h5">{title}</Typography>

          {description && (
            <Typography
              variant="body1"
              color="text.secondary"
              className="page-table-empty-state__desc"
            >
              {description}
            </Typography>
          )}

          {showAction &&
            (variant === 'initial' ? (
              <PageActionButton
                variant="contained"
                className={clsx(
                  'page-table-empty-state__action',
                  'page-table-empty-state__action--initial'
                )}
                startIcon={
                  <SvgIcon
                    name="Add"
                    className="page-table-empty-state__action--add"
                    sx={{ color: 'var(--primary-contrastText)' }}
                  />
                }
                onClick={onAction}
              >
                <Typography
                  variant="button"
                  className="page-table-empty-state__action--add"
                >
                  {actionLabel}
                </Typography>
              </PageActionButton>
            ) : (
              <PageActionButton
                variant="outlined"
                className={clsx(
                  'page-table-empty-state__action',
                  'page-table-empty-state__action--filter'
                )}
                onClick={onAction}
              >
                <Typography
                  variant="button"
                  className="page-table-empty-state__action--clear"
                >
                  {actionLabel}
                </Typography>
              </PageActionButton>
            ))}
        </Box>
      </TableCell>
    </PageTableRow>
  );
};

export default PageTableEmptyState;
