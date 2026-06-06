import { useState } from 'react';
import {
  Box, Card, CardContent, Grid, Avatar, Typography, Tabs, Tab, Button, Stack, Divider, Skeleton,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { membersApi } from '../api/resource.js';
import StatusChip from '../components/StatusChip.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { initials, date } from '../utils/format.js';

const TABS = ['Profile Details', 'Membership', 'Donations', 'Events', 'Attendance', 'Notes', 'Documents', 'Privacy Settings'];

function Field({ label, value }) {
  return (
    <Grid item xs={12} sm={6}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body1" fontWeight={600}>{value || '—'}</Typography>
    </Grid>
  );
}

export default function MemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const { data: m, isLoading } = useQuery({ queryKey: ['member', id], queryFn: () => membersApi.get(id) });

  if (isLoading) return <Skeleton variant="rounded" height={400} />;
  if (!m) return <EmptyState title="Member not found" actionLabel="Back to members" onAction={() => navigate('/members')} />;

  return (
    <>
      <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/members')} sx={{ mb: 2 }}>
        Back to members
      </Button>

      <Card sx={{ mb: 2.5 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ sm: 'center' }}>
            <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: 26 }}>
              {initials(`${m.first_name} ${m.last_name}`)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5">{m.first_name} {m.last_name}</Typography>
              <Typography color="text.secondary">{m.email || 'No email'} · {m.member_code || `#${m.id}`}</Typography>
              <Box sx={{ mt: 1 }}><StatusChip value={m.status} /></Box>
            </Box>
            <Stack spacing={0.5} sx={{ textAlign: { sm: 'right' } }}>
              <Typography variant="caption" color="text.secondary">Joined</Typography>
              <Typography fontWeight={600}>{date(m.join_date)}</Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}>
          {TABS.map((t) => <Tab key={t} label={t} />)}
        </Tabs>
        <CardContent>
          {tab === 0 && (
            <Grid container spacing={2.5}>
              <Field label="First Name" value={m.first_name} />
              <Field label="Last Name" value={m.last_name} />
              <Field label="Email" value={m.email} />
              <Field label="Phone" value={m.phone} />
              <Field label="Address" value={m.address} />
              <Field label="Member Code" value={m.member_code} />
            </Grid>
          )}
          {tab === 1 && (
            <Grid container spacing={2.5}>
              <Field label="Membership Type" value={m.membership_type_id ? `Type #${m.membership_type_id}` : '—'} />
              <Field label="Status" value={m.status} />
              <Field label="Join Date" value={date(m.join_date)} />
              <Field label="Renewal Date" value={date(m.renewal_date)} />
            </Grid>
          )}
          {tab === 5 && (
            <>
              <Typography variant="subtitle2" gutterBottom>Notes</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography color={m.notes ? 'text.primary' : 'text.secondary'}>{m.notes || 'No notes recorded for this member.'}</Typography>
            </>
          )}
          {[2, 3, 4, 6, 7].includes(tab) && (
            <EmptyState
              title={`${TABS[tab]}`}
              description="Detailed records for this section will appear here as activity is recorded against the member."
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
