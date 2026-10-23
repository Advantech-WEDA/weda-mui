import AppGrid from '@app/layouts/Header/AppGrid';
import SignOutDialog from '@app/layouts/Header/SignOutDialog';
import UserMenu from '@app/layouts/Header/UserMenu';
import { Box, IconButton } from '@mui/material';
import { type ITenantApplicationGridResult } from '@shared/session/useTenantStore';
import { SvgIcon } from '@shared/ui';

import UserTooltipContent from '@/app/layouts/Header/UserTooltipContent';

const INTRODUCTION_URL = 'https://learn.advantech.com/weda/docs/Introduction';

interface IProps {
  userProfile: {
    firstName?: string | null;
    lastName?: string | null;
    name?: string | null;
    email?: string | null;
    tenantName?: string;
  } | null;
  profileUrl: string;
  showAppGrid: boolean;
  showSwitchTenant: boolean;
  appMenuEl: HTMLElement | null;
  userMenuEl: HTMLElement | null;
  userTenantApplicationGridState: ITenantApplicationGridResult[] | null;
  activeAppId: string | null;
  userItemSelected: string | null;
  setUserItemSelected: (value: string | null) => void;
  signOutOpen: boolean;
  signOutLoading: boolean;
  onOpenAppMenu: (e: React.MouseEvent<HTMLElement>) => void;
  onOpenUserMenu: (e: React.MouseEvent<HTMLElement>) => void;
  onCloseMenus: () => void;
  onOpenApp: (app: ITenantApplicationGridResult) => void;
  onSignOut: () => void;
  onCloseSignOutDialog: () => void;
  onConfirmSignOut: () => void;
}

const HeaderRight = ({
  userProfile,
  profileUrl,
  showAppGrid,
  showSwitchTenant,
  appMenuEl,
  userMenuEl,
  userTenantApplicationGridState,
  activeAppId,
  userItemSelected,
  setUserItemSelected,
  signOutOpen,
  signOutLoading,
  onOpenAppMenu,
  onOpenUserMenu,
  onCloseMenus,
  onOpenApp,
  onSignOut,
  onCloseSignOutDialog,
  onConfirmSignOut,
}: IProps) => (
  <Box className="header-right">
    <IconButton
      className="header-iconButton"
      component="a"
      href={INTRODUCTION_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open Learning Hub"
    >
      <SvgIcon
        name="HelpFilled"
        sx={{ color: 'var(--common-white-_states-main)' }}
      />
    </IconButton>

    {showAppGrid && (
      <IconButton className="header-iconButton" onClick={onOpenAppMenu}>
        <SvgIcon
          name="AppsOutlined"
          sx={{ color: 'var(--common-white-_states-main)' }}
        />
      </IconButton>
    )}

    <UserTooltipContent userProfile={userProfile} onClick={onOpenUserMenu} />

    <AppGrid
      anchorEl={appMenuEl}
      open={Boolean(appMenuEl)}
      onClose={onCloseMenus}
      apps={userTenantApplicationGridState}
      activeAppId={activeAppId}
      onOpenApp={onOpenApp}
    />

    <UserMenu
      anchorEl={userMenuEl}
      open={Boolean(userMenuEl)}
      onClose={onCloseMenus}
      userProfile={userProfile}
      profileUrl={profileUrl}
      showSwitchTenant={showSwitchTenant}
      userItemSelected={userItemSelected}
      setUserItemSelected={setUserItemSelected}
      onSignOut={onSignOut}
    />

    <SignOutDialog
      open={signOutOpen}
      loading={signOutLoading}
      onClose={onCloseSignOutDialog}
      onConfirm={onConfirmSignOut}
    />
  </Box>
);

export default HeaderRight;
