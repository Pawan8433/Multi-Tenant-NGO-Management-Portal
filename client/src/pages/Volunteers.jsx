import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import { Chip, Box } from '@mui/material';
import CrudPage from '../components/CrudPage.jsx';
import StatusChip from '../components/StatusChip.jsx';
import { volunteersApi } from '../api/resource.js';
import { useAuth } from '../app/AuthContext.jsx';
import { titleCase } from '../utils/format.js';

const STATUSES = ['active', 'inactive'].map((s) => ({ value: s, label: titleCase(s) }));

export default function Volunteers() {
  const { hasRole } = useAuth();

  const columns = [
    { key: 'name', header: 'Name' },
    {
      key: 'skills', header: 'Skills',
      render: (r) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {(r.skills || '').split(',').filter(Boolean).slice(0, 3).map((s, i) => (
            <Chip key={i} size="small" label={s.trim()} variant="outlined" />
          ))}
        </Box>
      ),
    },
    { key: 'availability', header: 'Availability' },
    { key: 'phone', header: 'Phone' },
    { key: 'total_hours', header: 'Hours', align: 'right', render: (r) => Number(r.total_hours || 0) },
    { key: 'status', header: 'Status', render: (r) => <StatusChip value={r.status} /> },
  ];

  const fields = [
    { name: 'name', label: 'Full Name', cols: 12, required: true },
    { name: 'email', label: 'Email', cols: 6, type: 'email' },
    { name: 'phone', label: 'Phone', cols: 6, type: 'tel' },
    { name: 'skills', label: 'Skills (comma separated)', cols: 12 },
    { name: 'availability', label: 'Availability', cols: 6 },
    { name: 'total_hours', label: 'Total Hours', cols: 6, type: 'number', min: 0, step: 0.5 },
    { name: 'emergency_contact', label: 'Emergency Contact', cols: 12 },
    { name: 'status', label: 'Status', cols: 6, type: 'select', options: STATUSES },
  ];

  return (
    <CrudPage
      title="Volunteers"
      subtitle="Directory, skills, availability and hours"
      icon={<VolunteerActivismRoundedIcon />}
      queryKey="volunteers"
      api={volunteersApi}
      columns={columns}
      fields={fields}
      filters={[{ name: 'status', label: 'Status', options: STATUSES }]}
      searchPlaceholder="Search volunteers, skills…"
      canWrite={hasRole('ngo_admin', 'volunteer_manager', 'staff')}
      importable
    />
  );
}
