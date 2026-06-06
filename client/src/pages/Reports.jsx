import { useState } from 'react';
import { Card, Tabs, Tab, Grid, Button, Box } from '@mui/material';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import PageHeader from '../components/PageHeader.jsx';
import ChartCard from '../components/ChartCard.jsx';
import { reportsApi } from '../api/resource.js';
import { exportToCsv } from '../utils/csv.js';
import { titleCase, money } from '../utils/format.js';

const REPORTS = ['Donation', 'Member', 'Volunteer', 'Event', 'Financial'];

export default function Reports() {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const colors = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.info.main, theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main];
  const tip = { borderRadius: 12, border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper };

  const donation = useQuery({ queryKey: ['rep-don'], queryFn: reportsApi.donations, enabled: tab === 0 });
  const member = useQuery({ queryKey: ['rep-mem'], queryFn: reportsApi.members, enabled: tab === 1 });
  const volunteer = useQuery({ queryKey: ['rep-vol'], queryFn: reportsApi.volunteers, enabled: tab === 2 });
  const event = useQuery({ queryKey: ['rep-evt'], queryFn: reportsApi.events, enabled: tab === 3 });
  const financial = useQuery({ queryKey: ['rep-fin'], queryFn: reportsApi.financial, enabled: tab === 4 });

  const exportData = (rows, cols, name) =>
    exportToCsv(name, cols.map((c) => ({ header: c, key: c })), rows);

  return (
    <>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Visual insights across your organization"
        icon={<BarChartRoundedIcon />}
      />

      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}>
          {REPORTS.map((r) => <Tab key={r} label={`${r} Report`} />)}
        </Tabs>

        <Box sx={{ p: 2.5 }}>
          {/* Donation report */}
          {tab === 0 && (
            <Grid container spacing={2.5}>
              <Grid item xs={12} display="flex" justifyContent="flex-end">
                <Button size="small" startIcon={<FileDownloadRoundedIcon />} onClick={() => exportData(donation.data?.byMonth || [], ['label', 'total', 'count'], 'donation-report.csv')}>Export CSV</Button>
              </Grid>
              <Grid item xs={12} lg={7}>
                <ChartCard title="Donations by Month">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(donation.data?.byMonth || []).slice().reverse()} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                      <YAxis tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                      <Tooltip formatter={(v) => money(v)} contentStyle={tip} />
                      <Bar dataKey="total" fill={theme.palette.primary.main} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>
              <Grid item xs={12} lg={5}>
                <ChartCard title="By Payment Method">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={(donation.data?.byMethod || []).map((d) => ({ name: titleCase(d.label), value: Number(d.total) }))} dataKey="value" nameKey="name" outerRadius={95}>
                        {(donation.data?.byMethod || []).map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                      </Pie>
                      <Legend /><Tooltip formatter={(v) => money(v)} contentStyle={tip} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>
            </Grid>
          )}

          {/* Member report */}
          {tab === 1 && (
            <Grid container spacing={2.5}>
              <Grid item xs={12} display="flex" justifyContent="flex-end">
                <Button size="small" startIcon={<FileDownloadRoundedIcon />} onClick={() => exportData(member.data?.byStatus || [], ['label', 'count'], 'member-report.csv')}>Export CSV</Button>
              </Grid>
              <Grid item xs={12} lg={6}>
                <ChartCard title="Members by Status">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={(member.data?.byStatus || []).map((d) => ({ name: titleCase(d.label), value: Number(d.count) }))} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95}>
                        {(member.data?.byStatus || []).map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                      </Pie>
                      <Legend /><Tooltip contentStyle={tip} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>
              <Grid item xs={12} lg={6}>
                <ChartCard title="Members by Type">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(member.data?.byType || []).map((d) => ({ name: d.label, count: Number(d.count) }))} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                      <YAxis tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                      <Tooltip contentStyle={tip} /><Bar dataKey="count" fill={theme.palette.info.main} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>
            </Grid>
          )}

          {/* Volunteer report */}
          {tab === 2 && (
            <Grid container spacing={2.5}>
              <Grid item xs={12} display="flex" justifyContent="flex-end">
                <Button size="small" startIcon={<FileDownloadRoundedIcon />} onClick={() => exportData(volunteer.data?.leaderboard || [], ['label', 'hours'], 'volunteer-report.csv')}>Export CSV</Button>
              </Grid>
              <Grid item xs={12}>
                <ChartCard title="Volunteer Hours Leaderboard">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(volunteer.data?.leaderboard || []).map((d) => ({ name: d.label, hours: Number(d.hours) }))} layout="vertical" margin={{ left: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                      <Tooltip contentStyle={tip} /><Bar dataKey="hours" fill={theme.palette.success.main} radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>
            </Grid>
          )}

          {/* Event report */}
          {tab === 3 && (
            <Grid container spacing={2.5}>
              <Grid item xs={12} display="flex" justifyContent="flex-end">
                <Button size="small" startIcon={<FileDownloadRoundedIcon />} onClick={() => exportData(event.data?.list || [], ['label', 'budget', 'participants'], 'event-report.csv')}>Export CSV</Button>
              </Grid>
              <Grid item xs={12}>
                <ChartCard title="Participants by Event">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(event.data?.list || []).map((d) => ({ name: d.label, participants: Number(d.participants) }))} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-12} textAnchor="end" height={60} stroke={theme.palette.text.secondary} />
                      <YAxis tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                      <Tooltip contentStyle={tip} /><Bar dataKey="participants" fill={theme.palette.secondary.main} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>
            </Grid>
          )}

          {/* Financial report */}
          {tab === 4 && (
            <Grid container spacing={2.5}>
              <Grid item xs={12} display="flex" justifyContent="flex-end">
                <Button size="small" startIcon={<FileDownloadRoundedIcon />} onClick={() => exportData(financial.data?.monthly || [], ['label', 'income'], 'financial-report.csv')}>Export CSV</Button>
              </Grid>
              <Grid item xs={12}>
                <ChartCard title="Income Trend">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(financial.data?.monthly || []).map((d) => ({ name: d.label, income: Number(d.income) }))} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                      <YAxis tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                      <Tooltip formatter={(v) => money(v)} contentStyle={tip} /><Bar dataKey="income" fill={theme.palette.primary.main} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>
            </Grid>
          )}
        </Box>
      </Card>
    </>
  );
}
