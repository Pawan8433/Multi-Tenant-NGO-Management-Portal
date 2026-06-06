import { Card, CardContent, Grid, Typography, Button, Box, Stack, Switch, FormControlLabel, TextField } from '@mui/material';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../app/AuthContext.jsx';

export default function Website() {
  const { tenant } = useAuth();
  const slug = (tenant?.name || 'your-ngo').toLowerCase().replace(/\s+/g, '-');

  return (
    <>
      <PageHeader
        title="Public Website"
        subtitle="Your donation and membership microsite"
        icon={<LanguageRoundedIcon />}
        actions={<Button variant="contained" endIcon={<OpenInNewRoundedIcon />}>Preview site</Button>}
      />
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Site settings</Typography>
              <Stack spacing={2}>
                <TextField label="Public URL" value={`https://impacthub.app/${slug}`} fullWidth InputProps={{ readOnly: true }} />
                <TextField label="Headline" defaultValue={`Support ${tenant?.name || 'our mission'}`} fullWidth />
                <TextField label="About" defaultValue="Tell visitors about your mission and impact." fullWidth multiline rows={3} />
                <FormControlLabel control={<Switch defaultChecked />} label="Accept online donations" />
                <FormControlLabel control={<Switch defaultChecked />} label="Show events calendar" />
                <FormControlLabel control={<Switch />} label="Enable volunteer sign-up" />
                <Box><Button variant="contained">Save & publish</Button></Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Live preview</Typography>
              <Box sx={{ borderRadius: 3, p: 3, color: '#fff', background: 'linear-gradient(135deg, #0F766E, #0B1220)', minHeight: 240 }}>
                <Typography variant="overline" sx={{ color: 'rgba(255,255,255,.7)' }}>{tenant?.name}</Typography>
                <Typography variant="h5" sx={{ color: '#fff', my: 1 }}>Support {tenant?.name || 'our mission'}</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,.85)', mb: 2 }}>Your generosity creates lasting change in our community.</Typography>
                <Button variant="contained" color="secondary">Donate now</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
