import { Grid, Card, CardContent } from '@mui/material';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import DataTable from '../../components/DataTable.jsx';
import StatusChip from '../../components/StatusChip.jsx';
import { adminApi } from '../../api/admin.api.js';
import { money, number, date, titleCase } from '../../utils/format.js';

export default function SubscriptionsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-billing'], queryFn: adminApi.billing });
  const c = data?.counts || {};

  const columns = [
    { key: 'name', header: 'NGO' },
    { key: 'plan_name', header: 'Plan' },
    { key: 'billing_cycle', header: 'Billing', render: (r) => titleCase(r.billing_cycle || 'monthly') },
    { key: 'amount', header: 'Amount', align: 'right', render: (r) => money(r.amount) },
    { key: 'status', header: 'Status', render: (r) => <StatusChip value={r.status} /> },
    { key: 'renewal_date', header: 'Renewal', render: (r) => date(r.renewal_date) },
  ];

  return (
    <>
      <PageHeader title="Subscriptions & Billing" subtitle="Revenue and plan distribution across the platform" />

      <Grid container spacing={2.5} sx={{ mb: 1 }}>
        <Grid item xs={6} md={2}><StatCard label="Total NGOs" value={number(c.total)} icon={<ApartmentRoundedIcon />} color="primary" loading={isLoading} /></Grid>
        <Grid item xs={6} md={2}><StatCard label="Trial" value={number(c.trial)} icon={<ScienceRoundedIcon />} color="info" loading={isLoading} /></Grid>
        <Grid item xs={6} md={2}><StatCard label="Paid / Active" value={number(c.paid)} icon={<PaidRoundedIcon />} color="success" loading={isLoading} /></Grid>
        <Grid item xs={6} md={2}><StatCard label="Suspended" value={number(c.suspended)} icon={<BlockRoundedIcon />} color="error" loading={isLoading} /></Grid>
        <Grid item xs={6} md={2}><StatCard label="Monthly Revenue" value={money(data?.monthlyRevenue)} icon={<CalendarMonthRoundedIcon />} color="secondary" loading={isLoading} /></Grid>
        <Grid item xs={6} md={2}><StatCard label="Annual Revenue" value={money(data?.annualRevenue)} icon={<EventAvailableRoundedIcon />} color="warning" loading={isLoading} /></Grid>
      </Grid>

      <Card sx={{ mt: 1 }}>
        <CardContent>
          <DataTable columns={columns} rows={data?.table || []} loading={isLoading} emptyTitle="No subscriptions" />
        </CardContent>
      </Card>
    </>
  );
}
