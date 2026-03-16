import express, { Request, Response } from 'express';
import db from '../database';
import { authenticateToken } from '../middleware/auth';
import { generateId } from '../utils/idGenerator';

const router = express.Router();

router.use(authenticateToken);

function generateInvoiceNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');

  const lastInvoice = db.prepare(`
    SELECT invoice_number FROM bills
    WHERE invoice_number LIKE ?
    ORDER BY invoice_number DESC
    LIMIT 1
  `).get(`INV-${dateStr}-%`) as any;

  let sequence = 1;
  if (lastInvoice) {
    const match = lastInvoice.invoice_number.match(/-(\d+)$/);
    if (match) {
      sequence = parseInt(match[1]) + 1;
    }
  }

  return `INV-${dateStr}-${sequence.toString().padStart(4, '0')}`;
}

function generateReceiptNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');

  const lastReceipt = db.prepare(`
    SELECT receipt_number FROM payment_receipts
    WHERE receipt_number LIKE ?
    ORDER BY receipt_number DESC
    LIMIT 1
  `).get(`RCP-${dateStr}-%`) as any;

  let sequence = 1;
  if (lastReceipt) {
    const match = lastReceipt.receipt_number.match(/-(\d+)$/);
    if (match) {
      sequence = parseInt(match[1]) + 1;
    }
  }

  return `RCP-${dateStr}-${sequence.toString().padStart(4, '0')}`;
}

