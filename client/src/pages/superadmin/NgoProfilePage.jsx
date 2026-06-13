import { useState } from 'react';
import {
  Box, Card, CardContent, Grid, Typography, Button, Stack, Divider, Avatar, Skeleton, Chip,
  Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Checkbox,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import StatusChip from '../../components/StatusChip.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { adminApi } from '../../api/admin.api.js';
import { apiError } from '../../api/client.js';
import { useAuth } from '../../app/AuthContext.jsx';
import { money, number, date, dateTime, roleLabel, titleCase } from '../../utils/format.js';

import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';

function Field({ label, value }) {
  return (
    <Grid item xs={12} sm={6}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body1" fontWeight={600}>{value || '—'}</Typography>
    </Grid>
  );
}

export default function NgoProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { enterImpersonation } = useAuth();
  const [suspendDlg, setSuspendDlg] = useState(false);
  const [reason, setReason] = useState('');
  const [deleteDlg, setDeleteDlg] = useState(false);
  const [permanent, setPermanent] = useState(false);
  const [toast, setToast] = useState(null);

  const { data, isLoading } = useQuery({ queryKey: ['admin-ngo', id], queryFn: () => adminApi.getNgo(id) });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-ngo', id] });
  const fail = (e) => setToast({ type: 'error', msg: apiError(e) });

  const statusMut = useMutation({
    mutationFn: (body) => adminApi.setStatus(id, body),
    onSuccess: () => { invalidate(); setSuspendDlg(false); setReason(''); setToast({ type: 'success', msg: 'Status updated' }); },
    onError: fail,
  });
  const impersonateMut = useMutation({ mutationFn: () => adminApi.impersonate(id), onSuccess: enterImpersonation, onError: fail });
  const deleteMut = useMutation({
    mutationFn: (perm) => adminApi.deleteNgo(id, perm),
    onSuccess: () => { setToast({ type: 'success', msg: 'NGO deleted' }); setDeleteDlg(false); setTimeout(() => navigate('/superadmin/ngos'), 800); },
    onError: fail,
  });

  if (isLoading) return <Skeleton variant="rounded" height={500} />;
  if (!data?.ngo) return <EmptyState title="NGO not found" actionLabel="Back to directory" onAction={() => navigate('/superadmin/ngos')} />;

  const { ngo, stats, subscription, admins } = data;
  const suspended = ngo.status === 'suspended';

  return (
    <>
      <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/superadmin/ngos')} sx={{ mb: 2 }}>
        Back to directory
      </Button>

      <Card sx={{ mb: 2.5 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems={{ md: 'center' }}>
            <Avatar src={ngo.logo_url} sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: 28 }}>{ngo.name?.[0]}</Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5">{ngo.name}</Typography>
              <Typography color="text.secondary">{ngo.email} · {ngo.registration_number || `#${ngo.id}`}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <StatusChip value={ngo.status} />
                <Chip size="small" variant="outlined" label={ngo.plan_name} />
              </Stack>
              {suspended && ngo.suspension_reason && (
                <Alert severity="warning" sx={{ mt: 1.5 }}>Suspension reason: {ngo.suspension_reason}</Alert>
              )}
            </Box>
            <Stack spacing={1} direction={{ xs: 'row', md: 'column' }} sx={{ flexWrap: 'wrap' }}>
              <Button variant="contained" startIcon={<LoginRoundedIcon />} disabled={suspended || ngo.status === 'expired'}
                onClick={() => impersonateMut.mutate()}>Impersonate</Button>
              {ngo.status !== 'active' && (
                <Button color="success" variant="outlined" startIcon={<CheckCircleRoundedIcon />}
                  onClick={() => statusMut.mutate({ status: 'active' })}>
                  {suspended ? 'Reactivate' : 'Activate'}
                </Button>
              )}
              {ngo.status !== 'suspended' && (
                <Button color="warning" variant="outlined" startIcon={<BlockRoundedIcon />}
                  onClick={() => setSuspendDlg(true)}>Suspend</Button>
              )}
              <Button color="error" variant="outlined" startIcon={<DeleteRoundedIcon />}
                onClick={() => setDeleteDlg(true)}>Delete</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Grid container spacing={2.5} sx={{ mb: 1 }}>
        <Grid item xs={6} md={2.4}><StatCard label="Members" value={number(stats.members)} icon={<GroupsRoundedIcon />} color="primary" /></Grid>
        <Grid item xs={6} md={2.4}><StatCard label="Volunteers" value={number(stats.volunteers)} icon={<VolunteerActivismRoundedIcon />} color="info" /></Grid>
        <Grid item xs={6} md={2.4}><StatCard label="Donations" value={money(stats.donationsTotal)} icon={<PaymentsRoundedIcon />} color="secondary" hint={`${number(stats.donationsCount)} gifts`} /></Grid>
        <Grid item xs={6} md={2.4}><StatCard label="Events" value={number(stats.events)} icon={<EventRoundedIcon />} color="success" /></Grid>
        <Grid item xs={6} md={2.4}><StatCard label="Campaigns" value={number(stats.campaigns)} icon={<CampaignRoundedIcon />} color="warning" /></Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Organization Information</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2.5}>
                <Field label="NGO Name" value={ngo.name} />
                <Field label="Registration Number" value={ngo.registration_number} />
                <Field label="Contact Email" value={ngo.contact_email || ngo.email} />
                <Field label="Contact Phone" value={ngo.phone} />
                <Field label="Website" value={ngo.website} />
                <Field label="Country" value={ngo.country} />
                <Field label="Address" value={ngo.address} />
                <Field label="Created" value={date(ngo.created_at)} />
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Subscription</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5}>
                <Box><Typography variant="caption" color="text.secondary">Plan</Typography>
                  <Typography fontWeight={700}>{ngo.plan_name}{subscription ? ` · ${money(subscription.amount)}` : ''}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Billing Cycle</Typography>
                  <Typography fontWeight={600}>{titleCase(ngo.billing_cycle || 'monthly')}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Renewal Date</Typography>
                  <Typography fontWeight={600}>{date(ngo.renewal_date)}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box><StatusChip value={subscription?.status || ngo.status} /></Box></Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Administrators ({admins?.length || 0})</Typography>
              <Divider sx={{ mb: 1 }} />
              <Stack divider={<Divider flexItem />}>
                {(admins || []).map((a) => (
                  <Box key={a.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 13 }}>{a.name?.[0]}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{a.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{a.email}</Typography>
                    </Box>
                    <Chip size="small" variant="outlined" label={roleLabel(a.role)} />
                    <Typography variant="caption" color="text.secondary" sx={{ width: 160, textAlign: 'right' }}>
                      Last login {dateTime(a.last_login)}
                    </Typography>
                  </Box>
                ))}
                {(admins || []).length === 0 && <Typography color="text.secondary" variant="body2">No administrators.</Typography>}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Suspend dialog */}
      <Dialog open={suspendDlg} onClose={() => setSuspendDlg(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700}>Suspend {ngo.name}</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Suspended organizations cannot log in.</Typography>
          <TextField label="Suspension reason" value={reason} onChange={(e) => setReason(e.target.value)} fullWidth multiline rows={3} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setSuspendDlg(false)}>Cancel</Button>
          <Button variant="contained" color="warning" disabled={statusMut.isPending}
            onClick={() => statusMut.mutate({ status: 'suspended', suspension_reason: reason })}>Suspend</Button>
        </DialogActions>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={deleteDlg} onClose={() => setDeleteDlg(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700}>Delete {ngo.name}</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            Soft delete hides the NGO and blocks login while retaining data. Permanent delete removes everything.
          </Typography>
          <FormControlLabel control={<Checkbox checked={permanent} onChange={(e) => setPermanent(e.target.checked)} color="error" />}
            label="Permanently delete all data (cannot be undone)" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setDeleteDlg(false)}>Cancel</Button>
          <Button variant="contained" color="error" disabled={deleteMut.isPending} onClick={() => deleteMut.mutate(permanent)}>
            {permanent ? 'Permanently delete' : 'Soft delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {toast && <Alert severity={toast.type} variant="filled">{toast.msg}</Alert>}
      </Snackbar>
    </>
  );
}
