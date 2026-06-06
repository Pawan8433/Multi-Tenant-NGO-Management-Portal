import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

// Runs after a chain of express-validator rules; collects errors into a 400.
export function validate(req, _res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const details = result.array().map((e) => ({ field: e.path, message: e.msg }));
  return next(ApiError.badRequest('Validation failed', details));
}
