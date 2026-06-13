// Creates a login account (and its NGO workspace) with a given email/password/role.
// If the email already exists, it just resets that account's password instead.
// Connects using the current .env.
//
//   node src/db/create-account.js <email> [password] [role] [orgName]
//   node src/db/create-account.js admin@hopefoundation.org Password123! ngo_admin
//
// roles: ngo_admin | staff | volunteer_manager | finance_manager | super_admin
import bcrypt from 'bcryptjs';
import { pool, queryOne } from './pool.js';
import { newTenantId, newWorkspaceId } from '../utils/ids.js';

const email = process.argv[2];
const password = process.argv[3] || 'Password123!';
const role = process.argv[4] || 'ngo_admin';
const orgName = process.argv[5] || (email ? `${email.split('@')[0]}'s Organization` : 'New NGO');

if (!email) {
  console.error('Usage: node src/db/create-account.js <email> [password] [role] [orgName]');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);
const existing = await queryOne('SELECT id, tenant_id FROM users WHERE email = ? LIMIT 1', [email]);

if (existing) {
  await pool.execute(
    "UPDATE users SET password_hash = ?, role = ?, status = 'active', email_verified = 1 WHERE id = ?",
    [hash, role, existing.id]
  );
  console.log(`✓ Account already existed — password reset.`);
  console.log(`  Login: ${email} / ${password}  (role: ${role})`);
} else {
  const tenantId = newTenantId();
  const workspaceId = newWorkspaceId();
  await pool.execute(
    `INSERT INTO ngos (tenant_id, workspace_id, name, email, contact_email, status, currency)
     VALUES (?, ?, ?, ?, ?, 'active', 'USD')`,
    [tenantId, workspaceId, orgName, email, email]
  );
  await pool.execute(
    `INSERT INTO users (tenant_id, name, email, password_hash, role, status, email_verified)
     VALUES (?, ?, ?, ?, ?, 'active', 1)`,
    [tenantId, `${orgName} Admin`, email, hash, role]
  );
  await pool.execute(
    `INSERT INTO subscriptions (tenant_id, plan, status, amount, started_at, renews_at)
     VALUES (?, 'free', 'trialing', 0, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY))`,
    [tenantId]
  );
  console.log(`✓ Created NGO "${orgName}" + account.`);
  console.log(`  Login: ${email} / ${password}  (role: ${role})`);
  console.log(`  tenant_id: ${tenantId}`);
}

const u = await queryOne('SELECT password_hash FROM users WHERE email = ? LIMIT 1', [email]);
console.log(`  Verification: ${(await bcrypt.compare(password, u.password_hash)) ? 'PASS ✅' : 'FAIL ❌'}`);
await pool.end();
