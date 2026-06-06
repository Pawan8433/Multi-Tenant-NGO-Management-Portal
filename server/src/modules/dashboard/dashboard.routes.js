import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { query, queryOne } from '../../db/pool.js';

const router = Router();

// Aggregated dashboard payload: stat widgets, chart series, recent activity.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const t = req.user.tenantId;

    const [stats] = await Promise.all([
      (async () => ({
        members: Number((await queryOne('SELECT COUNT(*) c FROM members WHERE tenant_id = ?', [t])).c),
        donationsTotal: Number(
          (await queryOne(`SELECT COALESCE(SUM(amount),0) s FROM donations WHERE tenant_id = ? AND status='received'`, [t])).s
        ),
        volunteers: Number((await queryOne('SELECT COUNT(*) c FROM volunteers WHERE tenant_id = ?', [t])).c),
        events: Number((await queryOne('SELECT COUNT(*) c FROM events WHERE tenant_id = ?', [t])).c),
        activeCampaigns: Number(
          (await queryOne(`SELECT COUNT(*) c FROM campaigns WHERE tenant_id = ? AND status IN ('scheduled','sending')`, [t])).c
        ),
        pendingReceipts: Number(
          (await queryOne(
            `SELECT COUNT(*) c FROM donations d
             WHERE d.tenant_id = ? AND d.status='received'
               AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.donation_id = d.id AND r.tenant_id = d.tenant_id)`,
            [t]
          )).c
        ),
      }))(),
    ]);

    const monthlyDonations = await query(
      `SELECT DATE_FORMAT(donation_date,'%Y-%m') month, SUM(amount) total
       FROM donations WHERE tenant_id = ? AND status='received'
         AND donation_date >= DATE_SUB(DATE_FORMAT(CURDATE(),'%Y-%m-01'), INTERVAL 11 MONTH)
       GROUP BY month ORDER BY month ASC`,
      [t]
    );

    const eventParticipation = await query(
      `SELECT e.title, COUNT(ep.id) participants
       FROM events e LEFT JOIN event_participants ep ON ep.event_id = e.id AND ep.tenant_id = e.tenant_id
       WHERE e.tenant_id = ?
       GROUP BY e.id ORDER BY e.start_date DESC LIMIT 6`,
      [t]
    );

    const volunteerActivity = await query(
      `SELECT name, total_hours hours FROM volunteers WHERE tenant_id = ?
       ORDER BY total_hours DESC LIMIT 6`,
      [t]
    );

    const recentActivity = await query(
      `SELECT action, entity, actor_name, created_at FROM audit_logs
       WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 8`,
      [t]
    );

    res.json({ stats, monthlyDonations, eventParticipation, volunteerActivity, recentActivity });
  })
);

export default router;
