import './SwitchOrganization.scss';

import SwitchOrganizationDialog from '@app/layouts/SwitchOrganization/SwitchOrganizationDialog';
import {
  Avatar,
  Box,
  Divider,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { SvgIcon } from '@shared/ui';
import { useState } from 'react';

interface IProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

export default function OrgSwitcherMenu({ anchorEl, open, onClose }: IProps) {
  const [switchOpen, setSwitchOpen] = useState(false);

  const { currentOrgId, currentOrgName } = useOrgContentStore();
  const handleBrowseAllOrgs = () => {
    setSwitchOpen(true);
    onClose();

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        disableRestoreFocus
        slotProps={{
          paper: {
            className: 'org-switcher-menu',
          },
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box className="org-switcher-menu-header">
          <Avatar className="org-switcher-menu-avatar">
            <SvgIcon
              name="BusinessOutlined"
              sx={{ color: 'var(--common-white-_states-main)' }}
            />
          </Avatar>

          <Box className="org-switcher-menu-text">
            <Typography variant="body1" className="org-switcher-menu-name">
              {currentOrgName || '-'}
            </Typography>

            <Typography
              variant="body2"
              className="org-switcher-menu-id"
              color="text.secondary"
            >
              {currentOrgId || '-'}
            </Typography>
          </Box>
        </Box>

        <Divider className="org-switcher-menu-divider" />

        <MenuItem
          className="org-switcher-menu-action"
          onClick={handleBrowseAllOrgs}
        >
          Browse all orgs
        </MenuItem>
      </Menu>

      <SwitchOrganizationDialog
        open={switchOpen}
        onClose={() => setSwitchOpen(false)}
      />
    </>
  );
}
