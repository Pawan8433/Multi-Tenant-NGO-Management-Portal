import { createRepository } from '../../utils/crud.js';
import { resourceRouter } from '../../utils/resourceRouter.js';

const repo = createRepository({
  table: 'campaigns',
  columns: ['name', 'subject', 'body', 'segment', 'status', 'scheduled_at',
            'recipients', 'opens', 'clicks', 'unsubscribes'],
  searchable: ['name', 'subject', 'segment'],
  filterable: ['status', 'segment'],
  sortable: ['id', 'name', 'status', 'scheduled_at', 'created_at'],
});

export default resourceRouter(repo, { entity: 'campaign', writeRoles: ['ngo_admin', 'staff'] });
