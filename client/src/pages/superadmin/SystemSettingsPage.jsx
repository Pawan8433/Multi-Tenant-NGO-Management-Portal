import { Grid, Card, CardContent, Typography, Stack, TextField, FormControlLabel, Switch, Divider, Button, Box, Chip } from '@mui/material';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import PageHeader from '../../components/PageHeader.jsx';
import { useAuth } from '../../app/AuthContext.jsx';

export default function SystemSettingsPage() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader title="System Settings" subtitle="Platform-wide configuration" icon={<TuneRoundedIcon />} />
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Platform</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <TextField label="Platform name" defaultValue="ImpactHub" fullWidth />
                <TextField label="Support email" defaultValue="support@impacthub.app" fullWidth />
                <TextField label="Default trial length (days)" type="number" defaultValue={14} fullWidth />
                <Button variant="contained" sx={{ alignSelf: 'flex-start' }}>Save</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Registration & Access</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack>
                <FormControlLabel control={<Switch defaultChecked />} label="Allow new NGO sign-ups" />
                <FormControlLabel control={<Switch defaultChecked />} label="Require email verification" />
                <FormControlLabel control={<Switch />} label="Maintenance mode (block tenant logins)" />
                <FormControlLabel control={<Switch defaultChecked />} label="Enable impersonation auditing" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Your platform account</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr 1fr' }, gap: 2 }}>
                <Box><Typography variant="caption" color="text.secondary">Name</Typography><Typography fontWeight={600}>{user?.name}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Email</Typography><Typography fontWeight={600}>{user?.email}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Role</Typography><Box><Chip size="small" color="primary" label="Super Admin" /></Box></Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
