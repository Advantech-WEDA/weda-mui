import {
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { getAppBasePath } from '@shared/lib/appRoute';
import { SvgIcon } from '@shared/ui';
import { Link as RouterLink, useParams } from 'react-router-dom';

const SWITCH_TENANT_PATH = 'portal/switch-tenant-list';

const buildSwitchTenantUrl = (tenant: string): string =>
  `/${encodeURIComponent(tenant)}/${SWITCH_TENANT_PATH}`;

interface IProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;

  userProfile: {
    firstName?: string | null;
    lastName?: string | null;
    name?: string | null;
    email?: string | null;
    tenantName?: string;
  } | null;
  profileUrl: string;
  showSwitchTenant: boolean;

  userItemSelected: string | null;
  setUserItemSelected: (val: string) => void;

  onSignOut: () => void;
}

const UserMenu = ({
  anchorEl,
  open,
  onClose,
  userProfile,
  profileUrl,
  showSwitchTenant,
  userItemSelected,
  setUserItemSelected,
  onSignOut,
}: IProps) => {
  const { tenant } = useParams<'tenant'>();

  if (!tenant) {
    throw new Error('UserMenu must be rendered under a /:tenant route');
  }

  const clientCredentialsUrl = `${getAppBasePath(tenant)}/client-credentials`;
  const switchTenantUrl = buildSwitchTenantUrl(tenant);

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          className: 'header-user-menu',
        },
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <MenuItem className="header-user-info">
        <Avatar className="header-user-icon" variant="circular">
          <SvgIcon
            name="PersonFilled"
            sx={{ color: 'var(--_components-paper-elevation-0)' }}
          />
        </Avatar>

        <Box className="header-user-info-box">
          <Typography variant="body1" className="header-user-name">
            {userProfile?.lastName && userProfile?.firstName
              ? `${userProfile.firstName}.${userProfile.lastName}`
              : (userProfile?.name ?? '-')}
          </Typography>
          <Typography variant="body2" className="header-user-email">
            {userProfile?.email ?? '-'}
          </Typography>
        </Box>
      </MenuItem>

      <Divider />

      <MenuItem
        className="header-user-item"
        selected={userItemSelected === 'token'}
        component={RouterLink}
        to={clientCredentialsUrl}
        onClick={() => {
          setUserItemSelected('token');
          onClose?.();
        }}
      >
        <Box className="header-user-item__left">
          <ListItemIcon className="header-user-item-icon">
            <SvgIcon
              name="TokenOutlineFilled"
              sx={{ color: 'var(--action-active)' }}
            />
          </ListItemIcon>

          <Typography variant="subtitle1" className="header-user-item__label">
            OAuth 2.0 Client Credentials
          </Typography>
        </Box>
      </MenuItem>

      <MenuItem
        className="header-user-item"
        onClick={onClose}
        component="a"
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Box className="header-user-item__left">
          <ListItemIcon className="header-user-item-icon">
            <SvgIcon
              name="ManageAccountsOutlined"
              sx={{ color: 'var(--action-active)' }}
            />
          </ListItemIcon>

          <Typography variant="subtitle1" className="header-user-item__label">
            Profile
          </Typography>
        </Box>
      </MenuItem>

      {showSwitchTenant && (
        <MenuItem
          className="header-user-item"
          onClick={onClose}
          component="a"
          href={switchTenantUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Box className="header-user-item__left">
            <ListItemIcon className="header-user-item-icon">
              <SvgIcon
                name="ApartmentOutlined"
                sx={{ color: 'var(--action-active)' }}
              />
            </ListItemIcon>

            <Typography variant="subtitle1" className="header-user-item__label">
              Tenant
            </Typography>
          </Box>

          <Box className="header-user-item__right">
            <Typography variant="body1" className="header-user-item__value">
              {userProfile?.tenantName}
            </Typography>

            <SvgIcon
              name="ChevronRightFilled"
              className="header-user-item__arrow"
              sx={{ color: 'var(--action-active)' }}
            />
          </Box>
        </MenuItem>
      )}

      <MenuItem
        className="header-user-item"
        onClick={onSignOut}
        selected={userItemSelected === 'signOut'}
      >
        <Box className="header-user-item__left">
          <ListItemIcon className="header-user-item-icon">
            <SvgIcon
              name="LogoutFilled"
              sx={{ color: 'var(--action-active)' }}
            />
          </ListItemIcon>

          <Typography variant="subtitle1" className="header-user-item__label">
            Sign out
          </Typography>
        </Box>
      </MenuItem>
    </Menu>
  );
};

export default UserMenu;
