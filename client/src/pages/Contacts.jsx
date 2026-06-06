import ContactsRoundedIcon from '@mui/icons-material/ContactsRounded';
import CrudPage from '../components/CrudPage.jsx';
import StatusChip from '../components/StatusChip.jsx';
import { contactsApi } from '../api/resource.js';
import { useAuth } from '../app/AuthContext.jsx';
import { titleCase } from '../utils/format.js';

const TYPES = ['donor', 'partner', 'vendor', 'media', 'general'].map((t) => ({ value: t, label: titleCase(t) }));
const STATUSES = ['active', 'inactive'].map((s) => ({ value: s, label: titleCase(s) }));

export default function Contacts() {
  const { hasRole } = useAuth();

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'organization', header: 'Organization' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'type', header: 'Type', render: (r) => titleCase(r.type) },
    { key: 'status', header: 'Status', render: (r) => <StatusChip value={r.status} /> },
  ];

  const fields = [
    { name: 'name', label: 'Full Name', cols: 12, required: true },
    { name: 'email', label: 'Email', cols: 6, type: 'email' },
    { name: 'phone', label: 'Phone', cols: 6, type: 'tel' },
    { name: 'type', label: 'Type', cols: 6, type: 'select', options: TYPES },
    { name: 'status', label: 'Status', cols: 6, type: 'select', options: STATUSES },
    { name: 'organization', label: 'Organization', cols: 12 },
    { name: 'address', label: 'Address', cols: 12 },
    { name: 'notes', label: 'Notes', cols: 12, multiline: true, rows: 2 },
  ];

  return (
    <CrudPage
      title="Contacts"
      subtitle="Your CRM of donors, partners, vendors and media"
      icon={<ContactsRoundedIcon />}
      queryKey="contacts"
      api={contactsApi}
      columns={columns}
      fields={fields}
      filters={[{ name: 'type', label: 'Type', options: TYPES }, { name: 'status', label: 'Status', options: STATUSES }]}
      searchPlaceholder="Search contacts…"
      canWrite={hasRole('ngo_admin', 'staff')}
      importable
    />
  );
}
