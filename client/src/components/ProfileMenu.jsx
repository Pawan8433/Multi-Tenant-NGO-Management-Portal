import { useState } from 'react';
import {
  IconButton, Avatar, Menu, MenuItem, ListItemIcon, Divider, Box, Typography, Chip,
} from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../app/AuthContext.jsx';
import { initials, roleLabel } from '../utils/format.js';

export default function ProfileMenu() {
  const [anchor, setAnchor] = useState(null);
  const { user, tenant, logout } = useAuth();
  const navigate = useNavigate();

  const go = (path) => { setAnchor(null); navigate(path); };

  return (
    <>
      <IconButton onClick={(e) => setAnchor(e.currentTarget)} size="small" sx={{ ml: 0.5 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14, fontWeight: 700 }}>
          {initials(user?.name)}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        PaperProps={{ sx: { width: 260, borderRadius: 3, mt: 1 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography fontWeight={700} noWrap>{user?.name}</Typography>
          <Typography variant="body2" color="text.secondary" noWrap>{user?.email}</Typography>
          <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <Chip size="small" color="primary" variant="outlined" label={roleLabel(user?.role)} />
          </Box>
          {tenant?.name && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Workspace: {tenant.name}
            </Typography>
          )}
        </Box>
        <Divider />
        <MenuItem onClick={() => go('/account')}>
          <ListItemIcon><PersonRoundedIcon fontSize="small" /></ListItemIcon>
          My Account
        </MenuItem>
        <MenuItem onClick={() => go('/settings')}>
          <ListItemIcon><SettingsRoundedIcon fontSize="small" /></ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={logout} sx={{ color: 'error.main' }}>
          <ListItemIcon><LogoutRoundedIcon fontSize="small" color="error" /></ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>
    </>
  );
}
