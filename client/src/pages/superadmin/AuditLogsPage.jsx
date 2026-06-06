import { Card, CardContent } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/PageHeader.jsx';
import DataTable from '../../components/DataTable.jsx';
import { adminApi } from '../../api/admin.api.js';
import { dateTime, titleCase } from '../../utils/format.js';

export default function AuditLogsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-audit'], queryFn: adminApi.auditLogs });

  const columns = [
    { key: 'created_at', header: 'Time', render: (r) => dateTime(r.created_at) },
    { key: 'ngo_name', header: 'NGO', render: (r) => r.ngo_name || '—' },
    { key: 'actor_name', header: 'Actor' },
    { key: 'action', header: 'Action', render: (r) => titleCase(r.action) },
    { key: 'entity', header: 'Entity' },
    { key: 'ip', header: 'IP' },
  ];

  return (
    <>
      <PageHeader title="Audit Logs" subtitle="Platform-wide activity across all organizations" />
      <Card>
        <CardContent>
          <DataTable columns={columns} rows={data?.data || []} loading={isLoading} emptyTitle="No audit events yet" />
        </CardContent>
      </Card>
    </>
  );
}
