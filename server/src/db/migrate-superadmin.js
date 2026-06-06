// Idempotent migration for the Super Admin Portal: adds NGO management fields to
// `ngos` on an existing database (MySQL 8 has no "ADD COLUMN IF NOT EXISTS", so
// we check information_schema first). Safe to run multiple times.
import { pool } from './pool.js';
import { env } from '../config/env.js';

const DB = env.db.database;

async function hasColumn(table, column) {
  const [rows] = await pool.query(
    `SELECT 1 FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [DB, table, column]
  );
  return rows.length > 0;
}

async function hasIndex(table, index) {
  const [rows] = await pool.query(
    `SELECT 1 FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [DB, table, index]
  );
  return rows.length > 0;
}

async function addColumn(table, column, ddl) {
  if (await hasColumn(table, column)) {
    console.log(`  • ${table}.${column} already exists — skipped`);
    return;
  }
  await pool.query(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
  console.log(`  ✓ added ${table}.${column}`);
}

async function addIndex(table, index, ddl) {
  if (await hasIndex(table, index)) {
    console.log(`  • index ${index} already exists — skipped`);
    return;
  }
  await pool.query(`ALTER TABLE ${table} ADD ${ddl}`);
  console.log(`  ✓ added index ${index}`);
}

async function main() {
  console.log(`Migrating "${DB}" for Super Admin Portal…`);

  // New management columns on ngos.
  await addColumn('ngos', 'website', 'website VARCHAR(255) NULL AFTER contact_email');
  await addColumn('ngos', 'plan_name', "plan_name VARCHAR(100) NOT NULL DEFAULT 'Free'");
  await addColumn('ngos', 'billing_cycle', "billing_cycle ENUM('monthly','annual') NOT NULL DEFAULT 'monthly'");
  await addColumn('ngos', 'renewal_date', 'renewal_date DATE NULL');
  await addColumn('ngos', 'suspension_reason', 'suspension_reason TEXT NULL');
  await addColumn('ngos', 'deleted_at', 'deleted_at DATETIME NULL');

  // Widen the status enum to include 'expired' (safe to re-run).
  await pool.query(
    `ALTER TABLE ngos MODIFY COLUMN status
       ENUM('active','suspended','trial','expired') NOT NULL DEFAULT 'trial'`
  );
  console.log('  ✓ status enum includes expired');

  // Indexes for directory filtering.
  await addIndex('ngos', 'idx_ngos_status', 'INDEX idx_ngos_status (status)');
  await addIndex('ngos', 'idx_ngos_deleted', 'INDEX idx_ngos_deleted (deleted_at)');

  // Backfill plan/billing info from the latest subscription per tenant.
  await pool.query(`
    UPDATE ngos n
    JOIN (
      SELECT s.tenant_id,
             s.plan,
             s.renews_at,
             s.status AS sub_status
      FROM subscriptions s
      JOIN (
        SELECT tenant_id, MAX(id) AS max_id FROM subscriptions GROUP BY tenant_id
      ) latest ON latest.tenant_id = s.tenant_id AND latest.max_id = s.id
    ) sub ON sub.tenant_id = n.tenant_id
    SET n.plan_name = CONCAT(UPPER(LEFT(sub.plan,1)), SUBSTRING(sub.plan,2)),
        n.renewal_date = COALESCE(n.renewal_date, sub.renews_at)
    WHERE n.plan_name = 'Free' OR n.plan_name IS NULL
  `);
  console.log('  ✓ backfilled plan_name / renewal_date from subscriptions');

  console.log('Done.');
  await pool.end();
}

main().catch((err) => {
  console.error('Super Admin migration failed:', err.code || '', err.sqlMessage || err.message || err);
  process.exit(1);
});
