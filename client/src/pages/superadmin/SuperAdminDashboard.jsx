import { Grid, Card, CardContent, Typography, Box, List, ListItem, ListItemText, Skeleton, Chip, Button } from '@mui/material';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import ChartCard from '../../components/ChartCard.jsx';
import StatusChip from '../../components/StatusChip.jsx';
import { adminApi } from '../../api/admin.api.js';
import { money, number, date, titleCase } from '../../utils/format.js';

const mlabel = (m) => (m ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(m.split('-')[1]) - 1] : '');

export default function SuperAdminDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ['admin-dashboard'], queryFn: adminApi.dashboard });
  const t = data?.totals || {};
  const colors = [theme.palette.success.main, theme.palette.error.main, theme.palette.info.main, theme.palette.warning.main];
  const tip = { borderRadius: 12, border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper };

  return (
    <>
      <PageHeader title="Platform Overview" subtitle="Health and activity across all organizations" />

      <Grid container spacing={2.5} sx={{ mb: 1 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Total NGOs" value={number(t.ngos)} icon={<ApartmentRoundedIcon />} color="primary" loading={isLoading} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Total Members" value={number(t.members)} icon={<GroupsRoundedIcon />} color="info" loading={isLoading} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Total Donations" value={money(t.donations)} icon={<PaymentsRoundedIcon />} color="secondary" loading={isLoading} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Total Volunteers" value={number(t.volunteers)} icon={<VolunteerActivismRoundedIcon />} color="success" loading={isLoading} /></Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid item xs={12} lg={8}>
          <ChartCard title="Platform Donations" subtitle="All NGOs · last 12 months">
            {isLoading ? <Skeleton variant="rounded" height={260} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={(data?.monthlyDonations || []).map((d) => ({ label: mlabel(d.label), total: Number(d.total) }))} margin={{ left: -10, top: 8 }}>
                  <defs><linearGradient id="pd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.5} />
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                  </linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
                  <YAxis tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
                  <Tooltip formatter={(v) => money(v)} contentStyle={tip} />
                  <Area type="monotone" dataKey="total" stroke={theme.palette.primary.main} strokeWidth={2.5} fill="url(#pd)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>
        <Grid item xs={12} lg={4}>
          <ChartCard title="NGOs by Status">
            {isLoading ? <Skeleton variant="rounded" height={260} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={(data?.byStatus || []).map((d) => ({ name: titleCase(d.label), value: Number(d.count) }))} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3}>
                    {(data?.byStatus || []).map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                  </Pie>
                  <Legend /><Tooltip contentStyle={tip} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={7}>
          <ChartCard title="New NGOs" subtitle="Sign-ups per month">
            {isLoading ? <Skeleton variant="rounded" height={260} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(data?.newNgos || []).map((d) => ({ label: mlabel(d.label), count: Number(d.count) }))} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
                  <Tooltip contentStyle={tip} />
                  <Bar dataKey="count" fill={theme.palette.primary.main} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">Newest NGOs</Typography>
                <Button size="small" onClick={() => navigate('/superadmin/ngos')}>View all</Button>
              </Box>
              {isLoading ? <Skeleton variant="rounded" height={240} /> : (
                <List dense>
                  {(data?.recentNgos || []).map((n) => (
                    <ListItem key={n.id} disableGutters secondaryAction={<StatusChip value={n.status} />}
                      sx={{ cursor: 'pointer' }} onClick={() => navigate(`/superadmin/ngos/${n.id}`)}>
                      <ListItemText primary={n.name} secondary={`${n.plan_name} · joined ${date(n.created_at)}`} />
                    </ListItem>
                  ))}
                  {(data?.recentNgos || []).length === 0 && <Typography color="text.secondary" variant="body2">No NGOs yet.</Typography>}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
