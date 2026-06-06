import { useState } from 'react';
import { Box, Drawer, Alert, Button } from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { Outlet } from 'react-router-dom';
import Sidebar, { SIDEBAR_WIDTH } from '../components/Sidebar.jsx';
import Topbar from '../components/Topbar.jsx';
import { useAuth } from '../app/AuthContext.jsx';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isImpersonating, impersonatingNgo, exitImpersonation } = useAuth();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Permanent sidebar (desktop) */}
      <Box
        component="nav"
        sx={{ width: { lg: SIDEBAR_WIDTH }, flexShrink: { lg: 0 } }}
      >
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              width: SIDEBAR_WIDTH,
              boxSizing: 'border-box',
              borderRight: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            },
          }}
        >
          <Sidebar />
        </Drawer>

        {/* Temporary drawer (mobile) */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, boxSizing: 'border-box', bgcolor: 'background.paper' },
          }}
        >
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </Drawer>
      </Box>

      {/* Main column */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        {isImpersonating && (
          <Alert
            severity="warning"
            icon={<VisibilityRoundedIcon />}
            sx={{ borderRadius: 0, justifyContent: 'center', alignItems: 'center', fontWeight: 600 }}
            action={
              <Button color="inherit" size="small" variant="outlined" onClick={exitImpersonation}>
                Exit impersonation
              </Button>
            }
          >
            Currently impersonating <strong>{impersonatingNgo}</strong> — actions are performed as this organization.
          </Alert>
        )}
        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 }, maxWidth: 1440, width: '100%', mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
