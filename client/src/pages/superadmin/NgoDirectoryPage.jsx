import { useState } from 'react';
import {
  Card, CardContent, Box, TextField, MenuItem, InputAdornment, IconButton, Menu, ListItemIcon,
  Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField as MTextField,
  FormControlLabel, Checkbox, Typography, TableSortLabel,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/PageHeader.jsx';
import DataTable from '../../components/DataTable.jsx';
import StatusChip from '../../components/StatusChip.jsx';
import { adminApi } from '../../api/admin.api.js';
import { apiError } from '../../api/client.js';
import { useAuth } from '../../app/AuthContext.jsx';
import { useDebounced } from '../../hooks/useDebounced.js';
import { money, number, date } from '../../utils/format.js';

const STATUS_OPTIONS = ['active', 'suspended', 'trial', 'expired'];

export default function NgoDirectoryPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { enterImpersonation } = useAuth();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState('DESC');
  const [menu, setMenu] = useState({ anchor: null, row: null });
  const [suspendDlg, setSuspendDlg] = useState(null);
  const [reason, setReason] = useState('');
  const [deleteDlg, setDeleteDlg] = useState(null);
  const [permanent, setPermanent] = useState(false);
  const [toast, setToast] = useState(null);

  const debounced = useDebounced(search, 350);
  const params = { search: debounced, status, page, pageSize, sort, order };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-ngos', params],
    queryFn: () => adminApi.listNgos(params),
    keepPreviousData: true,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-ngos'] });
  const ok = (msg) => { invalidate(); setToast({ type: 'success', msg }); };
  const fail = (e) => setToast({ type: 'error', msg: apiError(e) });

  const statusMut = useMutation({
    mutationFn: ({ id, body }) => adminApi.setStatus(id, body),
    onSuccess: () => { ok('NGO status updated'); setSuspendDlg(null); setReason(''); },
    onError: fail,
  });
  const impersonateMut = useMutation({
    mutationFn: (id) => adminApi.impersonate(id),
    onSuccess: (res) => enterImpersonation(res),
    onError: fail,
  });
  const deleteMut = useMutation({
    mutationFn: ({ id, permanent }) => adminApi.deleteNgo(id, permanent),
    onSuccess: () => { ok('NGO deleted'); setDeleteDlg(null); setPermanent(false); },
    onError: fail,
  });

  const closeMenu = () => setMenu({ anchor: null, row: null });
  const toggleSort = (col) => {
    if (sort === col) setOrder((o) => (o === 'ASC' ? 'DESC' : 'ASC'));
    else { setSort(col); setOrder('ASC'); }
  };
  const sortHead = (label, col, align) => (
    <TableSortLabel active={sort === col} direction={sort === col ? order.toLowerCase() : 'asc'}
      onClick={() => toggleSort(col)} sx={align === 'right' ? { flexDirection: 'row-reverse' } : undefined}>
      {label}
    </TableSortLabel>
  );

  const columns = [
    { key: 'name', header: sortHead('NGO Name', 'name'),
      render: (r) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>{r.name}</Typography>
          <Typography variant="caption" color="text.secondary">{r.email}</Typography>
        </Box>
      ) },
    { key: 'ngo_code', header: 'NGO Code', render: (r) => r.ngo_code || `#${r.id}` },
    { key: 'plan_name', header: sortHead('Plan', 'plan_name') },
    { key: 'status', header: sortHead('Status', 'status'), render: (r) => <StatusChip value={r.status} /> },
    { key: 'members', header: sortHead('Members', 'members'), align: 'right', render: (r) => number(r.members) },
    { key: 'donations', header: sortHead('Donations', 'donations'), align: 'right', render: (r) => money(r.donations) },
    { key: 'created_at', header: sortHead('Created', 'created_at'), render: (r) => date(r.created_at) },
  ];

  const rowActions = (row) => (
    <IconButton size="small" onClick={(e) => setMenu({ anchor: e.currentTarget, row })}>
      <MoreVertRoundedIcon fontSize="small" />
    </IconButton>
  );

  const r = menu.row;

  return (
    <>
      <PageHeader title="NGO Directory" subtitle="Every organization on the platform" />

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
            <TextField placeholder="Search name, email, code…" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} sx={{ minWidth: 260, flex: 1 }}
              InputProps={{ startAdornment: (<InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment>) }} />
            <TextField select label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} sx={{ minWidth: 170 }}>
              <MenuItem value="all">All statuses</MenuItem>
              {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>)}
            </TextField>
          </Box>

          <DataTable
            columns={columns}
            rows={data?.data || []}
            loading={isLoading}
            fetching={isFetching}
            page={data?.page || page}
            pageSize={data?.pageSize || pageSize}
            total={data?.total || 0}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            onRowClick={(row) => navigate(`/superadmin/ngos/${row.id}`)}
            rowActions={rowActions}
            emptyTitle="No NGOs found"
          />
        </CardContent>
      </Card>

      {/* Row actions menu */}
      <Menu anchorEl={menu.anchor} open={!!menu.anchor} onClose={closeMenu}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 210 } }}>
        <MenuItem onClick={() => { navigate(`/superadmin/ngos/${r.id}`); closeMenu(); }}>
          <ListItemIcon><VisibilityRoundedIcon fontSize="small" /></ListItemIcon> View Profile
        </MenuItem>
        {r?.status !== 'active' && (
          <MenuItem onClick={() => { statusMut.mutate({ id: r.id, body: { status: 'active' } }); closeMenu(); }}>
            <ListItemIcon><CheckCircleRoundedIcon fontSize="small" color="success" /></ListItemIcon>
            {r?.status === 'suspended' ? 'Reactivate NGO' : 'Activate NGO'}
          </MenuItem>
        )}
        {r?.status !== 'suspended' && (
          <MenuItem onClick={() => { setSuspendDlg(r); closeMenu(); }}>
            <ListItemIcon><BlockRoundedIcon fontSize="small" color="warning" /></ListItemIcon> Suspend NGO
          </MenuItem>
        )}
        <MenuItem disabled={r?.status === 'suspended' || r?.status === 'expired'}
          onClick={() => { impersonateMut.mutate(r.id); closeMenu(); }}>
          <ListItemIcon><LoginRoundedIcon fontSize="small" color="primary" /></ListItemIcon> Impersonate Admin
        </MenuItem>
        <MenuItem onClick={() => { setDeleteDlg(r); closeMenu(); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteRoundedIcon fontSize="small" color="error" /></ListItemIcon> Delete NGO
        </MenuItem>
      </Menu>

      {/* Suspend dialog */}
      <Dialog open={!!suspendDlg} onClose={() => setSuspendDlg(null)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700}>Suspend {suspendDlg?.name}</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Suspended organizations cannot log in. The reason is stored and shown to their users.
          </Typography>
          <MTextField label="Suspension reason" value={reason} onChange={(e) => setReason(e.target.value)}
            fullWidth multiline rows={3} placeholder="e.g. Non-payment, policy violation…" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setSuspendDlg(null)}>Cancel</Button>
          <Button variant="contained" color="warning" disabled={statusMut.isPending}
            onClick={() => statusMut.mutate({ id: suspendDlg.id, body: { status: 'suspended', suspension_reason: reason } })}>
            Suspend
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleteDlg} onClose={() => setDeleteDlg(null)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700}>Delete {deleteDlg?.name}</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            By default this is a <strong>soft delete</strong> (GDPR): the NGO is hidden and can no longer log in,
            but data is retained and recoverable.
          </Typography>
          <FormControlLabel
            control={<Checkbox checked={permanent} onChange={(e) => setPermanent(e.target.checked)} color="error" />}
            label="Permanently delete all data (cannot be undone)"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setDeleteDlg(null)}>Cancel</Button>
          <Button variant="contained" color="error" disabled={deleteMut.isPending}
            onClick={() => deleteMut.mutate({ id: deleteDlg.id, permanent })}>
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
