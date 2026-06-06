import { useRef, useState } from 'react';
import {
  Card, CardContent, Box, Button, TextField, MenuItem, InputAdornment, IconButton, Tooltip, Snackbar, Alert,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from './PageHeader.jsx';
import DataTable from './DataTable.jsx';
import FormDialog from './FormDialog.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import { apiError } from '../api/client.js';
import { exportToCsv, parseCsv } from '../utils/csv.js';
import { useDebounced } from '../hooks/useDebounced.js';

/**
 * Generic CRUD screen. Drives list/create/edit/delete from `api` + `columns` +
 * `fields`, with search, filters, pagination, CSV export and (optional) import.
 */
export default function CrudPage({
  title, subtitle, icon, queryKey, api, columns, fields,
  filters = [], searchPlaceholder = 'Search…', canWrite = true,
  toFormValues, transformPayload, onRowClick, exportColumns, importable = false,
  rowActionsExtra,
}) {
  const qc = useQueryClient();
  const fileRef = useRef(null);
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);

  const debouncedSearch = useDebounced(search, 350);
  const params = { search: debouncedSearch, page, pageSize, ...filterValues };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [queryKey, params],
    queryFn: () => api.list(params),
    keepPreviousData: true,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: [queryKey] });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing ? api.update(editing.id, payload) : api.create(payload),
    onSuccess: () => {
      invalidate();
      setFormOpen(false);
      setEditing(null);
      setToast({ type: 'success', msg: editing ? 'Updated successfully' : 'Created successfully' });
    },
    onError: (e) => setFormError(apiError(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.remove(id),
    onSuccess: () => {
      invalidate();
      setDeleting(null);
      setToast({ type: 'success', msg: 'Deleted successfully' });
    },
    onError: (e) => { setDeleting(null); setToast({ type: 'error', msg: apiError(e) }); },
  });

  const openCreate = () => { setEditing(null); setFormError(''); setFormOpen(true); };
  const openEdit = (row) => { setEditing(row); setFormError(''); setFormOpen(true); };

  const defaultValues = editing
    ? (toFormValues ? toFormValues(editing) : pickFields(editing, fields))
    : Object.fromEntries(fields.map((f) => [f.name, f.type === 'switch' ? 0 : '']));

  const handleSubmit = (values) => {
    setFormError('');
    saveMutation.mutate(transformPayload ? transformPayload(values) : values);
  };

  const handleExport = () => {
    const cols = exportColumns || columns.filter((c) => c.key !== 'actions');
    exportToCsv(`${queryKey}.csv`, cols.map((c) => ({ header: c.header, key: c.key, value: c.exportValue })), data?.data || []);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = parseCsv(await file.text());
      let ok = 0;
      for (const r of rows) {
        try { await api.create(r); ok++; } catch { /* skip invalid row */ }
      }
      invalidate();
      setToast({ type: 'success', msg: `Imported ${ok} of ${rows.length} rows` });
    } catch (err) {
      setToast({ type: 'error', msg: apiError(err) });
    } finally {
      e.target.value = '';
    }
  };

  const rowActions = canWrite
    ? (row) => (
        <>
          {rowActionsExtra?.(row)}
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => openEdit(row)}><EditRoundedIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => setDeleting(row)}>
              <DeleteRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      )
    : rowActionsExtra
    ? (row) => rowActionsExtra(row)
    : undefined;

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        icon={icon}
        actions={
          <>
            <Tooltip title="Export CSV">
              <IconButton onClick={handleExport}><FileDownloadRoundedIcon /></IconButton>
            </Tooltip>
            {importable && canWrite && (
              <>
                <Tooltip title="Import CSV">
                  <IconButton onClick={() => fileRef.current?.click()}><FileUploadRoundedIcon /></IconButton>
                </Tooltip>
                <input ref={fileRef} type="file" accept=".csv" hidden onChange={handleImport} />
              </>
            )}
            {canWrite && (
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>
                Add New
              </Button>
            )}
          </>
        }
      />

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
            <TextField
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              sx={{ minWidth: 240, flex: 1 }}
              InputProps={{ startAdornment: (<InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment>) }}
            />
            {filters.map((f) => (
              <TextField
                key={f.name}
                select
                label={f.label}
                value={filterValues[f.name] || 'all'}
                onChange={(e) => { setFilterValues((v) => ({ ...v, [f.name]: e.target.value })); setPage(1); }}
                sx={{ minWidth: 170 }}
              >
                <MenuItem value="all">All</MenuItem>
                {f.options.map((o) => (<MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>))}
              </TextField>
            ))}
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
            onRowClick={onRowClick}
            rowActions={rowActions}
            emptyTitle="No records found"
            emptyDescription={canWrite ? 'Create your first record to get started.' : undefined}
            emptyAction={canWrite ? { actionLabel: 'Add New', onAction: openCreate } : undefined}
          />
        </CardContent>
      </Card>

      <FormDialog
        open={formOpen}
        title={editing ? `Edit ${title.replace(/s$/, '')}` : `Add ${title.replace(/s$/, '')}`}
        fields={fields}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onClose={() => setFormOpen(false)}
        submitting={saveMutation.isPending}
        error={formError}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete record"
        message="This action cannot be undone. Are you sure you want to delete this record?"
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {toast && <Alert severity={toast.type} variant="filled" onClose={() => setToast(null)}>{toast.msg}</Alert>}
      </Snackbar>
    </>
  );
}

function pickFields(row, fields) {
  return Object.fromEntries(fields.map((f) => [f.name, row[f.name] ?? (f.type === 'switch' ? 0 : '')]));
}
