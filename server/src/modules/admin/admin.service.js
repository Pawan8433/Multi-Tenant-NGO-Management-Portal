// Platform (cross-tenant) operations for Super Admin. Unlike every other module,
// these queries deliberately span ALL tenants — that is the whole point of the
// Super Admin Portal. Access is gated by requireRole('super_admin') in the router.
import { pool, query, queryOne } from '../../db/pool.js';
import { ApiError } from '../../utils/ApiError.js';
import { signAccessToken, signRefreshToken } from '../../utils/jwt.js';

const clampInt = (v, def, min, max) => {
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n)) return def;
  return Math.min(Math.max(n, min), max);
};

const NGO_SORT = {
  name: 'n.name', plan_name: 'n.plan_name', status: 'n.status',
  created_at: 'n.created_at', members: 'members', donations: 'donations',
};

// Writes an audit entry. Defaults to the TARGET tenant so the action also shows
// in that NGO's own trail; pass a different tenant for actions that delete it.
async function logAdmin(actor, tenantId, action, { entityId, meta } = {}) {
  try {
    await pool.execute(
      `INSERT INTO audit_logs (tenant_id, user_id, actor_name, action, entity, entity_id, meta, ip)
       VALUES (?, ?, ?, ?, 'ngo', ?, ?, ?)`,
      [tenantId, actor.id || null, actor.name || 'Super Admin', action,
       entityId != null ? String(entityId) : null, meta ? JSON.stringify(meta) : null, actor.ip || null]
    );
  } catch (e) {
    console.error('[admin audit] failed:', e.message);
  }
}

