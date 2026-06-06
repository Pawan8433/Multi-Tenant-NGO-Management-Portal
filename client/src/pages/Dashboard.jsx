import { Grid, Card, CardContent, Box, Typography, Button, List, ListItem, ListItemAvatar, Avatar, ListItemText, Stack, Skeleton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from 'recharts';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useTheme } from '@mui/material/styles';
import StatCard from '../components/StatCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { dashboardApi } from '../api/resource.js';
import { useAuth } from '../app/AuthContext.jsx';
import { money, number, titleCase, fromNow } from '../utils/format.js';

const monthLabel = (m) => {
  if (!m) return '';
  const [, mm] = m.split('-');
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(mm) - 1] || m;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, tenant } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.get });

  const s = data?.stats || {};
  const currency = tenant?.currency || 'USD';

  const stats = [
    { label: 'Total Members', value: number(s.members), icon: <GroupsRoundedIcon />, color: 'primary' },
    { label: 'Total Donations', value: money(s.donationsTotal, currency), icon: <FavoriteRoundedIcon />, color: 'secondary' },
    { label: 'Total Volunteers', value: number(s.volunteers), icon: <VolunteerActivismRoundedIcon />, color: 'info' },
    { label: 'Total Events', value: number(s.events), icon: <EventRoundedIcon />, color: 'success' },
    { label: 'Active Campaigns', value: number(s.activeCampaigns), icon: <CampaignRoundedIcon />, color: 'warning' },
    { label: 'Pending Receipts', value: number(s.pendingReceipts), icon: <ReceiptLongRoundedIcon />, color: 'error' },
  ];

  const quickActions = [
    { label: 'Add Member', to: '/members' },
    { label: 'Record Donation', to: '/donations' },
    { label: 'Create Event', to: '/events' },
    { label: 'Add Volunteer', to: '/volunteers' },
    { label: 'Generate Report', to: '/reports' },
  ];

  const monthly = (data?.monthlyDonations || []).map((d) => ({ month: monthLabel(d.month), total: Number(d.total) }));
  const participation = (data?.eventParticipation || []).map((d) => ({ name: d.title, participants: Number(d.participants) }));
  const volunteerActivity = (data?.volunteerActivity || []).map((d) => ({ name: d.name, hours: Number(d.hours) }));

  const barColors = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.info.main, theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'} 👋`}
        subtitle={`Here's what's happening at ${tenant?.name || 'your organization'} today.`}
        actions={<Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate('/donations')}>Record Donation</Button>}
      />

      {/* Stat widgets */}
      <Grid container spacing={2.5} sx={{ mb: 1 }}>
        {stats.map((st) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={st.label}>
            <StatCard {...st} loading={isLoading} />
          </Grid>
        ))}
      </Grid>

      {/* Quick actions */}
      <Stack direction="row" spacing={1.5} sx={{ my: 2, flexWrap: 'wrap', gap: 1 }}>
        {quickActions.map((q) => (
          <Button key={q.label} variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => navigate(q.to)}>
            {q.label}
          </Button>
        ))}
      </Stack>

      {/* Charts */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <ChartCard title="Monthly Donations" subtitle="Last 12 months">
            {isLoading ? <Skeleton variant="rounded" height={260} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly} margin={{ left: -16, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="don" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.5} />
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
                  <YAxis tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
                  <Tooltip
                    formatter={(v) => money(v, currency)}
                    contentStyle={{ borderRadius: 12, border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper }}
                  />
                  <Area type="monotone" dataKey="total" stroke={theme.palette.primary.main} strokeWidth={2.5} fill="url(#don)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <ChartCard title="Volunteer Activity" subtitle="Hours contributed">
            {isLoading ? <Skeleton variant="rounded" height={260} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volunteerActivity} layout="vertical" margin={{ left: 20, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper }} />
                  <Bar dataKey="hours" radius={[0, 6, 6, 0]} fill={theme.palette.info.main} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={7}>
          <ChartCard title="Event Participation" subtitle="Registrations per event">
            {isLoading ? <Skeleton variant="rounded" height={260} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={participation} margin={{ left: -16, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-12} textAnchor="end" height={50} stroke={theme.palette.text.secondary} />
                  <YAxis tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper }} />
                  <Bar dataKey="participants" radius={[6, 6, 0, 0]}>
                    {participation.map((_, i) => (<Cell key={i} fill={barColors[i % barColors.length]} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>Recent Activity</Typography>
              {isLoading ? (
                <Skeleton variant="rounded" height={260} />
              ) : (
                <List dense>
                  {(data?.recentActivity || []).map((a, i) => (
                    <ListItem key={i} disableGutters>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'action.selected', color: 'primary.main', width: 36, height: 36 }}>
                          <FavoriteRoundedIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={titleCase(a.action)}
                        secondary={`${a.actor_name || 'System'} · ${fromNow(a.created_at)}`}
                      />
                    </ListItem>
                  ))}
                  {(data?.recentActivity || []).length === 0 && (
                    <Typography color="text.secondary" variant="body2">No recent activity.</Typography>
                  )}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
