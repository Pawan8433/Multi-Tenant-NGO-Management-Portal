import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import CrudPage from '../components/CrudPage.jsx';
import StatusChip from '../components/StatusChip.jsx';
import { receiptsApi } from '../api/resource.js';
import { useAuth } from '../app/AuthContext.jsx';
import { money, date } from '../utils/format.js';

export default function Receipts() {
  const { hasRole, tenant } = useAuth();
  const currency = tenant?.currency || 'USD';

  const columns = [
    { key: 'receipt_number', header: 'Receipt #' },
    { key: 'donor_name', header: 'Donor' },
    { key: 'amount', header: 'Amount', align: 'right', render: (r) => money(r.amount, currency) },
    { key: 'issued_date', header: 'Issued', render: (r) => date(r.issued_date) },
    { key: 'emailed', header: 'Emailed', render: (r) => (r.emailed ? 'Yes' : 'No') },
    { key: 'status', header: 'Status', render: (r) => <StatusChip value={r.status} /> },
  ];

  const fields = [
    { name: 'receipt_number', label: 'Receipt Number', cols: 6, required: true },
    { name: 'donor_name', label: 'Donor Name', cols: 6 },
    { name: 'amount', label: 'Amount', cols: 6, type: 'number', min: 0 },
    { name: 'issued_date', label: 'Issued Date', cols: 6, type: 'date' },
    { name: 'donation_id', label: 'Donation ID', cols: 6, type: 'number' },
    { name: 'emailed', label: 'Emailed', cols: 6, type: 'switch' },
  ];

  return (
    <CrudPage
      title="Receipts"
      subtitle="Issue branded, QR-verified donation receipts"
      icon={<ReceiptLongRoundedIcon />}
      queryKey="receipts"
      api={receiptsApi}
      columns={columns}
      fields={fields}
      filters={[{ name: 'status', label: 'Status', options: [{ value: 'issued', label: 'Issued' }, { value: 'void', label: 'Void' }] }]}
      searchPlaceholder="Search receipt # or donor…"
      canWrite={hasRole('ngo_admin', 'finance_manager')}
    />
  );
}
