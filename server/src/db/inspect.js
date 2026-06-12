// Lists every table with its row count, plus all users and tenants.
// Connects using the current .env (so it inspects whatever DB you're pointed at).
//   node src/db/inspect.js
import { pool, query } from './pool.js';
import { env } from '../config/env.js';

async function main() {
  console.log(`\n  Database: ${env.db.database} @ ${env.db.host}\n`);

  const tables = await query(
    `SELECT TABLE_NAME AS t FROM information_schema.tables
     WHERE table_schema = ? ORDER BY TABLE_NAME`,
    [env.db.database]
  );

  console.log('  === TABLES (row counts) ===');
  for (const { t } of tables) {
    const rows = await query(`SELECT COUNT(*) AS c FROM \`${t}\``);
    console.log(`   ${String(t).padEnd(24)} ${rows[0].c}`);
  }

  console.log('\n  === USERS ===');
  const users = await query('SELECT id, name, email, role, status FROM users ORDER BY id');
  console.table(users);

  console.log('  === NGOS (tenants) ===');
  const ngos = await query('SELECT id, name, status, plan_name, tenant_id FROM ngos ORDER BY id');
  console.table(ngos);

  await pool.end();
}

main().catch((err) => {
  console.error('Inspect failed:', err.code || '', err.sqlMessage || err.message || err);
  process.exit(1);
});
