import { pool, query, queryOne } from '../../db/pool.js';
import { ApiError } from '../../utils/ApiError.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { newTenantId, newWorkspaceId, newToken } from '../../utils/ids.js';

function tokensFor(user) {
  const payload = {
    sub: user.id,
    tenant_id: user.tenant_id,
    role: user.role,
    name: user.name,
    email: user.email,
  };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken({ sub: user.id, tenant_id: user.tenant_id }),
  };
}

function publicUser(u) {
  return { id: u.id, tenantId: u.tenant_id, name: u.name, email: u.email, role: u.role,
           status: u.status, emailVerified: !!u.email_verified, avatarUrl: u.avatar_url };
}

export async function register(input) {
  const existing = await queryOne('SELECT id FROM users WHERE email = ? LIMIT 1', [input.email]);
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const tenantId = newTenantId();
  const workspaceId = newWorkspaceId();
  const verificationToken = newToken();
  const passwordHash = await hashPassword(input.password);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.execute(
      `INSERT INTO ngos (tenant_id, workspace_id, name, registration_number, email, phone, country, address, contact_email, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'trial')`,
      [tenantId, workspaceId, input.ngoName, input.registrationNumber || null, input.email,
       input.phone || null, input.country || null, input.address || null, input.email]
    );

    const [userRes] = await conn.execute(
      `INSERT INTO users (tenant_id, name, email, password_hash, role, status, email_verified, verification_token)
       VALUES (?, ?, ?, ?, 'ngo_admin', 'active', 0, ?)`,
      [tenantId, input.ngoName + ' Admin', input.email, passwordHash, verificationToken]
    );

    await conn.execute(
      `INSERT INTO subscriptions (tenant_id, plan, status, amount, started_at, renews_at)
       VALUES (?, 'free', 'trialing', 0, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY))`,
      [tenantId]
    );

    await conn.execute(
      `INSERT INTO onboarding (tenant_id, steps, completed) VALUES (?, ?, 0)`,
      [tenantId, JSON.stringify({ create_organization: true })]
    );

    await conn.commit();

    const user = { id: userRes.insertId, tenant_id: tenantId, name: input.ngoName + ' Admin',
                   email: input.email, role: 'ngo_admin', status: 'active', email_verified: 0 };

    return {
      user: publicUser(user),
      tenant: { tenantId, workspaceId, name: input.ngoName },
      verificationToken, // returned for dev; in production this is emailed
      ...tokensFor(user),
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function login(email, password) {
  // No tenant context yet — match by email, then verify password.
  const candidates = await query('SELECT * FROM users WHERE email = ?', [email]);
  for (const user of candidates) {
    if (await comparePassword(password, user.password_hash)) {
      if (user.status === 'suspended') throw ApiError.forbidden('This account is suspended');

      // Organization-level access controls (set from the Super Admin Portal).
      const ngo = await queryOne(
        'SELECT name, workspace_id, status, suspension_reason, deleted_at FROM ngos WHERE tenant_id = ?',
        [user.tenant_id]
      );
      if (ngo?.deleted_at) throw ApiError.forbidden('This organization account has been closed.');
      if (ngo?.status === 'suspended') {
        throw ApiError.forbidden(
          ngo.suspension_reason ? `Organization suspended: ${ngo.suspension_reason}` : 'This organization is suspended.'
        );
      }
      if (ngo?.status === 'expired') throw ApiError.forbidden("This organization's subscription has expired.");

      await pool.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
      return {
        user: publicUser(user),
        tenant: { tenantId: user.tenant_id, workspaceId: ngo?.workspace_id, name: ngo?.name },
        ...tokensFor(user),
      };
    }
  }
  throw ApiError.unauthorized('Invalid email or password');
}

export async function refresh(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }
  const user = await queryOne('SELECT * FROM users WHERE id = ? AND tenant_id = ?', [payload.sub, payload.tenant_id]);
  if (!user) throw ApiError.unauthorized('Account no longer exists');
  return { user: publicUser(user), ...tokensFor(user) };
}

export async function me(userId, tenantId) {
  const user = await queryOne('SELECT * FROM users WHERE id = ? AND tenant_id = ?', [userId, tenantId]);
  if (!user) throw ApiError.notFound('User not found');
  const ngo = await queryOne('SELECT * FROM ngos WHERE tenant_id = ?', [tenantId]);
  return { user: publicUser(user), tenant: ngo };
}

export async function forgotPassword(email) {
  const user = await queryOne('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  // Always respond success to avoid leaking which emails exist.
  if (!user) return { ok: true };
  const token = newToken();
  await pool.execute(
    'UPDATE users SET reset_token = ?, reset_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?',
    [token, user.id]
  );
  return { ok: true, resetToken: token }; // emailed in production
}

export async function resetPassword(token, newPassword) {
  const user = await queryOne(
    'SELECT id FROM users WHERE reset_token = ? AND reset_expires > NOW() LIMIT 1',
    [token]
  );
  if (!user) throw ApiError.badRequest('Reset link is invalid or has expired');
  const passwordHash = await hashPassword(newPassword);
  await pool.execute(
    'UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
    [passwordHash, user.id]
  );
  return { ok: true };
}

export async function verifyEmail(token) {
  const user = await queryOne('SELECT id FROM users WHERE verification_token = ? LIMIT 1', [token]);
  if (!user) throw ApiError.badRequest('Verification link is invalid');
  await pool.execute('UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?', [user.id]);
  return { ok: true };
}
