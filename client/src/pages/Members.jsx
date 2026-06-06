import { Box, Avatar, Typography } from '@mui/material';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import { useNavigate } from 'react-router-dom';
import CrudPage from '../components/CrudPage.jsx';
import StatusChip from '../components/StatusChip.jsx';
import { membersApi } from '../api/resource.js';
import { useAuth } from '../app/AuthContext.jsx';
import { date, initials } from '../utils/format.js';

const MEMBERSHIP_TYPES = [
  { value: 1, label: 'Standard' },
  { value: 2, label: 'Premium' },
  { value: 3, label: 'Lifetime' },
  { value: 4, label: 'Student' },
];
const STATUSES = ['active', 'inactive', 'suspended', 'pending'].map((s) => ({ value: s, label: s }));

export default function Members() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const columns = [
    {
      key: 'name', header: 'Member',
      render: (r) => (
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 13 }}>
            {initials(`${r.first_name} ${r.last_name}`)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>{r.first_name} {r.last_name}</Typography>
            <Typography variant="caption" color="text.secondary">{r.member_code || `#${r.id}`}</Typography>
          </Box>
        </Box>
      ),
      exportValue: (r) => `${r.first_name} ${r.last_name}`,
    },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'status', header: 'Status', render: (r) => <StatusChip value={r.status} /> },
    { key: 'join_date', header: 'Join Date', render: (r) => date(r.join_date) },
  ];

  const fields = [
    { name: 'first_name', label: 'First Name', cols: 6, required: true },
    { name: 'last_name', label: 'Last Name', cols: 6, required: true },
    { name: 'email', label: 'Email', cols: 6, type: 'email' },
    { name: 'phone', label: 'Phone', cols: 6, type: 'tel' },
    { name: 'membership_type_id', label: 'Membership Type', cols: 6, type: 'select', options: MEMBERSHIP_TYPES },
    { name: 'status', label: 'Status', cols: 6, type: 'select', options: STATUSES },
    { name: 'join_date', label: 'Join Date', cols: 6, type: 'date' },
    { name: 'member_code', label: 'Member Code', cols: 6 },
    { name: 'address', label: 'Address', cols: 12 },
    { name: 'notes', label: 'Notes', cols: 12, multiline: true, rows: 2 },
  ];

  return (
    <CrudPage
      title="Members"
      subtitle="Manage your organization's membership base"
      icon={<GroupsRoundedIcon />}
      queryKey="members"
      api={membersApi}
      columns={columns}
      fields={fields}
      filters={[{ name: 'status', label: 'Status', options: STATUSES }]}
      searchPlaceholder="Search by name, email, code…"
      canWrite={hasRole('ngo_admin', 'staff')}
      onRowClick={(r) => navigate(`/members/${r.id}`)}
      importable
      toFormValues={(r) => ({
        first_name: r.first_name, last_name: r.last_name, email: r.email, phone: r.phone,
        membership_type_id: r.membership_type_id, status: r.status,
        join_date: r.join_date ? String(r.join_date).slice(0, 10) : '', member_code: r.member_code,
        address: r.address, notes: r.notes,
      })}
    />
  );
}
