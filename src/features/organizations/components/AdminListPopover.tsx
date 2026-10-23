import './AdminListPopover.scss';

import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Popover,
  Typography,
} from '@mui/material';

interface AdminUser {
  userId: string;
  name: string;
  email?: string | null;
}

interface AdminListPopoverProps {
  anchorEl: HTMLElement | null;
  admins: AdminUser[];
  onClose: () => void;
}

function getInitial(name?: string) {
  return name?.trim()?.charAt(0)?.toUpperCase() || '-';
}

export default function AdminListPopover({
  anchorEl,
  admins,
  onClose,
}: AdminListPopoverProps) {
  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      className="admin-popover"
      disableAutoFocus
      disableEnforceFocus
      disableRestoreFocus
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
      <List className="admin-popover__content">
        {admins.map((admin) => (
          <ListItem key={admin.userId} className="admin-popover__content-item">
            <ListItemAvatar sx={{ minWidth: '24px', height: '24px' }}>
              <Avatar
                className="admin-popover__content-item-avatar"
                sx={{ width: 24, height: 24 }}
              >
                {getInitial(admin.name)}
              </Avatar>
            </ListItemAvatar>

            <ListItemText
              className="admin-popover__content-item-text"
              sx={{ margin: 0 }}
              primary={
                <Typography
                  variant="body2"
                  color="text.primary"
                  fontSize={16}
                  className="admin-popover__content-item-name"
                >
                  {admin.name || '-'}
                </Typography>
              }
              secondary={
                <Typography
                  variant="caption"
                  color="text.secondary"
                  className="admin-popover__content-item-email"
                >
                  {admin.email ? `(${admin.email})` : ''}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Popover>
  );
}
