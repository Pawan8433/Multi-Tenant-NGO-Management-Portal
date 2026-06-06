import { Router } from 'express';
import { asyncHandler } from './asyncHandler.js';
import { crudHandlers } from './crud.js';
import { requireRole } from '../middleware/rbac.js';

/**
 * Standard REST router for a repository. Read routes are open to any
 * authenticated user in the tenant; write routes are restricted to `writeRoles`.
 * Pass `extend(router, h)` to add custom routes that should sit BEFORE `/:id`.
 */
export function resourceRouter(repo, { entity, writeRoles = [], extend } = {}) {
  const router = Router();
  const h = crudHandlers(repo, { entity });
  const guard = writeRoles.length ? requireRole(...writeRoles) : (_q, _s, n) => n();

  if (extend) extend(router, h);

  router.get('/', asyncHandler(h.list));
  router.get('/:id', asyncHandler(h.getOne));
  router.post('/', guard, asyncHandler(h.create));
  router.put('/:id', guard, asyncHandler(h.update));
  router.delete('/:id', guard, asyncHandler(h.remove));

  return router;
}
