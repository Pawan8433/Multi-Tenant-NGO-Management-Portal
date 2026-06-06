import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireRole } from '../../middleware/rbac.js';
import { pool, queryOne } from '../../db/pool.js';
import { audit } from '../../utils/audit.js';

const router = Router();

const ORG_COLUMNS = ['name', 'registration_number', 'email', 'phone', 'country', 'address',
                     'logo_url', 'timezone', 'date_format', 'currency', 'contact_email'];

// Organization profile (the tenant row itself).
router.get(
  '/organization',
  asyncHandler(async (req, res) => {
    const ngo = await queryOne('SELECT * FROM ngos WHERE tenant_id = ?', [req.user.tenantId]);
    res.json({ data: ngo });
  })
);

router.put(
  '/organization',
  requireRole('ngo_admin'),
  asyncHandler(async (req, res) => {
    const fields = [];
    const args = [];
    for (const col of ORG_COLUMNS) {
      if (req.body[col] !== undefined) { fields.push(`${col} = ?`); args.push(req.body[col]); }
    }
    if (fields.length) {
      args.push(req.user.tenantId);
      await pool.execute(`UPDATE ngos SET ${fields.join(', ')} WHERE tenant_id = ?`, args);
      await audit(req, { action: 'organization.updated', entity: 'ngo' });
    }
    const ngo = await queryOne('SELECT * FROM ngos WHERE tenant_id = ?', [req.user.tenantId]);
    res.json({ data: ngo });
  })
);

// Billing / subscription.
router.get(
  '/billing',
  asyncHandler(async (req, res) => {
    const sub = await queryOne('SELECT * FROM subscriptions WHERE tenant_id = ? ORDER BY id DESC LIMIT 1', [req.user.tenantId]);
    res.json({ data: sub });
  })
);

// Onboarding progress (getting-started wizard).
router.get(
  '/onboarding',
  asyncHandler(async (req, res) => {
    const row = await queryOne('SELECT * FROM onboarding WHERE tenant_id = ?', [req.user.tenantId]);
    res.json({ data: row || { steps: {}, completed: 0 } });
  })
);

router.put(
  '/onboarding',
  asyncHandler(async (req, res) => {
    const steps = JSON.stringify(req.body.steps || {});
    const completed = req.body.completed ? 1 : 0;
    await pool.execute(
      `INSERT INTO onboarding (tenant_id, steps, completed) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE steps = VALUES(steps), completed = VALUES(completed)`,
      [req.user.tenantId, steps, completed]
    );
    const row = await queryOne('SELECT * FROM onboarding WHERE tenant_id = ?', [req.user.tenantId]);
    res.json({ data: row });
  })
);

export default router;
