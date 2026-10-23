import { Button, ListItemIcon, Menu, MenuItem, Tooltip } from '@mui/material';
import { useState } from 'react';

import SvgIcon from '../SvgIcon';
import type { PageTableAction } from './PageTableActionsCell';

interface IProps {
  actions: PageTableAction[];
  maxVisible?: number;
}

const actionColor = (disabled?: boolean) =>
  disabled ? 'var(--action-disabled)' : 'var(--primary-main, #1976D2)';

const PageHeaderActionButtons = ({ actions, maxVisible }: IProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const visibleActions =
    maxVisible === undefined ? actions : actions.slice(0, maxVisible);
  const overflowActions =
    maxVisible === undefined ? [] : actions.slice(maxVisible);

  const handleMoreClose = () => setAnchorEl(null);

  return (
    <>
      {visibleActions.map((action) => (
        <Button
          key={action.key}
          variant="outlined"
          disabled={action.disabled}
          startIcon={
            <SvgIcon
              name={action.icon}
              sx={{ color: actionColor(action.disabled) }}
            />
          }
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      ))}

      {overflowActions.length > 0 && (
        <>
          <Tooltip title="More">
            <span>
              <Button
                variant="outlined"
                disabled={overflowActions.every((action) => action.disabled)}
                onClick={(event) => setAnchorEl(event.currentTarget)}
                sx={{ minWidth: 0, px: 1 }}
              >
                <SvgIcon
                  name="MoreVertFilled"
                  sx={{
                    color: actionColor(
                      overflowActions.every((action) => action.disabled)
                    ),
                  }}
                />
              </Button>
            </span>
          </Tooltip>

          <Menu
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
                    sx={{ color: actionColor(action.disabled) }}
                  />
                </ListItemIcon>

                {action.label}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </>
  );
};

export default PageHeaderActionButtons;
