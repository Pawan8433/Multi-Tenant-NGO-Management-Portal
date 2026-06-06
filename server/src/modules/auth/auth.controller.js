import { asyncHandler } from '../../utils/asyncHandler.js';
import * as service from './auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const result = await service.register(req.body);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req, res) => {
  const result = await service.login(req.body.email, req.body.password);
  res.json(result);
});

export const refresh = asyncHandler(async (req, res) => {
  const result = await service.refresh(req.body.refreshToken);
  res.json(result);
});

export const me = asyncHandler(async (req, res) => {
  const result = await service.me(req.user.id, req.user.tenantId);
  res.json(result);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await service.forgotPassword(req.body.email);
  res.json(result);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await service.resetPassword(req.body.token, req.body.password);
  res.json(result);
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const result = await service.verifyEmail(req.body.token || req.query.token);
  res.json(result);
});
