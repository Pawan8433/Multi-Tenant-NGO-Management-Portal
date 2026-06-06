import { useState } from 'react';
import {
  Box, Drawer, AppBar, Toolbar, IconButton, Typography, List, ListItemButton, ListItemIcon,
  ListItemText, Avatar, Menu, MenuItem, Divider, Tooltip, Chip,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import { superAdminNav, superAdminLookup } from '../config/superAdminNav.jsx';
import { useColorMode } from '../app/ColorModeContext.jsx';
import { useAuth } from '../app/AuthContext.jsx';
import { initials } from '../utils/format.js';

const WIDTH = 272;

function ConsoleBrand() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'grid', placeItems: 'center', color: '#fff',
        background: 'linear-gradient(135deg, #6366F1, #4338CA)', boxShadow: '0 6px 16px rgba(67,56,202,.4)' }}>
        <ShieldRoundedIcon />
      </Box>
      <Box sx={{ lineHeight: 1 }}>
        <Typography sx={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 18, color: '#fff' }}>
          Impact<span style={{ color: '#A5B4FC' }}>Hub</span>
        </Typography>
        <Typography sx={{ fontSize: 10.5, color: 'rgba(255,255,255,.6)', letterSpacing: '.12em' }}>
          PLATFORM CONSOLE
        </Typography>
      </Box>
    </Box>
  );
}

function ConsoleSidebar({ onNavigate }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = (p) => pathname.startsWith(p);
  const go = (p) => { navigate(p); onNavigate?.(); };

  return (
    // Always-dark "console" chrome to clearly separate from NGO workspaces.
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', color: '#fff',
      background: 'linear-gradient(180deg, #111827, #0B1220)' }}>
      <Toolbar sx={{ px: 2.5 }}><ConsoleBrand /></Toolbar>
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, mt: 1 }}>
        <Typography sx={{ px: 1.5, mb: 0.5, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: 'rgba(255,255,255,.4)' }}>
          ADMINISTRATION
        </Typography>
        <List dense disablePadding>
          {superAdminNav.map((item) => {
            const active = isActive(item.path);
            return (
              <ListItemButton key={item.path} onClick={() => go(item.path)}
                sx={{ borderRadius: 2, mb: 0.25, px: 1.5, py: 1,
                  color: active ? '#fff' : 'rgba(255,255,255,.7)',
                  bgcolor: active ? alpha('#6366F1', 0.35) : 'transparent',
                  '&:hover': { bgcolor: alpha('#6366F1', active ? 0.4 : 0.18) } }}>
                <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 700 : 600 }} />
              </ListItemButton>
            );
          })}
        </List>
      </Box>
      <Box sx={{ p: 2 }}>
        <Chip size="small" label="SUPER ADMIN" sx={{ bgcolor: alpha('#6366F1', 0.25), color: '#C7D2FE', fontWeight: 700 }} />
      </Box>
    </Box>
  );
}

export default function SuperAdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);
  const { mode, toggle } = useColorMode();
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const title = superAdminLookup[pathname] || (pathname.includes('/ngos/') ? 'NGO Profile' : 'Console');

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box component="nav" sx={{ width: { lg: WIDTH }, flexShrink: { lg: 0 } }}>
        <Drawer variant="permanent" open
          sx={{ display: { xs: 'none', lg: 'block' }, '& .MuiDrawer-paper': { width: WIDTH, boxSizing: 'border-box', border: 0 } }}>
          <ConsoleSidebar />
        </Drawer>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', lg: 'none' }, '& .MuiDrawer-paper': { width: WIDTH, boxSizing: 'border-box', border: 0 } }}>
          <ConsoleSidebar onNavigate={() => setMobileOpen(false)} />
        </Drawer>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="sticky" color="inherit" elevation={0}
          sx={{ borderBottom: 1, borderColor: 'divider', backdropFilter: 'blur(8px)',
            backgroundColor: (t) => t.palette.mode === 'dark' ? 'rgba(17,27,46,.8)' : 'rgba(255,255,255,.85)' }}>
          <Toolbar sx={{ gap: 1 }}>
            <IconButton onClick={() => setMobileOpen(true)} edge="start" sx={{ display: { lg: 'none' } }}>
              <MenuRoundedIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }}>{title}</Typography>
            <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
              <IconButton onClick={toggle} color="inherit">
                {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
              </IconButton>
            </Tooltip>
            <IconButton onClick={(e) => setAnchor(e.currentTarget)} size="small" sx={{ ml: 0.5 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: '#4338CA', fontSize: 14, fontWeight: 700 }}>
                {initials(user?.name)}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}
              PaperProps={{ sx: { width: 240, borderRadius: 3, mt: 1 } }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography fontWeight={700} noWrap>{user?.name}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>{user?.email}</Typography>
                <Chip size="small" color="primary" variant="outlined" label="Super Admin" sx={{ mt: 1 }} />
              </Box>
              <Divider />
              <MenuItem onClick={logout} sx={{ color: 'error.main' }}>
                <ListItemIcon><LogoutRoundedIcon fontSize="small" color="error" /></ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 }, maxWidth: 1440, width: '100%', mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
