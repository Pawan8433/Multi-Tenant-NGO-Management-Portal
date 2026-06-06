import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireRole } from '../../middleware/rbac.js';
import { query } from '../../db/pool.js';

const router = Router();

// Read-only audit trail. Restricted to admins.
router.get(
  '/',
  requireRole('ngo_admin'),
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const rows = await query(
      `SELECT id, actor_name, action, entity, entity_id, ip, created_at
       FROM audit_logs WHERE tenant_id = ? ORDER BY created_at DESC LIMIT ${limit}`,
      [req.user.tenantId]
    );
    res.json({ data: rows, total: rows.length });
  })
);

export default router;
