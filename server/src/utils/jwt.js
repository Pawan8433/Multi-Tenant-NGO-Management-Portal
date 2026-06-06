import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// The access token carries exactly what authorization needs: who the user is,
// which tenant they belong to, and their role. tenant_id is read from here on
// every request — never from client input.
export function signAccessToken(payload) {
  return jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessTtl });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshTtl });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}
