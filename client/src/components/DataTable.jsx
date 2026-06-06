import {
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, TablePagination,
  Box, Skeleton, CircularProgress,
} from '@mui/material';
import EmptyState from './EmptyState.jsx';

/**
 * Server-driven data table.
 * columns: [{ key, header, render?(row), align?, width? }]
 * rowActions?(row) -> node rendered in a trailing actions cell
 */
export default function DataTable({
  columns,
  rows = [],
  loading,
  fetching,
  page = 1,
  pageSize = 20,
  total = 0,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  rowActions,
  emptyTitle,
  emptyDescription,
  emptyAction,
}) {
  const colSpan = columns.length + (rowActions ? 1 : 0);

  return (
    <Box sx={{ position: 'relative' }}>
      {fetching && (
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
          <CircularProgress size={18} />
        </Box>
      )}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((c) => (
                <TableCell key={c.key} align={c.align} sx={{ width: c.width }}>{c.header}</TableCell>
              ))}
              {rowActions && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={`s-${i}`}>
                  {Array.from({ length: colSpan }).map((__, j) => (
                    <TableCell key={j}><Skeleton /></TableCell>
                  ))}
                </TableRow>
              ))}

            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={colSpan} sx={{ border: 0 }}>
                  <EmptyState title={emptyTitle} description={emptyDescription} {...(emptyAction || {})} />
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((c) => (
                    <TableCell key={c.key} align={c.align}>
                      {c.render ? c.render(row) : row[c.key] ?? '—'}
                    </TableCell>
                  ))}
                  {rowActions && (
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      {rowActions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {total > 0 && (
        <TablePagination
          component="div"
          count={total}
          page={page - 1}
          onPageChange={(_, p) => onPageChange?.(p + 1)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => onPageSizeChange?.(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[10, 20, 50, 100]}
        />
      )}
    </Box>
  );
}
