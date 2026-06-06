// Runs schema.sql against the configured database, creating it if needed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  // Connect without a database to ensure it exists, then switch into it.
  const conn = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    multipleStatements: true,
  });

  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${env.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );
  await conn.query(`USE \`${env.db.database}\`;`);
  await conn.query(schema);
  await conn.end();

  console.log(`✓ Schema applied to database "${env.db.database}".`);
}

main().catch((err) => {
  console.error('Migration failed:', err.code || '', err.sqlMessage || err.message || '(no message)');
  if (err.errors) console.error('  Underlying:', err.errors.map((e) => `${e.code || ''} ${e.message}`).join(' | '));
  console.error(err);
  process.exit(1);
});
