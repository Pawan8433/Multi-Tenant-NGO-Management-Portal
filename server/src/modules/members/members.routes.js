import { createRepository } from '../../utils/crud.js';
import { resourceRouter } from '../../utils/resourceRouter.js';

const repo = createRepository({
  table: 'members',
  columns: ['member_code', 'first_name', 'last_name', 'email', 'phone', 'membership_type_id',
            'status', 'join_date', 'renewal_date', 'address', 'notes'],
  searchable: ['first_name', 'last_name', 'email', 'member_code', 'phone'],
  filterable: ['status', 'membership_type_id'],
  sortable: ['id', 'first_name', 'last_name', 'status', 'join_date', 'created_at'],
});

export default resourceRouter(repo, { entity: 'member', writeRoles: ['ngo_admin', 'staff'] });
