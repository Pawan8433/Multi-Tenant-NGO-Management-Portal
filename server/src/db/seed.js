// Loads demo data: runs seed.sql (bulk data) then inserts users with hashed
// passwords. Idempotent enough for local dev (clears the demo tenant first).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TENANT = '11111111-1111-1111-1111-111111111111';

async function main() {
  const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');

  const conn = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
    ssl: env.db.ssl ? { rejectUnauthorized: false } : undefined,
    multipleStatements: true,
  });

  // Reset demo tenant so re-seeding is clean. FK cascade removes child rows.
  await conn.query('DELETE FROM ngos WHERE tenant_id = ?', [TENANT]);

  // Bulk sample data.
  await conn.query(seedSql);

  // Users (need hashed passwords — done in JS, not SQL).
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const users = [
    ['Super Admin', 'superadmin@hopefoundation.org', 'super_admin'],
    ['Admin User', 'admin@hopefoundation.org', 'ngo_admin'],
    ['Fin Manager', 'finance@hopefoundation.org', 'finance_manager'],
    ['Vol Manager', 'volunteers@hopefoundation.org', 'volunteer_manager'],
    ['Staff Member', 'staff@hopefoundation.org', 'staff'],
  ];
  for (const [name, email, role] of users) {
    await conn.query(
      `INSERT INTO users (tenant_id, name, email, password_hash, role, status, email_verified, last_login)
       VALUES (?, ?, ?, ?, ?, 'active', 1, NOW())`,
      [TENANT, name, email, passwordHash, role]
    );
  }

  await conn.end();
  console.log('✓ Demo data seeded.');
  console.log('  Super Admin: superadmin@hopefoundation.org / Password123!');
  console.log('  NGO Admin:   admin@hopefoundation.org / Password123!');
}

main().catch((err) => {
  console.error('Seeding failed:', err.code || '', err.sqlMessage || err.message || '(no message)');
  if (err.errors) console.error('  Underlying:', err.errors.map((e) => `${e.code || ''} ${e.message}`).join(' | '));
  console.error(err);
  process.exit(1);
});
