import { env } from '../config/env.js';

export function notFound(req, res) {
  res.status(404).json({ error: { message: `Route not found: ${req.method} ${req.originalUrl}` } });
}

// Centralized error handler — every thrown/awaited error lands here.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const status = err.statusCode || (err.code === 'ER_DUP_ENTRY' ? 409 : 500);
  const message = err.isApiError
    ? err.message
    : err.code === 'ER_DUP_ENTRY'
    ? 'A record with these details already exists'
    : status === 500
    ? 'Internal server error'
    : err.message;

  if (status >= 500) {
    console.error('[error]', err);
  }

  res.status(status).json({
    error: {
      message,
      ...(err.details ? { details: err.details } : {}),
      ...(!env.isProd && status >= 500 ? { stack: err.stack } : {}),
    },
  });
}
