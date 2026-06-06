import { pool } from '../db/pool.js';

// Fire-and-forget audit trail for sensitive actions. Never block the request
// on a logging failure.
export async function audit(req, { action, entity, entityId, meta }) {
  try {
    await pool.execute(
      `INSERT INTO audit_logs (tenant_id, user_id, actor_name, action, entity, entity_id, meta, ip)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.tenantId,
        req.user.id || null,
        req.user.name || null,
        action,
        entity || null,
        entityId != null ? String(entityId) : null,
        meta ? JSON.stringify(meta) : null,
        req.ip,
      ]
    );
  } catch (err) {
    console.error('[audit] failed:', err.message);
  }
}
