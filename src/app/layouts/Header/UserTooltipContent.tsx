import { Box, Button, Tooltip, Typography } from '@mui/material';
import { SvgIcon } from '@shared/ui';

interface IProps {
  userProfile: {
    firstName?: string | null;
    lastName?: string | null;
    name?: string | null;
    email?: string | null;
    tenantName?: string;
  } | null;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
}

const UserTooltipContent = ({ userProfile, onClick }: IProps) => {
  const tooltipContent = (
    <Box className="header-user-tooltip">
      <Typography variant="body2">
        <strong>Name:</strong>{' '}
        {`${userProfile?.firstName || '-'}.${userProfile?.lastName || ''}`.trim() ||
          '-'}
      </Typography>
      <Typography variant="body2">
        <strong>Account:</strong> {userProfile?.email || '-'}
      </Typography>
      <Typography variant="body2">
        <strong>Tenant:</strong> {userProfile?.tenantName || '-'}
      </Typography>
    </Box>
  );

  return (
    <Tooltip
      title={tooltipContent}
      className="header-user-tooltip-popper"
      arrow
      placement="bottom-end"
    >
      <Button
        className="header-button"
        sx={{ width: '224px' }}
        startIcon={
          <SvgIcon
            name="AccountCircleFilled"
            className="header-startIcon"
            sx={{ color: 'var(--common-white-_states-main)' }}
          />
        }
        onClick={onClick}
      >
        <span className="header-user-span">
          {userProfile?.email || userProfile?.name}
        </span>
      </Button>
    </Tooltip>
  );
};

export default UserTooltipContent;
