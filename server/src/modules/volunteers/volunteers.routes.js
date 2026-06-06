import { createRepository } from '../../utils/crud.js';
import { resourceRouter } from '../../utils/resourceRouter.js';

const repo = createRepository({
  table: 'volunteers',
  columns: ['name', 'email', 'phone', 'skills', 'availability', 'emergency_contact', 'total_hours', 'status'],
  searchable: ['name', 'email', 'skills', 'phone'],
  filterable: ['status'],
  sortable: ['id', 'name', 'total_hours', 'status', 'created_at'],
});

export default resourceRouter(repo, { entity: 'volunteer', writeRoles: ['ngo_admin', 'volunteer_manager', 'staff'] });
