import { Router } from 'express';
import { createRepository } from '../../utils/crud.js';
import { resourceRouter } from '../../utils/resourceRouter.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireRole } from '../../middleware/rbac.js';
import { queryOne, pool } from '../../db/pool.js';
import { ApiError } from '../../utils/ApiError.js';
import { code, newToken } from '../../utils/ids.js';
import { audit } from '../../utils/audit.js';

const repo = createRepository({
  table: 'receipts',
  columns: ['donation_id', 'receipt_number', 'issued_date', 'amount', 'donor_name', 'qr_token', 'emailed', 'status'],
  searchable: ['receipt_number', 'donor_name'],
  filterable: ['status'],
  sortable: ['id', 'receipt_number', 'issued_date', 'amount', 'created_at'],
  defaultSort: 'issued_date',
});

// Generate a receipt for an existing donation (idempotent per donation).
function extend(router) {
  router.post(
    '/generate/:donationId',
    requireRole('ngo_admin', 'finance_manager'),
    asyncHandler(async (req, res) => {
      const tenantId = req.user.tenantId;
      const donation = await queryOne(
        'SELECT * FROM donations WHERE id = ? AND tenant_id = ?',
        [req.params.donationId, tenantId]
      );
      if (!donation) throw ApiError.notFound('Donation not found');

      const existing = await queryOne(
        'SELECT * FROM receipts WHERE donation_id = ? AND tenant_id = ?',
        [donation.id, tenantId]
      );
      if (existing) return res.json({ data: existing, alreadyExisted: true });

      const receiptNumber = code('RCP');
      const qrToken = newToken();
      const [result] = await pool.execute(
        `INSERT INTO receipts (tenant_id, donation_id, receipt_number, issued_date, amount, donor_name, qr_token, status)
         VALUES (?, ?, ?, CURDATE(), ?, ?, ?, 'issued')`,
        [tenantId, donation.id, receiptNumber, donation.amount, donation.donor_name, qrToken]
      );
      const receipt = await queryOne('SELECT * FROM receipts WHERE id = ?', [result.insertId]);
      await audit(req, { action: 'receipt.generated', entity: 'receipt', entityId: receipt.id });
      res.status(201).json({ data: receipt });
    })
  );
}

export default resourceRouter(repo, { entity: 'receipt', writeRoles: ['ngo_admin', 'finance_manager'], extend });
