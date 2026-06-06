import { Grid, Skeleton } from '@mui/material';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import { reportsApi } from '../api/resource.js';
import { useAuth } from '../app/AuthContext.jsx';
import { money, titleCase } from '../utils/format.js';

export default function Finances() {
  const theme = useTheme();
  const { tenant } = useAuth();
  const currency = tenant?.currency || 'USD';
  const { data: fin, isLoading } = useQuery({ queryKey: ['report-financial'], queryFn: reportsApi.financial });
  const { data: don } = useQuery({ queryKey: ['report-donations'], queryFn: reportsApi.donations });

  const monthly = (fin?.monthly || []).map((d) => ({ label: d.label, income: Number(d.income) }));
  const byMethod = (don?.byMethod || []).map((d) => ({ name: titleCase(d.label), value: Number(d.total) }));
  const colors = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.info.main, theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main];

  return (
    <>
      <PageHeader title="Finances" subtitle="Income, expenses and financial health" icon={<AccountBalanceRoundedIcon />} />

      <Grid container spacing={2.5} sx={{ mb: 1 }}>
        <Grid item xs={12} sm={6} md={4}><StatCard label="Total Income" value={money(fin?.income, currency)} icon={<TrendingUpRoundedIcon />} color="success" loading={isLoading} /></Grid>
        <Grid item xs={12} sm={6} md={4}><StatCard label="Budgeted Expenses" value={money(fin?.expenses, currency)} icon={<TrendingDownRoundedIcon />} color="error" loading={isLoading} /></Grid>
        <Grid item xs={12} sm={6} md={4}><StatCard label="Net Position" value={money(fin?.net, currency)} icon={<SavingsRoundedIcon />} color="primary" loading={isLoading} /></Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid item xs={12} lg={7}>
          <ChartCard title="Income by Month" subtitle="Donations received">
            {isLoading ? <Skeleton variant="rounded" height={260} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} margin={{ left: -10, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                  <YAxis tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                  <Tooltip formatter={(v) => money(v, currency)} contentStyle={{ borderRadius: 12, border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper }} />
                  <Bar dataKey="income" fill={theme.palette.primary.main} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>
        <Grid item xs={12} lg={5}>
          <ChartCard title="Income by Payment Method">
            {byMethod.length === 0 ? <Skeleton variant="rounded" height={260} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byMethod} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3}>
                    {byMethod.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(v) => money(v, currency)} contentStyle={{ borderRadius: 12, border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>
      </Grid>
    </>
  );
}
