import OrgSwitcherMenu from '@app/layouts/SwitchOrganization/index';
import { Box, Button, Typography } from '@mui/material';
import { SvgIcon } from '@shared/ui';

interface IProps {
  isMyAccountPage: boolean;
  currentOrgName: string | null;
  rootMenuEl: HTMLElement | null;
  onBackToHome: () => void;
  onOpenRootMenu: (e: React.MouseEvent<HTMLElement>) => void;
  onCloseRootMenu: () => void;
}

const HeaderLeft = ({
  isMyAccountPage,
  currentOrgName,
  rootMenuEl,
  onBackToHome,
  onOpenRootMenu,
  onCloseRootMenu,
}: IProps) => (
  <Box className="header-left">
    <Button
      variant="text"
      startIcon={
        <SvgIcon
          name="HomeFilled"
          className="header-startIcon"
          sx={{ color: 'var(--common-white-_states-main)' }}
        />
      }
      className="header-button"
      onClick={onBackToHome}
    >
      <Typography variant="button" sx={{ fontSize: '15px' }}>
        WEDA
      </Typography>
    </Button>

    <span className="header-divider" />

    {isMyAccountPage ? (
      <Button
        variant="text"
        className="header-button"
        startIcon={
          <SvgIcon
            name="ArrowBackFilled"
            className="header-startIcon"
            sx={{ color: 'var(--common-white-_states-main)' }}
          />
        }
        onClick={onBackToHome}
      >
        Back to "{currentOrgName}"
      </Button>
    ) : (
      <Button
        variant="text"
        className="header-button"
        startIcon={
          <SvgIcon
            name="BusinessOutlined"
            className="header-startIcon"
            sx={{ color: 'var(--common-white-_states-main)' }}
          />
        }
        endIcon={
          <SvgIcon
            name="ArrowDropDownFilled"
            className="header-endIcon"
            sx={{ color: 'var(--common-white-_states-main)' }}
          />
        }
        onClick={onOpenRootMenu}
      >
        {currentOrgName || '—'}
      </Button>
    )}

    {!isMyAccountPage && (
      <OrgSwitcherMenu
        anchorEl={rootMenuEl}
        open={Boolean(rootMenuEl)}
        onClose={onCloseRootMenu}
      />
    )}
  </Box>
);

export default HeaderLeft;
