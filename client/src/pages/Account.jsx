import { Card, CardContent, Grid, Avatar, Typography, Box, Stack, Chip, Button, FormControlLabel, Switch, Divider } from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../app/AuthContext.jsx';
import { useColorMode } from '../app/ColorModeContext.jsx';
import { initials, roleLabel } from '../utils/format.js';

export default function Account() {
  const { user, tenant, logout } = useAuth();
  const { mode, toggle } = useColorMode();

  return (
    <>
      <PageHeader title="My Account" subtitle="Your profile and preferences" icon={<PersonRoundedIcon />} />
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 88, height: 88, mx: 'auto', bgcolor: 'primary.main', fontSize: 32 }}>
                {initials(user?.name)}
              </Avatar>
              <Typography variant="h6" sx={{ mt: 2 }}>{user?.name}</Typography>
              <Typography color="text.secondary">{user?.email}</Typography>
              <Chip color="primary" variant="outlined" label={roleLabel(user?.role)} sx={{ mt: 1 }} />
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">Workspace</Typography>
              <Typography fontWeight={600}>{tenant?.name}</Typography>
              <Button color="error" variant="outlined" sx={{ mt: 2 }} onClick={logout}>Sign out</Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Preferences</Typography>
              <Stack spacing={1}>
                <FormControlLabel control={<Switch checked={mode === 'dark'} onChange={toggle} />} label="Dark mode" />
                <FormControlLabel control={<Switch defaultChecked />} label="Email notifications" />
                <FormControlLabel control={<Switch defaultChecked />} label="Product updates" />
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Account details</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 2 }}>
                <Box><Typography variant="caption" color="text.secondary">Role</Typography><Typography fontWeight={600}>{roleLabel(user?.role)}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Email verified</Typography><Typography fontWeight={600}>{user?.emailVerified ? 'Yes' : 'No'}</Typography></Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
