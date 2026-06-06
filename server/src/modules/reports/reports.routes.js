import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { query, queryOne } from '../../db/pool.js';

const router = Router();

// Donation report: totals by month + by payment method + by purpose.
router.get('/donations', asyncHandler(async (req, res) => {
  const t = req.user.tenantId;
  const byMonth = await query(
    `SELECT DATE_FORMAT(donation_date,'%Y-%m') label, SUM(amount) total, COUNT(*) count
     FROM donations WHERE tenant_id = ? AND status='received'
     GROUP BY label ORDER BY label DESC LIMIT 12`, [t]);
  const byMethod = await query(
    `SELECT payment_method label, SUM(amount) total, COUNT(*) count
     FROM donations WHERE tenant_id = ? AND status='received' GROUP BY payment_method`, [t]);
  const byPurpose = await query(
    `SELECT COALESCE(purpose,'Unspecified') label, SUM(amount) total
     FROM donations WHERE tenant_id = ? AND status='received' GROUP BY purpose ORDER BY total DESC LIMIT 8`, [t]);
  res.json({ byMonth, byMethod, byPurpose });
}));

// Member report: by status + by membership type + growth.
router.get('/members', asyncHandler(async (req, res) => {
  const t = req.user.tenantId;
  const byStatus = await query(
    `SELECT status label, COUNT(*) count FROM members WHERE tenant_id = ? GROUP BY status`, [t]);
  const byType = await query(
    `SELECT COALESCE(mt.name,'None') label, COUNT(m.id) count
     FROM members m LEFT JOIN membership_types mt ON mt.id = m.membership_type_id AND mt.tenant_id = m.tenant_id
     WHERE m.tenant_id = ? GROUP BY mt.id`, [t]);
  const growth = await query(
    `SELECT DATE_FORMAT(join_date,'%Y-%m') label, COUNT(*) count
     FROM members WHERE tenant_id = ? AND join_date IS NOT NULL GROUP BY label ORDER BY label ASC`, [t]);
  res.json({ byStatus, byType, growth });
}));

// Volunteer report: hours leaderboard + status split.
router.get('/volunteers', asyncHandler(async (req, res) => {
  const t = req.user.tenantId;
  const leaderboard = await query(
    `SELECT name label, total_hours hours FROM volunteers WHERE tenant_id = ? ORDER BY total_hours DESC LIMIT 10`, [t]);
  const byStatus = await query(
    `SELECT status label, COUNT(*) count FROM volunteers WHERE tenant_id = ? GROUP BY status`, [t]);
  res.json({ leaderboard, byStatus });
}));

// Event report: by status + budget vs participants.
router.get('/events', asyncHandler(async (req, res) => {
  const t = req.user.tenantId;
  const byStatus = await query(
    `SELECT status label, COUNT(*) count, COALESCE(SUM(budget),0) budget FROM events WHERE tenant_id = ? GROUP BY status`, [t]);
  const list = await query(
    `SELECT e.title label, e.budget, COUNT(ep.id) participants
     FROM events e LEFT JOIN event_participants ep ON ep.event_id = e.id AND ep.tenant_id = e.tenant_id
     WHERE e.tenant_id = ? GROUP BY e.id ORDER BY e.start_date DESC LIMIT 10`, [t]);
  res.json({ byStatus, list });
}));

// Financial summary: income (donations) vs expenses (event budgets).
router.get('/financial', asyncHandler(async (req, res) => {
  const t = req.user.tenantId;
  const income = Number((await queryOne(
    `SELECT COALESCE(SUM(amount),0) s FROM donations WHERE tenant_id = ? AND status='received'`, [t])).s);
  const expenses = Number((await queryOne(
    `SELECT COALESCE(SUM(budget),0) s FROM events WHERE tenant_id = ?`, [t])).s);
  const monthly = await query(
    `SELECT DATE_FORMAT(donation_date,'%Y-%m') label, SUM(amount) income
     FROM donations WHERE tenant_id = ? AND status='received'
     GROUP BY label ORDER BY label ASC LIMIT 12`, [t]);
  res.json({ income, expenses, net: income - expenses, monthly });
}));

export default router;
