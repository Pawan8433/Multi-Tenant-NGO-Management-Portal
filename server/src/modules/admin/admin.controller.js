import { asyncHandler } from '../../utils/asyncHandler.js';
import * as service from './admin.service.js';

// Builds the "actor" passed to the service for audit logging.
const actorOf = (req) => ({
  id: req.user.id, name: req.user.name, email: req.user.email,
  tenantId: req.user.tenantId, ip: req.ip,
});

export const dashboard = asyncHandler(async (req, res) => {
  res.json(await service.dashboard());
});

export const billing = asyncHandler(async (req, res) => {
  res.json(await service.billing());
});

export const auditLogs = asyncHandler(async (req, res) => {
  res.json(await service.auditLogs(req.query));
});

export const listNgos = asyncHandler(async (req, res) => {
  res.json(await service.listNgos(req.query));
});

export const getNgo = asyncHandler(async (req, res) => {
  res.json(await service.getNgo(req.params.id));
});

export const setStatus = asyncHandler(async (req, res) => {
  const data = await service.setStatus(req.params.id, req.body.status, req.body.suspension_reason || req.body.reason, actorOf(req));
  res.json({ data });
});

export const impersonate = asyncHandler(async (req, res) => {
  res.json(await service.impersonate(req.params.id, actorOf(req)));
});

export const deleteNgo = asyncHandler(async (req, res) => {
  const permanent = req.query.permanent === 'true' || req.body?.permanent === true;
  res.json({ data: await service.deleteNgo(req.params.id, permanent, actorOf(req)) });
});
