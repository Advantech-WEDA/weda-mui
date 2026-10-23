import './PageTableActionsCell.scss';

import {
  Box,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { useState } from 'react';

import type { IconName } from '@/assets/icons';

import SvgIcon from '../SvgIcon';

export interface PageTableAction {
  key: string;
  label: string;
  icon: IconName;
  onClick: () => void;
  disabled?: boolean;
}

interface IProps {
  actions: PageTableAction[];

  maxVisible?: number;
}

const PageTableActionsCell = ({ actions, maxVisible }: IProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const visibleActions =
    maxVisible === undefined ? actions : actions.slice(0, maxVisible);
  const overflowActions =
    maxVisible === undefined ? [] : actions.slice(maxVisible);

  const handleMoreClose = () => setAnchorEl(null);

  return (
    <Box className="page-table-actions-cell">
      {visibleActions.map((action) => (
        <Tooltip key={action.key} title={action.label}>
          <span className="page-table-actions-cell__tooltip">
            <IconButton
              size="small"
              className="page-table-actions-cell__btn"
              disabled={action.disabled}
              onClick={action.onClick}
            >
              <SvgIcon
                name={action.icon}
                className="page-table-actions-cell__icon"
                sx={{
                  color: action.disabled
                    ? 'var(--action-disabled)'
                    : 'var(--action-active)',
                }}
              />
            </IconButton>
          </span>
        </Tooltip>
      ))}

      {overflowActions.length > 0 && (
        <>
          <Tooltip title="More">
            <span className="page-table-actions-cell__tooltip">
              <IconButton
                size="small"
                className="page-table-actions-cell__btn"
                disabled={overflowActions.every((action) => action.disabled)}
                onClick={(event) => setAnchorEl(event.currentTarget)}
              >
                <SvgIcon
                  name="MoreVertFilled"
                  className="page-table-actions-cell__icon"
                  sx={{ color: 'var(--action-active)' }}
                />
              </IconButton>
            </span>
          </Tooltip>

          <Menu
            className="page-table-actions-cell__more-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMoreClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
              paper: {
                sx: {
                  minWidth: 140,
                  boxShadow: '0px 3px 8px rgba(0,0,0,0.16)',
                },
              },
            }}
          >
            {overflowActions.map((action) => (
              <MenuItem
                key={action.key}
                disabled={action.disabled}
                onClick={() => {
                  handleMoreClose();
                  action.onClick();
                }}
              >
                <ListItemIcon>
                  <SvgIcon
                    name={action.icon}
                    sx={{
                      color: action.disabled
                        ? 'var(--action-disabled)'
                        : 'var(--action-active)',
                    }}
                  />
                </ListItemIcon>

                {action.label}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </Box>
  );
};

export default PageTableActionsCell;
