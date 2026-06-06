import {
  AppBar, Toolbar, IconButton, Box, Breadcrumbs, Link as MuiLink, Typography, Tooltip,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useColorMode } from '../app/ColorModeContext.jsx';
import { navLookup } from '../config/nav.jsx';
import { titleCase } from '../utils/format.js';
import NotificationMenu from './NotificationMenu.jsx';
import ProfileMenu from './ProfileMenu.jsx';

function useCrumbs() {
  const { pathname } = useLocation();
  if (pathname === '/') return [{ label: 'Dashboard', to: '/' }];
  const segments = pathname.split('/').filter(Boolean);
  const crumbs = [{ label: 'Dashboard', to: '/' }];
  let acc = '';
  segments.forEach((seg) => {
    acc += `/${seg}`;
    crumbs.push({ label: navLookup[acc] || titleCase(seg), to: acc });
  });
  return crumbs;
}

export default function Topbar({ onMenuClick }) {
  const { mode, toggle } = useColorMode();
  const crumbs = useCrumbs();

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        backdropFilter: 'blur(8px)',
        backgroundColor: (t) =>
          t.palette.mode === 'dark' ? 'rgba(17,27,46,.8)' : 'rgba(255,255,255,.8)',
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <IconButton onClick={onMenuClick} edge="start" sx={{ display: { lg: 'none' } }}>
          <MenuRoundedIcon />
        </IconButton>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Breadcrumbs
            separator={<NavigateNextRoundedIcon fontSize="small" />}
            sx={{ '& ol': { flexWrap: 'nowrap' } }}
          >
            {crumbs.map((c, i) =>
              i === crumbs.length - 1 ? (
                <Typography key={c.to} color="text.primary" fontWeight={700} noWrap>
                  {c.label}
                </Typography>
              ) : (
                <MuiLink key={c.to} component={RouterLink} to={c.to} underline="hover" color="text.secondary">
                  {c.label}
                </MuiLink>
              )
            )}
          </Breadcrumbs>
        </Box>

        <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
          <IconButton onClick={toggle} color="inherit">
            {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
          </IconButton>
        </Tooltip>
        <NotificationMenu />
        <ProfileMenu />
      </Toolbar>
    </AppBar>
  );
}
