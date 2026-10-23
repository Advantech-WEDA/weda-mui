import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  Tooltip,
  Typography,
} from '@mui/material';
import { getAppBasePath } from '@shared/lib/appRoute';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { SvgIcon } from '@shared/ui';
import clsx from 'clsx';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { type IconName } from '@/assets/icons';

const sideMenu: {
  key: string;
  label: string;
  icon: IconName;
  path: string;
  area?: string;
}[] = [
  { key: 'home', label: 'Home', icon: 'HomeOutlined', path: '', area: 'home' },
  {
    key: 'organizations',
    label: 'Organizations',
    icon: 'BusinessOutlined',
    path: 'organizations',
    area: 'home',
  },
  {
    key: 'members',
    label: 'Members',
    icon: 'PeopleAltOutlined',
    path: 'members',
    area: 'home',
  },
  {
    key: 'devices',
    label: 'Devices',
    icon: 'DisplaySettingsOutlined',
    path: 'devices',
    area: 'home',
  },
  {
    key: 'stacks',
    label: 'Container Stacks',
    icon: 'LayersOutlined',
    path: 'container-stacks',
    area: 'home',
  },
  {
    key: 'registries',
    label: 'Registries',
    icon: 'FileOpenOutlined',
    path: 'registries',
    area: 'home',
  },
  {
    key: 'client-credentials',
    label: 'OAuth 2.0 Client Credentials',
    icon: 'TokenOutlineFilled',
    path: 'client-credentials',
    area: 'myAccount',
  },
  {
    key: 'ai-models',
    label: 'AI Models',
    icon: 'PsychologyOutlined',
    path: 'ai-models',
    area: 'home',
  },
];

const ALWAYS_ENABLED_KEYS = new Set(['home', 'organizations']);

interface IProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ collapsed, onToggle }: IProps) => {
  const navigate = useNavigate();
  const { tenant } = useParams<'tenant'>();
  const location = useLocation();
  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);

  if (!tenant) {
    throw new Error('Sidebar must be rendered under a /:tenant route');
  }

  const basePath = getAppBasePath(tenant);

  const hasOrg = !!currentOrgId;

  const isMyAccount = location.pathname.includes('client-credentials');

  const filteredMenu = sideMenu.filter((item) =>
    isMyAccount ? item.area === 'myAccount' : item.area === 'home'
  );

  const relativePath = location.pathname.startsWith(basePath)
    ? location.pathname.slice(basePath.length)
    : location.pathname;
  const currentSection = relativePath.split('/').filter(Boolean)[0] ?? '';

  const handleNavigate = (path: string): void => {
    const target = path ? `${basePath}/${path}` : basePath;
    navigate(target);
  };
  return (
    <Drawer
      variant="permanent"
      className={clsx('sidebar-drawer', collapsed ? 'collapsed' : 'expanded')}
    >
      <Box className="sidebar-container">
        <List className="sidebar-list">
          {filteredMenu.map((item) => {
            const isSelected =
              item.path === ''
                ? currentSection === ''
                : currentSection === item.path;

            const isDisabled =
              !isMyAccount && !hasOrg && !ALWAYS_ENABLED_KEYS.has(item.key);

            return (
              <Tooltip
                key={item.key}
                title={collapsed ? item.label : ''}
                placement="right"
                arrow
                enterDelay={200}
                disableHoverListener={!collapsed}
              >
                <ListItemButton
                  selected={isSelected}
                  disabled={isDisabled}
                  onClick={() => !isDisabled && handleNavigate(item.path)}
                  className={clsx(
                    'sidebar-item',
                    collapsed ? 'collapsed' : 'expanded'
                  )}
                >
                  <ListItemIcon
                    className={clsx(
                      'sidebar-icon',
                      collapsed ? 'collapsed' : 'expanded'
                    )}
                  >
                    <SvgIcon name={item.icon} />
                  </ListItemIcon>

                  {!collapsed && (
                    <Typography variant="body1" className="sidebar-text">
                      {item.label}
                    </Typography>
                  )}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>

        <Box
          className={clsx(
            'sidebar-footer',
            collapsed ? 'collapsed' : 'expanded'
          )}
        >
          <Divider component="div" className="sidebar-divider" />

          <ListItemIcon
            className="sidebar-footer-btn"
            sx={{
              '&:hover': {
                backgroundColor: 'action.focus',
              },
              '&:active': {
                backgroundColor: 'action.focus',
              },
            }}
            onClick={onToggle}
          >
            <SvgIcon
              className="sidebar-footer-icon"
              name={
                collapsed
                  ? 'KeyboardDoubleArrowRightOutlined'
                  : 'KeyboardDoubleArrowLeftOutlined'
              }
            />
          </ListItemIcon>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
