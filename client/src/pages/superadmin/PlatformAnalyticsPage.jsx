import { Grid, Skeleton } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import PageHeader from '../../components/PageHeader.jsx';
import ChartCard from '../../components/ChartCard.jsx';
import { adminApi } from '../../api/admin.api.js';
import { money, titleCase } from '../../utils/format.js';

const mlabel = (m) => (m ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(m.split('-')[1]) - 1] : '');

export default function PlatformAnalyticsPage() {
  const theme = useTheme();
  const { data, isLoading } = useQuery({ queryKey: ['admin-dashboard'], queryFn: adminApi.dashboard });
  const colors = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.info.main, theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main];
  const tip = { borderRadius: 12, border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper };

  return (
    <>
      <PageHeader title="Platform Analytics" subtitle="Trends across organizations, plans and revenue" />
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7}>
          <ChartCard title="Donations Across Platform" subtitle="Last 12 months">
            {isLoading ? <Skeleton variant="rounded" height={260} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={(data?.monthlyDonations || []).map((d) => ({ label: mlabel(d.label), total: Number(d.total) }))} margin={{ left: -10, top: 8 }}>
                  <defs><linearGradient id="pa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.5} />
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                  </linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
                  <YAxis tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
                  <Tooltip formatter={(v) => money(v)} contentStyle={tip} />
                  <Area type="monotone" dataKey="total" stroke={theme.palette.primary.main} strokeWidth={2.5} fill="url(#pa)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>
        <Grid item xs={12} lg={5}>
          <ChartCard title="NGOs by Plan">
            {isLoading ? <Skeleton variant="rounded" height={260} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={(data?.byPlan || []).map((d) => ({ name: d.label, value: Number(d.count) }))} dataKey="value" nameKey="name" outerRadius={95}>
                    {(data?.byPlan || []).map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                  </Pie>
                  <Legend /><Tooltip contentStyle={tip} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>
        <Grid item xs={12} lg={6}>
          <ChartCard title="NGOs by Status">
            {isLoading ? <Skeleton variant="rounded" height={260} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(data?.byStatus || []).map((d) => ({ name: titleCase(d.label), count: Number(d.count) }))} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
                  <Tooltip contentStyle={tip} /><Bar dataKey="count" fill={theme.palette.info.main} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>
        <Grid item xs={12} lg={6}>
          <ChartCard title="New NGO Sign-ups">
            {isLoading ? <Skeleton variant="rounded" height={260} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(data?.newNgos || []).map((d) => ({ name: mlabel(d.label), count: Number(d.count) }))} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
                  <Tooltip contentStyle={tip} /><Bar dataKey="count" fill={theme.palette.secondary.main} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>
      </Grid>
    </>
  );
}
