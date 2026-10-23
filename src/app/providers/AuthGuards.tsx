import { Box, CircularProgress } from '@mui/material';
import { getAppBasePath } from '@shared/lib/appRoute';
import { getTenant } from '@shared/lib/baseUrl';
import { decideOrgBootstrapAction } from '@shared/session/orgBootstrapPolicy';
import { decideTokenBootstrapAction } from '@shared/session/tokenBootstrapPolicy';
import { useIAmStore } from '@shared/session/useIAmStore';
import { useMainStore } from '@shared/session/useMainStore';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useProfileStore } from '@shared/session/useProfileStore';
import { useNotification } from '@shared/ui';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

function readTokenError(error: unknown): {
  status: number | undefined;
  errorCode: string | undefined;
} {
  if (!axios.isAxiosError(error)) {
    return { status: undefined, errorCode: undefined };
  }

  return {
    status: error.response?.status,
    errorCode: error.response?.data?.title,
  };
}

const ACCOUNT_NOT_FOUND_MESSAGE =
  'Cannot start your WEDA session. Your account may be disabled — please contact your administrator.';

const INIT_FAILED_MESSAGE =
  'Cannot start your WEDA session. Please try again later.';

const NO_ORGANIZATION_MESSAGE =
  'You are not a member of any organization yet. Create one, or ask an administrator to add you.';

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function ProtectedRoute() {
  const POST_CREATE_JWT_ACCESS_TOKEN = useIAmStore(
    (s) => s.POST_CREATE_JWT_ACCESS_TOKEN
  );
  const HANDLE_LOGIN = useProfileStore((s) => s.HANDLE_LOGIN);
  const SET_IS_INITIALIZED = useMainStore((s) => s.SET_IS_INITIALIZED);

  const [isChecking, setIsChecking] = useState(true);

  const { showError } = useNotification();

  const showErrorRef = useRef(showError);

  useEffect(() => {
    showErrorRef.current = showError;
  });

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      for (let retryCount = 0; ; retryCount++) {
        try {
          await POST_CREATE_JWT_ACCESS_TOKEN();

          return;
        } catch (error) {
          if (ignore) return;

          const action = decideTokenBootstrapAction({
            ...readTokenError(error),
            retryCount,
          });

          if (action === 'retry') {
            await sleep(1000);

            if (ignore) return;

            continue;
          }

          console.error(
            '[ProtectedRoute] POST_CREATE_JWT_ACCESS_TOKEN failed:',
            error
          );

          if (action === 'redirect-to-login') {
            HANDLE_LOGIN();

            return;
          }

          showErrorRef.current(
            action === 'notify-account-not-found'
              ? ACCOUNT_NOT_FOUND_MESSAGE
              : INIT_FAILED_MESSAGE
          );

          SET_IS_INITIALIZED(true);

          return;
        }
      }
    };

    run().finally(() => {
      if (!ignore) {
        setIsChecking(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [POST_CREATE_JWT_ACCESS_TOKEN, HANDLE_LOGIN, SET_IS_INITIALIZED]);

  return (
    <>
      <Outlet />
      {isChecking && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </>
  );
}

export function AppInitializer() {
  const tenantId = useIAmStore((s) => s.userIAmUserProfile?.tenantId || '');
  const userId = useIAmStore((s) => s.userIAmUserProfile?.sub || '');

  const isInitialized = useMainStore((s) => s.isInitialized);

  const SET_IS_INITIALIZED = useMainStore((s) => s.SET_IS_INITIALIZED);

  const GET_CURRENT_USER = useProfileStore((s) => s.GET_CURRENT_USER);

  const GET_ALL_USER_ORGS_BY_USER_ID = useOrgContentStore(
    (s) => s.GET_ALL_USER_ORGS_BY_USER_ID
  );

  const { showError } = useNotification();
  const navigate = useNavigate();

  const showErrorRef = useRef(showError);

  useEffect(() => {
    showErrorRef.current = showError;
  });

  const isInitializingRef = useRef(false);

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      if (!tenantId) return;

      if (isInitializingRef.current) return;

      isInitializingRef.current = true;

      try {
        void GET_CURRENT_USER(userId);

        const orgList = await GET_ALL_USER_ORGS_BY_USER_ID({ userId });

        if (ignore) return;

        const organizationsPath = `${getAppBasePath(getTenant())}/organizations`;

        const orgAction = decideOrgBootstrapAction({
          orgList,
          currentPath: window.location.pathname,
          organizationsPath,
        });

        if (orgAction !== 'none') {
          showErrorRef.current(NO_ORGANIZATION_MESSAGE);
        }

        if (orgAction === 'notify-no-organization-and-redirect') {
          navigate(organizationsPath, { replace: true });
        }

        SET_IS_INITIALIZED(true);
      } catch (error) {
        console.error('[AppInitializer] init failed:', error);

        showErrorRef.current(INIT_FAILED_MESSAGE);
      } finally {
        isInitializingRef.current = false;

        if (!ignore) SET_IS_INITIALIZED(true);
      }
    };

    run();

    return () => {
      ignore = true;

      isInitializingRef.current = false;
    };
  }, [
    tenantId,
    userId,
    SET_IS_INITIALIZED,
    GET_ALL_USER_ORGS_BY_USER_ID,
    GET_CURRENT_USER,
    navigate,
  ]);

  if (!isInitialized) {
    return (
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.7)',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <Outlet />;
}
