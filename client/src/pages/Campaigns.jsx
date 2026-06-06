import MailRoundedIcon from '@mui/icons-material/MailRounded';
import { Box, LinearProgress, Typography } from '@mui/material';
import CrudPage from '../components/CrudPage.jsx';
import StatusChip from '../components/StatusChip.jsx';
import { campaignsApi } from '../api/resource.js';
import { useAuth } from '../app/AuthContext.jsx';
import { number, titleCase } from '../utils/format.js';

const STATUSES = ['draft', 'scheduled', 'sending', 'sent'].map((s) => ({ value: s, label: titleCase(s) }));
const SEGMENTS = ['all', 'members', 'donors', 'volunteers'].map((s) => ({ value: s, label: titleCase(s) }));

const rate = (n, d) => (d ? Math.round((n / d) * 100) : 0);

export default function Campaigns() {
  const { hasRole } = useAuth();

  const columns = [
    { key: 'name', header: 'Campaign' },
    { key: 'segment', header: 'Segment', render: (r) => titleCase(r.segment) },
    { key: 'recipients', header: 'Sent', align: 'right', render: (r) => number(r.recipients) },
    {
      key: 'opens', header: 'Open rate',
      render: (r) => (
        <Box sx={{ minWidth: 110 }}>
          <Typography variant="caption">{rate(r.opens, r.recipients)}%</Typography>
          <LinearProgress variant="determinate" value={rate(r.opens, r.recipients)} sx={{ height: 6, borderRadius: 3 }} />
        </Box>
      ),
    },
    { key: 'clicks', header: 'Clicks', align: 'right', render: (r) => number(r.clicks) },
    { key: 'status', header: 'Status', render: (r) => <StatusChip value={r.status} /> },
  ];

  const fields = [
    { name: 'name', label: 'Campaign Name', cols: 12, required: true },
    { name: 'subject', label: 'Subject Line', cols: 12 },
    { name: 'segment', label: 'Audience Segment', cols: 6, type: 'select', options: SEGMENTS },
    { name: 'status', label: 'Status', cols: 6, type: 'select', options: STATUSES },
    { name: 'scheduled_at', label: 'Schedule', cols: 12, type: 'datetime-local' },
    { name: 'body', label: 'Email Body', cols: 12, multiline: true, rows: 4 },
  ];

  return (
    <CrudPage
      title="Email Campaigns"
      subtitle="Create, segment, schedule and track campaigns"
      icon={<MailRoundedIcon />}
      queryKey="campaigns"
      api={campaignsApi}
      columns={columns}
      fields={fields}
      filters={[{ name: 'status', label: 'Status', options: STATUSES }, { name: 'segment', label: 'Segment', options: SEGMENTS }]}
      searchPlaceholder="Search campaigns…"
      canWrite={hasRole('ngo_admin', 'staff')}
      toFormValues={(r) => ({
        ...r,
        scheduled_at: r.scheduled_at ? String(r.scheduled_at).replace(' ', 'T').slice(0, 16) : '',
      })}
    />
  );
}
