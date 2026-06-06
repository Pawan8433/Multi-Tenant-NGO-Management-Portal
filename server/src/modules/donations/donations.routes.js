import { createRepository } from '../../utils/crud.js';
import { resourceRouter } from '../../utils/resourceRouter.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { query, queryOne } from '../../db/pool.js';

const repo = createRepository({
  table: 'donations',
  columns: ['donor_name', 'member_id', 'contact_id', 'campaign_id', 'amount', 'currency',
            'donation_date', 'payment_method', 'purpose', 'recurring', 'notes', 'status'],
  searchable: ['donor_name', 'purpose'],
  filterable: ['payment_method', 'status', 'campaign_id', 'recurring'],
  sortable: ['id', 'donor_name', 'amount', 'donation_date', 'created_at'],
  defaultSort: 'donation_date',
});

function extend(router) {
  // KPIs + 12-month trend + top donors for the donation dashboard.
  router.get(
    '/stats',
    asyncHandler(async (req, res) => {
      const t = req.user.tenantId;

      const totals = await queryOne(
        `SELECT
           COALESCE(SUM(amount),0) AS total,
           COALESCE(SUM(CASE WHEN donation_date >= DATE_FORMAT(CURDATE(),'%Y-%m-01') THEN amount ELSE 0 END),0) AS thisMonth,
           COALESCE(SUM(CASE WHEN recurring = 1 THEN amount ELSE 0 END),0) AS recurring,
           COUNT(*) AS count
         FROM donations WHERE tenant_id = ? AND status = 'received'`,
        [t]
      );

      const monthly = await query(
        `SELECT DATE_FORMAT(donation_date, '%Y-%m') AS month, SUM(amount) AS total
         FROM donations
         WHERE tenant_id = ? AND status = 'received'
           AND donation_date >= DATE_SUB(DATE_FORMAT(CURDATE(),'%Y-%m-01'), INTERVAL 11 MONTH)
         GROUP BY month ORDER BY month ASC`,
        [t]
      );

      const topDonors = await query(
        `SELECT donor_name, SUM(amount) AS total, COUNT(*) AS gifts
         FROM donations WHERE tenant_id = ? AND status = 'received'
         GROUP BY donor_name ORDER BY total DESC LIMIT 5`,
        [t]
      );

      res.json({ totals, monthly, topDonors });
    })
  );
}

export default resourceRouter(repo, { entity: 'donation', writeRoles: ['ngo_admin', 'finance_manager'], extend });
