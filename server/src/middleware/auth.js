import { verifyAccessToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';

// Verifies the bearer token and attaches the authenticated principal to the
// request. tenant_id, user id and role all come from the signed token.
export function authenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(ApiError.unauthorized('Missing access token'));

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      tenantId: payload.tenant_id,
      role: payload.role,
      name: payload.name,
      email: payload.email,
      impersonating: !!payload.imp,
      impersonator: payload.impersonator || null,
    };
    if (!req.user.tenantId) return next(ApiError.unauthorized('Token missing tenant scope'));
    return next();
  } catch {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
}
