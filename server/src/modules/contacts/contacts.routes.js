import { createRepository } from '../../utils/crud.js';
import { resourceRouter } from '../../utils/resourceRouter.js';

const repo = createRepository({
  table: 'contacts',
  columns: ['name', 'email', 'phone', 'type', 'status', 'organization', 'address', 'notes'],
  searchable: ['name', 'email', 'organization', 'phone'],
  filterable: ['type', 'status'],
  sortable: ['id', 'name', 'type', 'status', 'created_at'],
});

export default resourceRouter(repo, { entity: 'contact', writeRoles: ['ngo_admin', 'staff'] });
