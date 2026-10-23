import './header.scss';

import { AppBar, Box, Paper, Toolbar } from '@mui/material';
import { getIdentityUrl } from '@shared/auth/authCodeSession';
import { isAuthCodeMode } from '@shared/auth/authMode';
import { getTenant } from '@shared/lib/baseUrl';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useIAmStore } from '@shared/session/useIAmStore';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useProfileStore } from '@shared/session/useProfileStore';
import {
  type ITenantApplicationGridResult,
  useTenantStore,
} from '@shared/session/useTenantStore';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import HeaderLeft from '@/app/layouts/Header/HeaderLeft';
import HeaderRight from '@/app/layouts/Header/HeaderRight';

const Header = () => {
  const navigate = useAppNavigate();
  const location = useLocation();

  const isMyAccountPage = location.pathname.includes('/client-credentials');

  const [userItemSelected, setUserItemSelected] = useState<string | null>(null);
  const [rootMenuEl, setRootMenuEl] = useState<HTMLElement | null>(null);
  const [appMenuEl, setAppMenuEl] = useState<HTMLElement | null>(null);
  const [userMenuEl, setUserMenuEl] = useState<HTMLElement | null>(null);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [signOutLoading, setSignOutLoading] = useState(false);

  const {
    userOrgList,
    currentOrgId,
    currentOrgName,
    setCurrentOrg,
    clearCurrentOrg,
  } = useOrgContentStore();

  const { userTenantApplicationGridState, GET_TENANT_APP_GRID } =
    useTenantStore();
  const userProfile = useProfileStore((s) => s.userProfile);
  const jwtEmail = useIAmStore((s) => s.userIAmUserProfile?.email);
  const HANDLE_SIGNOUT = useProfileStore((s) => s.HANDLE_SIGNOUT);

  const headerUser = {
    firstName: userProfile?.firstName,
    lastName: userProfile?.lastName,
    name: userProfile?.name,
    email: userProfile?.email || jwtEmail,
    tenantName: getTenant(),
  };

  const isLocalAuthCode = isAuthCodeMode();
  const profileUrl = `${isLocalAuthCode ? getIdentityUrl() : '/identity'}/myaccount/personal-info`;

  useEffect(() => {
    if (userOrgList === null) return;

    if (!currentOrgId) {
      const rootOrg = userOrgList.items?.find(
        (item) => item.parentOrgId === null
      );
      if (rootOrg) {
        setCurrentOrg(rootOrg.orgId, rootOrg.name ?? '');
      }
    }
  }, [userOrgList, currentOrgId, setCurrentOrg, clearCurrentOrg]);

  const closeAllMenus = () => {
    setRootMenuEl(null);
    setAppMenuEl(null);
    setUserMenuEl(null);
  };

  const handleOpenRootMenu = (e: React.MouseEvent<HTMLElement>) => {
    closeAllMenus();
    setRootMenuEl(e.currentTarget);
  };

  const handleOpenAppMenu = (e: React.MouseEvent<HTMLElement>) => {
    closeAllMenus();
    setAppMenuEl(e.currentTarget);
    GET_TENANT_APP_GRID();
  };

  const handleOpenUserMenu = (e: React.MouseEvent<HTMLElement>) => {
    closeAllMenus();
    setUserMenuEl(e.currentTarget);
  };

  const handleOpenSignOutDialog = () => {
    setUserMenuEl(null);

    setSignOutOpen(true);
    setUserItemSelected('signOut');
  };

  const handleCloseSignOutDialog = () => {
    setSignOutOpen(false);
  };

  const handleConfirmSignOut = async () => {
    setSignOutLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      HANDLE_SIGNOUT();
    } finally {
      setSignOutLoading(false);
    }
  };

  const handleOpenApp = (app: ITenantApplicationGridResult) => {
    setActiveAppId(app.id);
    const base = window.location.origin;
    const path = app.url.startsWith('/') ? app.url : `/${app.url}`;
    window.open(`${base}${path}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <AppBar position="fixed" elevation={4} className="header-appbar">
      <Paper className="header-paper">
        <Toolbar className="header-toolbar">
          <HeaderLeft
            isMyAccountPage={isMyAccountPage}
            currentOrgName={currentOrgName}
            rootMenuEl={rootMenuEl}
            onBackToHome={() => navigate('')}
            onOpenRootMenu={handleOpenRootMenu}
            onCloseRootMenu={() => setRootMenuEl(null)}
          />

          <Box sx={{ flexGrow: 1 }} />

          <HeaderRight
            userProfile={headerUser}
            profileUrl={profileUrl}
            showAppGrid={!isLocalAuthCode}
            showSwitchTenant={!isLocalAuthCode}
            appMenuEl={appMenuEl}
            userMenuEl={userMenuEl}
            userTenantApplicationGridState={userTenantApplicationGridState}
            activeAppId={activeAppId}
            userItemSelected={userItemSelected}
            setUserItemSelected={setUserItemSelected}
            signOutOpen={signOutOpen}
            signOutLoading={signOutLoading}
            onOpenAppMenu={handleOpenAppMenu}
            onOpenUserMenu={handleOpenUserMenu}
            onCloseMenus={closeAllMenus}
            onOpenApp={handleOpenApp}
            onSignOut={handleOpenSignOutDialog}
            onCloseSignOutDialog={handleCloseSignOutDialog}
            onConfirmSignOut={handleConfirmSignOut}
          />
        </Toolbar>
      </Paper>
    </AppBar>
  );
};

export default Header;
