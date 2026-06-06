import { Router } from 'express';
import { body } from 'express-validator';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { validate } from '../../middleware/validate.js';
import { requireRole } from '../../middleware/rbac.js';
import { pool, query, queryOne } from '../../db/pool.js';
import { ApiError } from '../../utils/ApiError.js';
import { hashPassword } from '../../utils/password.js';
import { newToken } from '../../utils/ids.js';
import { audit } from '../../utils/audit.js';

const router = Router();
const SAFE = `id, name, email, role, status, last_login, email_verified, avatar_url, created_at`;
const ROLES = ['ngo_admin', 'staff', 'volunteer_manager', 'finance_manager'];

// Only admins manage administrators.
router.use(requireRole('ngo_admin'));

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT ${SAFE} FROM users WHERE tenant_id = ? ORDER BY created_at DESC`,
      [req.user.tenantId]
    );
    res.json({ data: rows, total: rows.length });
  })
);

router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('role').isIn(ROLES),
    body('password').optional({ values: 'falsy' }).isLength({ min: 8 }),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { name, email, role } = req.body;
    const dupe = await queryOne('SELECT id FROM users WHERE tenant_id = ? AND email = ?', [req.user.tenantId, email]);
    if (dupe) throw ApiError.conflict('A user with this email already exists');

    // If no password is supplied the admin is "invited" with a random secret.
    const password = req.body.password || newToken();
    const passwordHash = await hashPassword(password);
    const status = req.body.password ? 'active' : 'invited';

    const [result] = await pool.execute(
      `INSERT INTO users (tenant_id, name, email, password_hash, role, status, email_verified)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [req.user.tenantId, name, email, passwordHash, role, status]
    );
    const user = await queryOne(`SELECT ${SAFE} FROM users WHERE id = ?`, [result.insertId]);
    await audit(req, { action: 'admin.created', entity: 'user', entityId: user.id, meta: { role } });
    res.status(201).json({ data: user });
  })
);

router.put(
  '/:id',
  [body('role').optional().isIn(ROLES), body('status').optional().isIn(['active', 'invited', 'suspended'])],
  validate,
  asyncHandler(async (req, res) => {
    const target = await queryOne('SELECT id FROM users WHERE id = ? AND tenant_id = ?', [req.params.id, req.user.tenantId]);
    if (!target) throw ApiError.notFound('Administrator not found');
    const fields = [];
    const args = [];
    for (const key of ['name', 'role', 'status']) {
      if (req.body[key] !== undefined) { fields.push(`${key} = ?`); args.push(req.body[key]); }
    }
    if (!fields.length) return res.json({ data: await queryOne(`SELECT ${SAFE} FROM users WHERE id = ?`, [req.params.id]) });
    args.push(req.params.id, req.user.tenantId);
    await pool.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`, args);
    const user = await queryOne(`SELECT ${SAFE} FROM users WHERE id = ?`, [req.params.id]);
    await audit(req, { action: 'admin.updated', entity: 'user', entityId: user.id });
    res.json({ data: user });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    if (String(req.user.id) === String(req.params.id)) throw ApiError.badRequest('You cannot remove your own account');
    const target = await queryOne('SELECT id FROM users WHERE id = ? AND tenant_id = ?', [req.params.id, req.user.tenantId]);
    if (!target) throw ApiError.notFound('Administrator not found');
    await pool.execute('DELETE FROM users WHERE id = ? AND tenant_id = ?', [req.params.id, req.user.tenantId]);
    await audit(req, { action: 'admin.deleted', entity: 'user', entityId: req.params.id });
    res.json({ data: { id: Number(req.params.id), deleted: true } });
  })
);

export default router;
