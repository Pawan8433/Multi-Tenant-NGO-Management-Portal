import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import * as ctrl from './admin.controller.js';

const router = Router();

// Every route in this module is platform-level and Super Admin only.
router.use(authenticate, requireRole('super_admin'));

router.get('/dashboard', ctrl.dashboard);
router.get('/billing', ctrl.billing);
router.get('/audit-logs', ctrl.auditLogs);

router.get('/ngos', ctrl.listNgos);
router.get('/ngos/:id', ctrl.getNgo);

router.put(
  '/ngos/:id/status',
  [body('status').isIn(['active', 'suspended', 'trial', 'expired'])],
  validate,
  ctrl.setStatus
);

router.post('/ngos/:id/impersonate', ctrl.impersonate);
router.delete('/ngos/:id', ctrl.deleteNgo);

export default router;
