// Changes a user's login email.
//   node src/db/change-email.js <oldEmail> <newEmail>
import { pool } from './pool.js';

const oldEmail = process.argv[2];
const newEmail = process.argv[3];

if (!oldEmail || !newEmail) {
  console.error('Usage: node src/db/change-email.js <oldEmail> <newEmail>');
  process.exit(1);
}

try {
  const [res] = await pool.execute('UPDATE users SET email = ? WHERE email = ?', [newEmail, oldEmail]);
  if (res.affectedRows === 0) {
    console.error(`No user found with email: ${oldEmail}`);
  } else {
    console.log(`✓ Email changed: ${oldEmail} → ${newEmail}  (${res.affectedRows} row updated)`);
  }
} catch (e) {
  if (e.code === 'ER_DUP_ENTRY') {
    console.error(`A user with "${newEmail}" already exists in that workspace — pick a different email.`);
  } else {
    console.error('Failed:', e.code || '', e.sqlMessage || e.message);
  }
}
await pool.end();
