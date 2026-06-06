// Admin utility: set (and verify) a user's password by email.
//
// Usage:
//   node src/db/set-password.js <email> [password]
//   (password defaults to "Password123!")
import bcrypt from 'bcryptjs';
import { pool } from './pool.js';

const email = process.argv[2];
const password = process.argv[3] || 'Password123!';

if (!email) {
  console.error('Usage: node src/db/set-password.js <email> [password]');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);
const [res] = await pool.execute(
  "UPDATE users SET password_hash = ?, status = 'active' WHERE email = ?",
  [hash, email]
);

if (res.affectedRows === 0) {
  console.error(`No user found with email: ${email}`);
} else {
  const [rows] = await pool.query('SELECT password_hash FROM users WHERE email = ? LIMIT 1', [email]);
  const ok = await bcrypt.compare(password, rows[0].password_hash);
  console.log(`✓ Updated ${res.affectedRows} user(s). Verification: ${ok ? 'PASS' : 'FAIL'}`);
  console.log(`  Login: ${email} / ${password}`);
}

await pool.end();
