import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

// Shared connection pool. `multipleStatements` is enabled only for the
// migrate/seed runners via a separate connection; the app pool keeps it off.
// Reusable TLS option for managed cloud MySQL (set DB_SSL=true).
export const sslOption = env.db.ssl ? { rejectUnauthorized: false } : undefined;

export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  ssl: sslOption,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: false,
  dateStrings: true,
});

export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}
