import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography, Toolbar } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Brand from './Brand.jsx';
import { navSections } from '../config/nav.jsx';

export const SIDEBAR_WIDTH = 268;

export default function Sidebar({ onNavigate }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path) => (path === '/' ? pathname === '/' : pathname.startsWith(path));

  const go = (path) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 2.5 }}>
        <Brand />
      </Toolbar>

      <Box sx={{ overflowY: 'auto', flex: 1, px: 1.5, pb: 2 }}>
        {navSections.map((section) => (
          <Box key={section.heading} sx={{ mt: 2 }}>
            <Typography
              sx={{ px: 1.5, mb: 0.5, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: 'text.secondary' }}
            >
              {section.heading.toUpperCase()}
            </Typography>
            <List dense disablePadding>
              {section.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <ListItemButton
                    key={item.path}
                    onClick={() => go(item.path)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.25,
                      px: 1.5,
                      py: 0.9,
                      color: active ? 'primary.main' : 'text.secondary',
                      bgcolor: active ? (t) => alpha(t.palette.primary.main, 0.12) : 'transparent',
                      '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, active ? 0.16 : 0.06) },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 700 : 600 }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