// ---- NGO directory --------------------------------------------------------
export async function listNgos(params = {}) {
  const where = ['n.deleted_at IS NULL'];
  const args = [];
  if (params.status && params.status !== 'all') { where.push('n.status = ?'); args.push(params.status); }
  if (params.search) {
    const like = `%${params.search}%`;
    where.push('(n.name LIKE ? OR n.email LIKE ? OR n.registration_number LIKE ?)');
    args.push(like, like, like);
  }
  const whereSql = `WHERE ${where.join(' AND ')}`;
  const sortCol = NGO_SORT[params.sort] || 'n.created_at';
  const order = String(params.order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  const page = clampInt(params.page, 1, 1, 1000000);
  const pageSize = clampInt(params.pageSize, 20, 1, 200);
  const offset = (page - 1) * pageSize;

  const countRow = await queryOne(`SELECT COUNT(*) total FROM ngos n ${whereSql}`, args);
  const total = Number(countRow.total);

  const rows = await query(
    `SELECT n.id, n.tenant_id, n.name, n.registration_number AS ngo_code, n.email,
            n.plan_name, n.billing_cycle, n.renewal_date, n.status, n.suspension_reason, n.created_at,
            (SELECT COUNT(*) FROM members m WHERE m.tenant_id = n.tenant_id) AS members,
            (SELECT COALESCE(SUM(amount),0) FROM donations d WHERE d.tenant_id = n.tenant_id AND d.status='received') AS donations
     FROM ngos n ${whereSql}
     ORDER BY ${sortCol} ${order} LIMIT ${pageSize} OFFSET ${offset}`,
    args
  );
  return { data: rows, page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 1 };
}

// ---- NGO profile ----------------------------------------------------------
export async function getNgo(id) {
  const ngo = await queryOne('SELECT * FROM ngos WHERE id = ?', [id]);
  if (!ngo) throw ApiError.notFound('NGO not found');
  const t = ngo.tenant_id;

  const num = async (sql) => Number((await queryOne(sql, [t])).v);
  const stats = {
    members: await num('SELECT COUNT(*) v FROM members WHERE tenant_id = ?'),
    volunteers: await num('SELECT COUNT(*) v FROM volunteers WHERE tenant_id = ?'),
    events: await num('SELECT COUNT(*) v FROM events WHERE tenant_id = ?'),
    campaigns: await num('SELECT COUNT(*) v FROM campaigns WHERE tenant_id = ?'),
    donationsCount: await num("SELECT COUNT(*) v FROM donations WHERE tenant_id = ? AND status='received'"),
    donationsTotal: await num("SELECT COALESCE(SUM(amount),0) v FROM donations WHERE tenant_id = ? AND status='received'"),
  };
  const subscription = await queryOne('SELECT * FROM subscriptions WHERE tenant_id = ? ORDER BY id DESC LIMIT 1', [t]);
  const admins = await query(
    'SELECT id, name, email, role, status, last_login FROM users WHERE tenant_id = ? ORDER BY id', [t]
  );
  return { ngo, stats, subscription, admins };
}

// ---- Suspend / reactivate / set status ------------------------------------
export async function setStatus(id, status, reason, actor) {
  const allowed = ['active', 'suspended', 'trial', 'expired'];
  if (!allowed.includes(status)) throw ApiError.badRequest('Invalid status');
  const ngo = await queryOne('SELECT tenant_id, name FROM ngos WHERE id = ? AND deleted_at IS NULL', [id]);
  if (!ngo) throw ApiError.notFound('NGO not found');

  const suspensionReason = status === 'suspended' ? (reason || 'Suspended by platform administrator') : null;
  await pool.execute('UPDATE ngos SET status = ?, suspension_reason = ? WHERE id = ?', [status, suspensionReason, id]);
  await logAdmin(actor, ngo.tenant_id, `ngo.status.${status}`, { entityId: id, meta: { reason: suspensionReason } });
  return getNgo(id);
}

// ---- Impersonation --------------------------------------------------------
export async function impersonate(id, actor) {
  const ngo = await queryOne('SELECT * FROM ngos WHERE id = ? AND deleted_at IS NULL', [id]);
  if (!ngo) throw ApiError.notFound('NGO not found');
  if (ngo.status === 'suspended' || ngo.status === 'expired') {
    throw ApiError.badRequest(`Cannot impersonate a ${ngo.status} NGO`);
  }
  const target = await queryOne(
    `SELECT * FROM users WHERE tenant_id = ? ORDER BY (role='ngo_admin') DESC, id ASC LIMIT 1`,
    [ngo.tenant_id]
  );
  if (!target) throw ApiError.badRequest('This NGO has no user accounts to impersonate');

  const payload = {
    sub: target.id, tenant_id: ngo.tenant_id, role: 'ngo_admin',
    name: target.name, email: target.email,
    imp: true, impersonator: { id: actor.id, name: actor.name, email: actor.email },
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ sub: target.id, tenant_id: ngo.tenant_id, imp: true });

  await logAdmin(actor, ngo.tenant_id, 'ngo.impersonate', { entityId: id, meta: { admin: target.email } });

  return {
    accessToken, refreshToken,
    ngo: { id: ngo.id, name: ngo.name, tenantId: ngo.tenant_id },
    user: { id: target.id, name: target.name, email: target.email, role: 'ngo_admin' },
  };
}

// ---- GDPR delete (soft, then optional permanent) --------------------------
export async function deleteNgo(id, permanent, actor) {
  const ngo = await queryOne('SELECT tenant_id, name, deleted_at FROM ngos WHERE id = ?', [id]);
  if (!ngo) throw ApiError.notFound('NGO not found');

  if (permanent) {
    // Log under the super admin's own tenant first — the target tenant's logs
    // are cascade-deleted with it.
    await logAdmin(actor, actor.tenantId, 'ngo.delete.permanent', { entityId: id, meta: { name: ngo.name } });
    await pool.execute('DELETE FROM ngos WHERE id = ?', [id]); // cascades all tenant data
    return { id: Number(id), deleted: true, permanent: true };
  }

  await pool.execute('UPDATE ngos SET deleted_at = NOW(), status = ? WHERE id = ?', ['suspended', id]);
  await logAdmin(actor, ngo.tenant_id, 'ngo.delete.soft', { entityId: id, meta: { name: ngo.name } });
  return { id: Number(id), deleted: true, permanent: false };
}

