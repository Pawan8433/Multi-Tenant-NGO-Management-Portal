import { ApiError } from '../utils/ApiError.js';

// Role-based authorization. Authoritative on the backend — the UI mirrors these
// rules but never replaces them. super_admin always passes.
export function requireRole(...allowed) {
  return (req, _res, next) => {
    const role = req.user?.role;
    if (!role) return next(ApiError.unauthorized());
    if (role === 'super_admin' || allowed.includes(role)) return next();
    return next(ApiError.forbidden('You do not have permission to perform this action'));
  };
}

// Convenience presets used across modules.
export const roles = {
  ADMIN: 'ngo_admin',
  STAFF: 'staff',
  FINANCE: 'finance_manager',
  VOLUNTEER_MGR: 'volunteer_manager',
  SUPER: 'super_admin',
};
