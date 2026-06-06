import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';

import authRoutes from '../modules/auth/auth.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';
import membersRoutes from '../modules/members/members.routes.js';
import contactsRoutes from '../modules/contacts/contacts.routes.js';
import volunteersRoutes from '../modules/volunteers/volunteers.routes.js';
import eventsRoutes from '../modules/events/events.routes.js';
import donationsRoutes from '../modules/donations/donations.routes.js';
import receiptsRoutes from '../modules/receipts/receipts.routes.js';
import campaignsRoutes from '../modules/campaigns/campaigns.routes.js';
import reportsRoutes from '../modules/reports/reports.routes.js';
import adminsRoutes from '../modules/admins/admins.routes.js';
import settingsRoutes from '../modules/settings/settings.routes.js';
import auditRoutes from '../modules/audit/audit.routes.js';
import notificationsRoutes from '../modules/notifications/notifications.routes.js';
import adminRoutes from '../modules/admin/admin.routes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ ok: true, service: 'impacthub-api' }));

// Public auth endpoints.
router.use('/auth', authRoutes);

// Platform (cross-tenant) Super Admin endpoints — authenticate + super_admin
// guard live inside the module, so mount before the tenant-scoped block.
router.use('/admin', adminRoutes);

// Everything below requires a valid token (which carries the tenant scope).
router.use(authenticate);
router.use('/dashboard', dashboardRoutes);
router.use('/members', membersRoutes);
router.use('/contacts', contactsRoutes);
router.use('/volunteers', volunteersRoutes);
router.use('/events', eventsRoutes);
router.use('/donations', donationsRoutes);
router.use('/receipts', receiptsRoutes);
router.use('/campaigns', campaignsRoutes);
router.use('/reports', reportsRoutes);
router.use('/admins', adminsRoutes);
router.use('/settings', settingsRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/notifications', notificationsRoutes);

export default router;