// ---- Billing overview -----------------------------------------------------
export async function billing() {
  const counts = await queryOne(`
    SELECT COUNT(*) total,
           SUM(status='trial')     AS trial,
           SUM(status='active')    AS active,
           SUM(status='suspended') AS suspended,
           SUM(status='expired')   AS expired
    FROM ngos WHERE deleted_at IS NULL`);

  const rev = await queryOne(`
    SELECT COALESCE(SUM(CASE WHEN billing_cycle='monthly' THEN amount ELSE amount/12 END),0) AS monthly
    FROM (
      SELECT n.billing_cycle, s.amount
      FROM ngos n
      JOIN subscriptions s ON s.id = (SELECT MAX(id) FROM subscriptions x WHERE x.tenant_id = n.tenant_id)
      WHERE n.deleted_at IS NULL AND n.status = 'active'
    ) t`);
  const monthlyRevenue = Number(rev.monthly);

  const table = await query(`
    SELECT n.id, n.name, n.plan_name, n.billing_cycle, n.status, n.renewal_date,
           COALESCE(s.amount, 0) AS amount
    FROM ngos n
    LEFT JOIN subscriptions s ON s.id = (SELECT MAX(id) FROM subscriptions x WHERE x.tenant_id = n.tenant_id)
    WHERE n.deleted_at IS NULL
    ORDER BY n.created_at DESC LIMIT 200`);

  return {
    counts: {
      total: Number(counts.total), trial: Number(counts.trial || 0), active: Number(counts.active || 0),
      suspended: Number(counts.suspended || 0), expired: Number(counts.expired || 0),
      paid: Number(counts.active || 0),
    },
    monthlyRevenue, annualRevenue: monthlyRevenue * 12,
    table,
  };
}

// ---- Platform dashboard ---------------------------------------------------
export async function dashboard() {
  const num = async (sql) => Number((await queryOne(sql)).v);
  const totals = {
    ngos: await num('SELECT COUNT(*) v FROM ngos WHERE deleted_at IS NULL'),
    members: await num('SELECT COUNT(*) v FROM members'),
    donations: await num("SELECT COALESCE(SUM(amount),0) v FROM donations WHERE status='received'"),
    volunteers: await num('SELECT COUNT(*) v FROM volunteers'),
  };
  const byStatus = await query(
    `SELECT status AS label, COUNT(*) AS count FROM ngos WHERE deleted_at IS NULL GROUP BY status`
  );
  const byPlan = await query(
    `SELECT plan_name AS label, COUNT(*) AS count FROM ngos WHERE deleted_at IS NULL GROUP BY plan_name`
  );
  const newNgos = await query(
    `SELECT DATE_FORMAT(created_at,'%Y-%m') AS label, COUNT(*) AS count
     FROM ngos WHERE deleted_at IS NULL
       AND created_at >= DATE_SUB(DATE_FORMAT(CURDATE(),'%Y-%m-01'), INTERVAL 11 MONTH)
     GROUP BY label ORDER BY label ASC`
  );
  const monthlyDonations = await query(
    `SELECT DATE_FORMAT(donation_date,'%Y-%m') AS label, SUM(amount) AS total
     FROM donations WHERE status='received'
       AND donation_date >= DATE_SUB(DATE_FORMAT(CURDATE(),'%Y-%m-01'), INTERVAL 11 MONTH)
     GROUP BY label ORDER BY label ASC`
  );
  const recentNgos = await query(
    `SELECT id, name, status, plan_name, created_at FROM ngos WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 6`
  );
  return { totals, byStatus, byPlan, newNgos, monthlyDonations, recentNgos };
}

// ---- Platform-wide audit log ----------------------------------------------
export async function auditLogs(params = {}) {
  const limit = clampInt(params.limit, 100, 1, 500);
  const rows = await query(
    `SELECT a.id, a.actor_name, a.action, a.entity, a.entity_id, a.ip, a.created_at,
            n.name AS ngo_name
     FROM audit_logs a
     LEFT JOIN ngos n ON n.tenant_id = a.tenant_id
     ORDER BY a.created_at DESC LIMIT ${limit}`
  );
  return { data: rows, total: rows.length };
}
