import { useState } from 'react';
import { Grid, Tooltip, IconButton, Snackbar, Alert } from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CrudPage from '../components/CrudPage.jsx';
import StatCard from '../components/StatCard.jsx';
import StatusChip from '../components/StatusChip.jsx';
import { donationsApi, donationStatsApi, generateReceipt } from '../api/resource.js';
import { apiError } from '../api/client.js';
import { useAuth } from '../app/AuthContext.jsx';
import { money, date, titleCase } from '../utils/format.js';

const METHODS = ['cash', 'card', 'bank_transfer', 'cheque', 'online', 'other'].map((m) => ({ value: m, label: titleCase(m) }));
const STATUSES = ['received', 'pending', 'refunded'].map((s) => ({ value: s, label: titleCase(s) }));

export default function Donations() {
  const qc = useQueryClient();
  const { hasRole, tenant } = useAuth();
  const currency = tenant?.currency || 'USD';
  const [toast, setToast] = useState(null);

  const { data: stats } = useQuery({ queryKey: ['donation-stats'], queryFn: donationStatsApi.get });
  const t = stats?.totals || {};

  const receiptMutation = useMutation({
    mutationFn: (id) => generateReceipt(id),
    onSuccess: (r, _id) => {
      qc.invalidateQueries({ queryKey: ['receipts'] });
      setToast({ type: 'success', msg: `Receipt ${r.receipt_number} ready` });
    },
    onError: (e) => setToast({ type: 'error', msg: apiError(e) }),
  });

  const columns = [
    { key: 'donor_name', header: 'Donor' },
    { key: 'amount', header: 'Amount', align: 'right', render: (r) => money(r.amount, r.currency || currency) },
    { key: 'donation_date', header: 'Date', render: (r) => date(r.donation_date) },
    { key: 'payment_method', header: 'Method', render: (r) => titleCase(r.payment_method) },
    { key: 'purpose', header: 'Purpose' },
    { key: 'status', header: 'Status', render: (r) => <StatusChip value={r.status} /> },
  ];

  const fields = [
    { name: 'donor_name', label: 'Donor Name', cols: 12, required: true },
    { name: 'amount', label: 'Amount', cols: 6, type: 'number', min: 0, step: 1, required: true },
    { name: 'donation_date', label: 'Date', cols: 6, type: 'date', required: true },
    { name: 'payment_method', label: 'Payment Method', cols: 6, type: 'select', options: METHODS },
    { name: 'status', label: 'Status', cols: 6, type: 'select', options: STATUSES },
    { name: 'purpose', label: 'Purpose', cols: 6 },
    { name: 'recurring', label: 'Recurring donation', cols: 6, type: 'switch' },
    { name: 'notes', label: 'Notes', cols: 12, multiline: true, rows: 2 },
  ];

  return (
    <>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Total Donations" value={money(t.total, currency)} icon={<AttachMoneyRoundedIcon />} color="primary" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="This Month" value={money(t.thisMonth, currency)} icon={<FavoriteRoundedIcon />} color="secondary" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Recurring" value={money(t.recurring, currency)} icon={<RepeatRoundedIcon />} color="info" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Top Donor" value={stats?.topDonors?.[0]?.donor_name || '—'} icon={<EmojiEventsRoundedIcon />} color="warning" hint={stats?.topDonors?.[0] ? money(stats.topDonors[0].total, currency) : ''} /></Grid>
      </Grid>

      <CrudPage
        title="Donations"
        subtitle="Record gifts and track fundraising performance"
        queryKey="donations"
        api={donationsApi}
        columns={columns}
        fields={fields}
        filters={[
          { name: 'payment_method', label: 'Method', options: METHODS },
          { name: 'status', label: 'Status', options: STATUSES },
        ]}
        searchPlaceholder="Search donor, purpose…"
        canWrite={hasRole('ngo_admin', 'finance_manager')}
        transformPayload={(v) => ({ ...v, recurring: v.recurring ? 1 : 0 })}
        rowActionsExtra={(row) =>
          hasRole('ngo_admin', 'finance_manager') ? (
            <Tooltip title="Generate receipt">
              <IconButton size="small" color="primary" onClick={() => receiptMutation.mutate(row.id)}>
                <ReceiptLongRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null
        }
      />

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {toast && <Alert severity={toast.type} variant="filled">{toast.msg}</Alert>}
      </Snackbar>
    </>
  );
}
