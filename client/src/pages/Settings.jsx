import { useState, useEffect } from 'react';
import {
  Card, CardContent, Tabs, Tab, Grid, TextField, Button, Box, Typography, Stack, Divider,
  MenuItem, Switch, FormControlLabel, Snackbar, Alert, Chip, Avatar,
} from '@mui/material';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../components/PageHeader.jsx';
import DataTable from '../components/DataTable.jsx';
import { settingsApi, auditApi } from '../api/resource.js';
import { apiError } from '../api/client.js';
import { useAuth } from '../app/AuthContext.jsx';
import { titleCase, dateTime, money } from '../utils/format.js';

const TABS = ['Overview', 'Organization', 'Administrators', 'Billing', 'Branding', 'Email Settings', 'Notifications', 'Security', 'Audit Logs'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'NGN', 'KES', 'CAD', 'AUD'];
const DATE_FORMATS = ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY', 'D MMM YYYY'];

export default function Settings() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [tab, setTab] = useState(0);
  const [org, setOrg] = useState({});
  const [toast, setToast] = useState(null);
  const canEdit = hasRole('ngo_admin');

  const { data: orgData } = useQuery({ queryKey: ['settings-org'], queryFn: settingsApi.organization });
  const { data: billing } = useQuery({ queryKey: ['settings-billing'], queryFn: settingsApi.billing });
  const { data: audit } = useQuery({ queryKey: ['audit-logs'], queryFn: auditApi.list, enabled: tab === 8 });

  useEffect(() => { if (orgData) setOrg(orgData); }, [orgData]);

  const saveOrg = useMutation({
    mutationFn: (payload) => settingsApi.updateOrganization(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['settings-org'] }); setToast({ type: 'success', msg: 'Organization saved' }); },
    onError: (e) => setToast({ type: 'error', msg: apiError(e) }),
  });

  const setField = (k) => (e) => setOrg((o) => ({ ...o, [k]: e.target.value }));

  const InfoCard = ({ title, children }) => (
    <Card><CardContent><Typography variant="h6" gutterBottom>{title}</Typography>{children}</CardContent></Card>
  );

  return (
    <>
      <PageHeader title="Settings" subtitle="Configure your organization and workspace" icon={<SettingsRoundedIcon />} />

      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}>
          {TABS.map((t) => <Tab key={t} label={t} />)}
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Overview */}
          {tab === 0 && (
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={org.logo_url} sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>{(org.name || 'N')[0]}</Avatar>
                  <Box>
                    <Typography variant="h6">{org.name}</Typography>
                    <Typography color="text.secondary" variant="body2">{org.email}</Typography>
                    <Chip size="small" sx={{ mt: 0.5 }} color="success" variant="outlined" label={titleCase(org.status || 'active')} />
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Tenant ID</Typography>
                <Typography variant="body2" fontFamily="monospace" gutterBottom>{org.tenant_id}</Typography>
                <Typography variant="caption" color="text.secondary">Workspace ID</Typography>
                <Typography variant="body2" fontFamily="monospace">{org.workspace_id}</Typography>
              </Grid>
            </Grid>
          )}

          {/* Organization */}
          {tab === 1 && (
            <Grid container spacing={2.5}>
              {[
                ['name', 'NGO Name', 6], ['registration_number', 'Registration Number', 6],
                ['email', 'Email', 6], ['phone', 'Phone', 6],
                ['contact_email', 'Contact Email', 6], ['country', 'Country', 6],
                ['address', 'Address', 12],
              ].map(([key, label, cols]) => (
                <Grid item xs={12} sm={cols} key={key}>
                  <TextField label={label} value={org[key] || ''} onChange={setField(key)} fullWidth disabled={!canEdit} />
                </Grid>
              ))}
              <Grid item xs={12} sm={4}>
                <TextField select label="Timezone" value={org.timezone || 'UTC'} onChange={setField('timezone')} fullWidth disabled={!canEdit}>
                  {['UTC', 'America/New_York', 'Europe/London', 'Asia/Kolkata', 'Africa/Nairobi'].map((tz) => <MenuItem key={tz} value={tz}>{tz}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField select label="Date Format" value={org.date_format || 'YYYY-MM-DD'} onChange={setField('date_format')} fullWidth disabled={!canEdit}>
                  {DATE_FORMATS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField select label="Currency" value={org.currency || 'USD'} onChange={setField('currency')} fullWidth disabled={!canEdit}>
                  {CURRENCIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
              </Grid>
              {canEdit && (
                <Grid item xs={12}>
                  <Button variant="contained" onClick={() => saveOrg.mutate(org)} disabled={saveOrg.isPending}>
                    {saveOrg.isPending ? 'Saving…' : 'Save changes'}
                  </Button>
                </Grid>
              )}
            </Grid>
          )}

          {/* Administrators */}
          {tab === 2 && (
            <InfoCard title="Administrator access">
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Manage administrators and their roles in the dedicated administrators screen.
              </Typography>
              <Button variant="contained" onClick={() => navigate('/administrators')}>Open Administrators</Button>
            </InfoCard>
          )}

          {/* Billing */}
          {tab === 3 && (
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <InfoCard title="Current plan">
                  <Stack spacing={1}>
                    <Chip color="primary" label={titleCase(billing?.plan || 'free')} sx={{ width: 'fit-content' }} />
                    <Typography variant="h4">{money(billing?.amount || 0)}<Typography component="span" color="text.secondary">/mo</Typography></Typography>
                    <Typography variant="body2" color="text.secondary">Status: {titleCase(billing?.status || 'trialing')}</Typography>
                    <Typography variant="body2" color="text.secondary">Renews: {billing?.renews_at || '—'}</Typography>
                  </Stack>
                </InfoCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <InfoCard title="Upgrade">
                  <Typography color="text.secondary" sx={{ mb: 2 }}>Unlock more members, campaigns and storage with a higher tier.</Typography>
                  <Button variant="outlined">Manage subscription</Button>
                </InfoCard>
              </Grid>
            </Grid>
          )}

          {/* Branding */}
          {tab === 4 && (
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={8}>
                <TextField label="Logo URL" value={org.logo_url || ''} onChange={setField('logo_url')} fullWidth disabled={!canEdit} helperText="Shown on receipts and the portal." />
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar src={org.logo_url} variant="rounded" sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>{(org.name || 'N')[0]}</Avatar>
              </Grid>
              {canEdit && <Grid item xs={12}><Button variant="contained" onClick={() => saveOrg.mutate(org)}>Save branding</Button></Grid>}
            </Grid>
          )}

          {/* Email Settings */}
          {tab === 5 && (
            <InfoCard title="Email delivery">
              <Stack spacing={2} sx={{ maxWidth: 480 }}>
                <TextField label="From name" defaultValue={org.name} fullWidth />
                <TextField label="From email" defaultValue={org.contact_email || org.email} fullWidth />
                <TextField label="Reply-to" defaultValue={org.email} fullWidth />
                <FormControlLabel control={<Switch defaultChecked />} label="Include unsubscribe footer" />
              </Stack>
            </InfoCard>
          )}

          {/* Notifications */}
          {tab === 6 && (
            <InfoCard title="Notification preferences">
              <Stack>
                {['New donations', 'New members', 'Event reminders', 'Weekly summary', 'Campaign reports'].map((n, i) => (
                  <FormControlLabel key={n} control={<Switch defaultChecked={i < 3} />} label={n} />
                ))}
              </Stack>
            </InfoCard>
          )}

          {/* Security */}
          {tab === 7 && (
            <InfoCard title="Security">
              <Stack spacing={1.5} sx={{ maxWidth: 520 }}>
                <FormControlLabel control={<Switch />} label="Require two-factor authentication" />
                <FormControlLabel control={<Switch defaultChecked />} label="Email alerts on new device sign-in" />
                <Divider />
                <Typography variant="body2" color="text.secondary">
                  Sessions use short-lived JWT access tokens with refresh rotation. Passwords are hashed with bcrypt.
                </Typography>
              </Stack>
            </InfoCard>
          )}

          {/* Audit Logs */}
          {tab === 8 && (
            <DataTable
              columns={[
                { key: 'created_at', header: 'Time', render: (r) => dateTime(r.created_at) },
                { key: 'actor_name', header: 'Actor' },
                { key: 'action', header: 'Action', render: (r) => titleCase(r.action) },
                { key: 'entity', header: 'Entity' },
                { key: 'ip', header: 'IP' },
              ]}
              rows={audit?.data || []}
              emptyTitle="No audit events yet"
            />
          )}
        </Box>
      </Card>

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {toast && <Alert severity={toast.type} variant="filled">{toast.msg}</Alert>}
      </Snackbar>
    </>
  );
}
