import { useState } from 'react';
import {
  Card, CardContent, IconButton, Tooltip, Snackbar, Alert, Chip,
} from '@mui/material';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { Button } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../components/PageHeader.jsx';
import DataTable from '../components/DataTable.jsx';
import FormDialog from '../components/FormDialog.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import StatusChip from '../components/StatusChip.jsx';
import { adminsApi } from '../api/resource.js';
import { apiError } from '../api/client.js';
import { roleLabel, dateTime } from '../utils/format.js';

const ROLES = [
  { value: 'ngo_admin', label: 'NGO Admin' },
  { value: 'staff', label: 'Staff' },
  { value: 'volunteer_manager', label: 'Volunteer Manager' },
  { value: 'finance_manager', label: 'Finance Manager' },
];
const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'invited', label: 'Invited' },
  { value: 'suspended', label: 'Suspended' },
];

export default function Administrators() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);

  const { data, isLoading } = useQuery({ queryKey: ['admins'], queryFn: () => adminsApi.list() });

  const save = useMutation({
    mutationFn: (payload) => (editing ? adminsApi.update(editing.id, payload) : adminsApi.create(payload)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admins'] }); setFormOpen(false); setEditing(null); setToast({ type: 'success', msg: 'Saved' }); },
    onError: (e) => setFormError(apiError(e)),
  });
  const del = useMutation({
    mutationFn: (id) => adminsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admins'] }); setDeleting(null); setToast({ type: 'success', msg: 'Removed' }); },
    onError: (e) => { setDeleting(null); setToast({ type: 'error', msg: apiError(e) }); },
  });

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (r) => <Chip size="small" color="primary" variant="outlined" label={roleLabel(r.role)} /> },
    { key: 'last_login', header: 'Last Login', render: (r) => dateTime(r.last_login) },
    { key: 'status', header: 'Status', render: (r) => <StatusChip value={r.status} /> },
  ];

  const createFields = [
    { name: 'name', label: 'Full Name', cols: 12, required: true },
    { name: 'email', label: 'Email', cols: 12, type: 'email', required: true },
    { name: 'role', label: 'Role', cols: 6, type: 'select', options: ROLES, required: true },
    { name: 'password', label: 'Temp Password (optional)', cols: 6 },
  ];
  const editFields = [
    { name: 'name', label: 'Full Name', cols: 12 },
    { name: 'role', label: 'Role', cols: 6, type: 'select', options: ROLES },
    { name: 'status', label: 'Status', cols: 6, type: 'select', options: STATUSES },
  ];

  return (
    <>
      <PageHeader
        title="Administrators"
        subtitle="Manage who can access this workspace and what they can do"
        icon={<AdminPanelSettingsRoundedIcon />}
        actions={<Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => { setEditing(null); setFormError(''); setFormOpen(true); }}>Add Administrator</Button>}
      />
      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            rows={data?.data || []}
            loading={isLoading}
            rowActions={(row) => (
              <>
                <Tooltip title="Edit"><IconButton size="small" onClick={() => { setEditing(row); setFormError(''); setFormOpen(true); }}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Remove"><IconButton size="small" color="error" onClick={() => setDeleting(row)}><DeleteRoundedIcon fontSize="small" /></IconButton></Tooltip>
              </>
            )}
            emptyTitle="No administrators yet"
          />
        </CardContent>
      </Card>

      <FormDialog
        open={formOpen}
        title={editing ? 'Edit Administrator' : 'Add Administrator'}
        fields={editing ? editFields : createFields}
        defaultValues={editing ? { name: editing.name, role: editing.role, status: editing.status } : { role: 'staff' }}
        onSubmit={(v) => { setFormError(''); save.mutate(v); }}
        onClose={() => setFormOpen(false)}
        submitting={save.isPending}
        error={formError}
      />
      <ConfirmDialog
        open={!!deleting}
        title="Remove administrator"
        message={`Remove ${deleting?.name}? They will lose access immediately.`}
        confirmLabel="Remove"
        loading={del.isPending}
        onConfirm={() => del.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {toast && <Alert severity={toast.type} variant="filled">{toast.msg}</Alert>}
      </Snackbar>
    </>
  );
}