router.get('/service-catalog', (req: Request, res: Response) => {
  try {
    const { activeOnly } = req.query;

    let query = 'SELECT * FROM service_catalog';

    if (activeOnly === 'true') {
      query += ' WHERE is_active = 1';
    }

    query += ' ORDER BY category, service_name';

    const services = db.prepare(query).all();
    res.json(services);
  } catch (error: any) {
    console.error('Error fetching service catalog:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/invoices', (req: Request, res: Response) => {
  try {
    const { patientId, status, dateFrom, dateTo, limit, offset } = req.query;

    let query = `
      SELECT b.*,
        p.first_name || ' ' || p.last_name as patient_name,
        p.patient_id,
        p.phone,
        u.full_name as created_by_name
      FROM bills b
      LEFT JOIN patients p ON b.patient_id = p.id
      LEFT JOIN users u ON b.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (patientId) {
      query += ' AND b.patient_id = ?';
      params.push(patientId);
    }

    if (status) {
      query += ' AND b.payment_status = ?';
      params.push(status);
    }

    if (dateFrom) {
      query += ' AND DATE(b.billing_date) >= DATE(?)';
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ' AND DATE(b.billing_date) <= DATE(?)';
      params.push(dateTo);
    }

    query += ' ORDER BY b.billing_date DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit as string));
    }

    if (offset) {
      query += ' OFFSET ?';
      params.push(parseInt(offset as string));
    }

    const invoices = db.prepare(query).all(...params);
    res.json(invoices);
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/invoices/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const invoice = db.prepare(`
      SELECT b.*,
        p.first_name, p.last_name, p.patient_id, p.phone, p.email, p.address, p.city,
        u.full_name as created_by_name,
        v.visit_number
      FROM bills b
      LEFT JOIN patients p ON b.patient_id = p.id
      LEFT JOIN users u ON b.created_by = u.id
      LEFT JOIN visits v ON b.visit_id = v.id
      WHERE b.id = ?
    `).get(id) as any;

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const lineItems = db.prepare('SELECT * FROM bill_items WHERE bill_id = ? ORDER BY created_at').all(id);

    const payments = db.prepare(`
      SELECT p.*,
        u.full_name as recorded_by_name
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.bill_id = ?
      ORDER BY p.payment_date DESC
    `).all(id);

    invoice.lineItems = lineItems;
    invoice.payments = payments;

    res.json(invoice);
  } catch (error: any) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/invoices', (req: Request, res: Response) => {
  try {
    const {
      patientId,
      visitId,
      billingDate,
      lineItems,
      subtotal,
      tax,
      discount,
      total,
      amountPaid,
      paymentMethod,
      paymentDate,
      paymentNotes,
      notes
    } = req.body;

    const userId = (req as any).user.userId;
    const invoiceId = generateId();
    const invoiceNumber = generateInvoiceNumber();

    const balance = total - (amountPaid || 0);
    let paymentStatus = 'Unpaid';
    if (amountPaid > 0) {
      paymentStatus = balance === 0 ? 'Paid' : 'Partial';
    }

    db.prepare(`
      INSERT INTO bills (
        id, invoice_number, user_id, patient_id, visit_id,
        billing_date, subtotal, tax, discount, total,
        amount_paid, balance, payment_status, payment_method,
        payment_date, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      invoiceId,
      invoiceNumber,
      userId,
      patientId,
      visitId || null,
      billingDate || new Date().toISOString().slice(0, 10),
      subtotal || 0,
      tax || 0,
      discount || 0,
      total,
      amountPaid || 0,
      balance,
      paymentStatus,
      paymentMethod || null,
      paymentDate || null,
      notes || null,
      userId
    );

    if (lineItems && Array.isArray(lineItems)) {
      const insertLineItem = db.prepare(`
        INSERT INTO bill_items (id, bill_id, description, quantity, unit_price, total)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const item of lineItems) {
        insertLineItem.run(
          generateId(),
          invoiceId,
          item.description,
          item.quantity || 1,
          item.unitPrice,
          item.total
        );
      }
    }

    if (amountPaid && amountPaid > 0) {
      const paymentId = generateId();
      db.prepare(`
        INSERT INTO payments (id, user_id, bill_id, payment_date, amount, payment_method, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        paymentId,
        userId,
        invoiceId,
        paymentDate || new Date().toISOString().slice(0, 10),
        amountPaid,
        paymentMethod || 'Cash',
        paymentNotes || null
      );

      const receiptId = generateId();
      const receiptNumber = generateReceiptNumber();
      db.prepare(`
        INSERT INTO payment_receipts (id, receipt_number, payment_id, bill_id, patient_id, amount, payment_method, generated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        receiptId,
        receiptNumber,
        paymentId,
        invoiceId,
        patientId,
        amountPaid,
        paymentMethod || 'Cash',
        userId
      );
    }

    const newInvoice = db.prepare('SELECT * FROM bills WHERE id = ?').get(invoiceId);
    res.status(201).json(newInvoice);
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/invoices/:id/payments', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, paymentDate, transactionId, notes } = req.body;

    const userId = (req as any).user.userId;

    const invoice = db.prepare('SELECT * FROM bills WHERE id = ?').get(id) as any;

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (amount > invoice.balance) {
      return res.status(400).json({ error: 'Payment amount exceeds balance due' });
    }

    const paymentId = generateId();
    db.prepare(`
      INSERT INTO payments (id, user_id, bill_id, payment_date, amount, payment_method, transaction_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      paymentId,
      userId,
      id,
      paymentDate || new Date().toISOString().slice(0, 10),
      amount,
      paymentMethod,
      transactionId || null,
      notes || null
    );

    const newAmountPaid = invoice.amount_paid + amount;
    const newBalance = invoice.total - newAmountPaid;
    const newStatus = newBalance === 0 ? 'Paid' : 'Partial';

    db.prepare(`
      UPDATE bills
      SET amount_paid = ?, balance = ?, payment_status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newAmountPaid, newBalance, newStatus, id);

    const receiptId = generateId();
    const receiptNumber = generateReceiptNumber();
    db.prepare(`
      INSERT INTO payment_receipts (id, receipt_number, payment_id, bill_id, patient_id, amount, payment_method, generated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      receiptId,
      receiptNumber,
      paymentId,
      id,
      invoice.patient_id,
      amount,
      paymentMethod,
      userId
    );

    const newPayment = db.prepare(`
      SELECT p.*, r.receipt_number
      FROM payments p
      LEFT JOIN payment_receipts r ON r.payment_id = p.id
      WHERE p.id = ?
    `).get(paymentId);

    res.status(201).json(newPayment);
  } catch (error: any) {
    console.error('Error recording payment:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/receipts/:receiptNumber', (req: Request, res: Response) => {
  try {
    const { receiptNumber } = req.params;

    const receipt = db.prepare(`
      SELECT r.*,
        p.payment_date, p.payment_method, p.transaction_id, p.notes,
        b.invoice_number, b.total as invoice_total, b.balance as invoice_balance,
        pat.first_name, pat.last_name, pat.patient_id, pat.phone, pat.address,
        u.full_name as generated_by_name
      FROM payment_receipts r
      LEFT JOIN payments p ON r.payment_id = p.id
      LEFT JOIN bills b ON r.bill_id = b.id
      LEFT JOIN patients pat ON r.patient_id = pat.id
      LEFT JOIN users u ON r.generated_by = u.id
      WHERE r.receipt_number = ?
    `).get(receiptNumber);

    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    res.json(receipt);
  } catch (error: any) {
    console.error('Error fetching receipt:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/reports/summary', (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;

    let dateFilter = '';
    const params: any[] = [];

    if (dateFrom && dateTo) {
      dateFilter = ' WHERE DATE(billing_date) BETWEEN DATE(?) AND DATE(?)';
      params.push(dateFrom, dateTo);
    } else if (dateFrom) {
      dateFilter = ' WHERE DATE(billing_date) >= DATE(?)';
      params.push(dateFrom);
    } else if (dateTo) {
      dateFilter = ' WHERE DATE(billing_date) <= DATE(?)';
      params.push(dateTo);
    }

    const summary = db.prepare(`
      SELECT
        COUNT(*) as total_invoices,
        COALESCE(SUM(total), 0) as total_billed,
        COALESCE(SUM(amount_paid), 0) as total_collected,
        COALESCE(SUM(balance), 0) as total_outstanding,
        COALESCE(SUM(CASE WHEN payment_status = 'Paid' THEN 1 ELSE 0 END), 0) as paid_count,
        COALESCE(SUM(CASE WHEN payment_status = 'Partial' THEN 1 ELSE 0 END), 0) as partial_count,
        COALESCE(SUM(CASE WHEN payment_status = 'Unpaid' THEN 1 ELSE 0 END), 0) as unpaid_count
      FROM bills
      ${dateFilter}
    `).get(...params);

    const revenueByService = db.prepare(`
      SELECT
        bi.description,
        COUNT(*) as count,
        COALESCE(SUM(bi.total), 0) as revenue
      FROM bill_items bi
      LEFT JOIN bills b ON bi.bill_id = b.id
      ${dateFilter.replace('billing_date', 'b.billing_date')}
      GROUP BY bi.description
      ORDER BY revenue DESC
      LIMIT 10
    `).all(...params);

    const paymentMethods = db.prepare(`
      SELECT
        payment_method,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total
      FROM payments p
      LEFT JOIN bills b ON p.bill_id = b.id
      ${dateFilter.replace('billing_date', 'b.billing_date')}
      GROUP BY payment_method
      ORDER BY total DESC
    `).all(...params);

    const revenueTrend = db.prepare(`
      SELECT
        DATE(billing_date) as date,
        COALESCE(SUM(total), 0) as revenue,
        COALESCE(SUM(amount_paid), 0) as collected,
        COUNT(*) as invoice_count
      FROM bills
      ${dateFilter}
      GROUP BY DATE(billing_date)
      ORDER BY date DESC
      LIMIT 30
    `).all(...params);

    res.json({
      summary,
      revenueByService,
      paymentMethods,
      revenueTrend
    });
  } catch (error: any) {
    console.error('Error generating billing report:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/reports/outstanding', (req: Request, res: Response) => {
  try {
    const outstandingInvoices = db.prepare(`
      SELECT
        b.invoice_number,
        b.billing_date,
        b.total,
        b.amount_paid,
        b.balance,
        p.first_name || ' ' || p.last_name as patient_name,
        p.patient_id,
        p.phone,
        CAST((julianday('now') - julianday(b.billing_date)) AS INTEGER) as days_outstanding
      FROM bills b
      LEFT JOIN patients p ON b.patient_id = p.id
      WHERE b.balance > 0
      ORDER BY b.billing_date ASC
    `).all();

    const totalOutstanding = db.prepare(`
      SELECT COALESCE(SUM(balance), 0) as total
      FROM bills
      WHERE balance > 0
    `).get() as any;

    res.json({
      invoices: outstandingInvoices,
      totalOutstanding: totalOutstanding.total
    });
  } catch (error: any) {
    console.error('Error generating outstanding report:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
