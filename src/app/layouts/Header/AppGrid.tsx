import { Box, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material';
import { type ITenantApplicationGridResult } from '@shared/session/useTenantStore';

interface IProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  apps?: ITenantApplicationGridResult[] | null;
  activeAppId: string | null;
  onOpenApp: (app: ITenantApplicationGridResult) => void;
}

export default function AppGrid({
  anchorEl,
  open,
  onClose,
  apps,
  activeAppId,
  onOpenApp,
}: IProps) {
  const visibleApps =
    apps
      ?.filter((app) => app.isVisible)
      .sort((a, b) => a.gridOrder - b.gridOrder) || [];

  const getIconSrc = (icon?: string | null) => {
    if (!icon) return '';

    return icon.startsWith('data:image')
      ? icon
      : `data:image/svg+xml;base64,${icon}`;
  };

  const getStatusDot = (app: ITenantApplicationGridResult) => {
    const { deployStatus, licenseStatus, progressRate } = app;

    if (deployStatus === 'Installing' && progressRate && progressRate < 100) {
      return <Box className="status-dot blue" />;
    }

    if (deployStatus === 'Installed' && licenseStatus === 'Expiring') {
      return <Box className="status-dot orange" />;
    }

    if (deployStatus === 'Installed' && licenseStatus === 'Expired') {
      return <Box className="status-dot red" />;
    }

    return null;
  };

  const renderSubText = (app: ITenantApplicationGridResult) => {
    const { deployStatus, progressRate, version } = app;

    if (deployStatus === 'NotInstalled') {
      return null;
    }

    if (deployStatus === 'Installing') {
      return `Installing... ${progressRate ?? 0}%`;
    }

    return version ? `v ${version}` : '';
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      sx={{ maxHeight: 600 }}
      slotProps={{
        paper: {
          className: 'header-app-menu',
        },
      }}
    >
      <Typography
        variant="body2"
        className="header-app-title"
        sx={{
          fontWeight: 'var(--fontWeightMedium, 500)',
          lineHeight: '48px',
        }}
      >
        Applications
      </Typography>

      {visibleApps.map((app) => {
        const iconSrc = getIconSrc(app.icon);
        const subText = renderSubText(app);
        const isDisabled =
          app.deployStatus === 'NotInstalled' ||
          app.deployStatus === 'Installing';

        return (
          <MenuItem
            key={`${app.id}-${app.displayName}`}
            className={`header-app-menuItem ${
              activeAppId === app.id ? 'active' : ''
            }`}
            disabled={isDisabled}
            sx={{
              padding: 'var(--1, 8px) var(--2, 16px)',
              cursor: isDisabled ? 'default' : 'pointer',
            }}
            onClick={isDisabled ? undefined : () => onOpenApp(app)}
          >
            <ListItemIcon className="app-icon-wrap">
              <div className="app-icon-box">
                <img
                  src={iconSrc}
                  className={`app-icon ${isDisabled ? 'disabled' : ''}`}
                  alt={app.displayName}
                />

                {getStatusDot(app)}
              </div>
            </ListItemIcon>

            <div className={`app-content ${isDisabled ? 'disabled' : ''}`}>
              <Typography variant="body1" className="app-name">
                {app.displayName}
              </Typography>

              <Typography variant="body2" className="app-subtext">
                {subText ?? '-'}
              </Typography>
            </div>
          </MenuItem>
        );
      })}
    </Menu>
  );
}
