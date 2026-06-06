import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { pool, query } from '../../db/pool.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT id, title, body, type, is_read, created_at FROM notifications
       WHERE tenant_id = ? AND (user_id IS NULL OR user_id = ?)
       ORDER BY created_at DESC LIMIT 30`,
      [req.user.tenantId, req.user.id]
    );
    const unread = rows.filter((r) => !r.is_read).length;
    res.json({ data: rows, unread });
  })
);

router.post(
  '/read-all',
  asyncHandler(async (req, res) => {
    await pool.execute(
      'UPDATE notifications SET is_read = 1 WHERE tenant_id = ? AND (user_id IS NULL OR user_id = ?)',
      [req.user.tenantId, req.user.id]
    );
    res.json({ ok: true });
  })
);

export default router;
