import { createRepository } from '../../utils/crud.js';
import { resourceRouter } from '../../utils/resourceRouter.js';

const repo = createRepository({
  table: 'events',
  columns: ['title', 'description', 'venue', 'location', 'start_date', 'end_date',
            'budget', 'max_participants', 'status'],
  searchable: ['title', 'venue', 'location'],
  filterable: ['status'],
  sortable: ['id', 'title', 'start_date', 'budget', 'status', 'created_at'],
  defaultSort: 'start_date',
});

export default resourceRouter(repo, { entity: 'event', writeRoles: ['ngo_admin', 'staff'] });
