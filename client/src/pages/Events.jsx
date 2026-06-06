import EventRoundedIcon from '@mui/icons-material/EventRounded';
import CrudPage from '../components/CrudPage.jsx';
import StatusChip from '../components/StatusChip.jsx';
import { eventsApi } from '../api/resource.js';
import { useAuth } from '../app/AuthContext.jsx';
import { dateTime, money, titleCase } from '../utils/format.js';

const STATUSES = ['draft', 'upcoming', 'ongoing', 'completed', 'cancelled'].map((s) => ({ value: s, label: titleCase(s) }));

export default function Events() {
  const { hasRole, tenant } = useAuth();
  const currency = tenant?.currency || 'USD';

  const columns = [
    { key: 'title', header: 'Event' },
    { key: 'start_date', header: 'Date', render: (r) => dateTime(r.start_date) },
    { key: 'location', header: 'Location' },
    { key: 'budget', header: 'Budget', align: 'right', render: (r) => money(r.budget, currency) },
    { key: 'status', header: 'Status', render: (r) => <StatusChip value={r.status} /> },
  ];

  const fields = [
    { name: 'title', label: 'Event Title', cols: 12, required: true },
    { name: 'description', label: 'Description', cols: 12, multiline: true, rows: 2 },
    { name: 'venue', label: 'Venue', cols: 6 },
    { name: 'location', label: 'Location', cols: 6 },
    { name: 'start_date', label: 'Start Date', cols: 6, type: 'datetime-local' },
    { name: 'end_date', label: 'End Date', cols: 6, type: 'datetime-local' },
    { name: 'budget', label: 'Budget', cols: 6, type: 'number', min: 0, step: 100 },
    { name: 'max_participants', label: 'Max Participants', cols: 6, type: 'number', min: 0 },
    { name: 'status', label: 'Status', cols: 6, type: 'select', options: STATUSES },
  ];

  return (
    <CrudPage
      title="Events"
      subtitle="Plan, run and track your programs and events"
      icon={<EventRoundedIcon />}
      queryKey="events"
      api={eventsApi}
      columns={columns}
      fields={fields}
      filters={[{ name: 'status', label: 'Status', options: STATUSES }]}
      searchPlaceholder="Search events…"
      canWrite={hasRole('ngo_admin', 'staff')}
      toFormValues={(r) => ({
        ...r,
        start_date: r.start_date ? String(r.start_date).replace(' ', 'T').slice(0, 16) : '',
        end_date: r.end_date ? String(r.end_date).replace(' ', 'T').slice(0, 16) : '',
      })}
    />
  );
}
