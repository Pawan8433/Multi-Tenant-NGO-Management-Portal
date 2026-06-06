// Admin utility: (re)create a super admin. Removes any existing account with the
// same email — including its NGO workspace — then creates a fresh super_admin in
// a brand-new tenant, and verifies the password.
//
// Usage:
//   node src/db/create-superadmin.js [email] [password] [orgName]
//   defaults: superadmin@impacthub.com / Password123! / "Platform Admin"
import bcrypt from 'bcryptjs';
import { pool } from './pool.js';
import { newTenantId, newWorkspaceId } from '../utils/ids.js';

const email = process.argv[2] || 'superadmin@impacthub.com';
const password = process.argv[3] || 'Password123!';
const orgName = process.argv[4] || 'Platform Admin';

const conn = await pool.getConnection();
try {
  await conn.beginTransaction();

  // Remove the OLD super admin (any account with this email) and its workspace.
  const [existing] = await conn.execute('SELECT id, tenant_id FROM users WHERE email = ?', [email]);
  for (const u of existing) {
    await conn.execute('DELETE FROM ngos WHERE tenant_id = ?', [u.tenant_id]); // cascades user + data
  }

  // Create the NEW super admin in a fresh tenant.
  const tenantId = newTenantId();
  const workspaceId = newWorkspaceId();
  await conn.execute(
    `INSERT INTO ngos (tenant_id, workspace_id, name, email, contact_email, status, currency)
     VALUES (?, ?, ?, ?, ?, 'active', 'USD')`,
    [tenantId, workspaceId, orgName, email, email]
  );
  const hash = await bcrypt.hash(password, 10);
  const [res] = await conn.execute(
    `INSERT INTO users (tenant_id, name, email, password_hash, role, status, email_verified)
     VALUES (?, ?, ?, ?, 'super_admin', 'active', 1)`,
    [tenantId, 'Super Admin', email, hash]
  );
  await conn.execute(
    `INSERT INTO subscriptions (tenant_id, plan, status, amount, started_at, renews_at)
     VALUES (?, 'enterprise', 'active', 0, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR))`,
    [tenantId]
  );

  await conn.commit();

  const [rows] = await conn.query('SELECT password_hash FROM users WHERE id = ?', [res.insertId]);
  const ok = await bcrypt.compare(password, rows[0].password_hash);

  console.log(`✓ Removed old account(s) with this email: ${existing.length}`);
  console.log(`✓ Created super admin (user id ${res.insertId}) in workspace "${orgName}"`);
  console.log(`  tenant_id: ${tenantId}`);
  console.log(`  Login: ${email} / ${password}   (verify: ${ok ? 'PASS' : 'FAIL'})`);
} catch (e) {
  await conn.rollback();
  throw e;
} finally {
  conn.release();
}
await pool.end();
