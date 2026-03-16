import express from 'express';
import { randomUUID } from 'crypto';
import db from '../database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', (req: AuthRequest, res) => {
  try {
    const { status, patient_id } = req.query;
    let query = `
      SELECT b.*, p.first_name, p.last_name
      FROM bills b
      LEFT JOIN patients p ON b.patient_id = p.id
      WHERE b.user_id = ?
    `;
    const params: any[] = [req.userId];

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    if (patient_id) {
      query += ' AND b.patient_id = ?';
      params.push(patient_id);
    }

    query += ' ORDER BY b.bill_date DESC';

    const bills = db.prepare(query).all(...params);
    res.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

router.get('/:id', (req: AuthRequest, res) => {
  try {
    const bill = db.prepare(`
      SELECT b.*, p.first_name, p.last_name
      FROM bills b
      LEFT JOIN patients p ON b.patient_id = p.id
      WHERE b.id = ? AND b.user_id = ?
    `).get(req.params.id, req.userId);

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const items = db.prepare('SELECT * FROM bill_items WHERE bill_id = ?').all(req.params.id);
    const payments = db.prepare('SELECT * FROM payments WHERE bill_id = ?').all(req.params.id);

    res.json({ ...bill, items, payments });
  } catch (error) {
    console.error('Error fetching bill:', error);
    res.status(500).json({ error: 'Failed to fetch bill' });
  }
});

router.post('/', (req: AuthRequest, res) => {
  try {
    const billId = randomUUID();
    const { items, ...billData } = req.body;

    const bill = {
      id: billId,
      user_id: req.userId,
      patient_id: billData.patient_id,
      visit_id: billData.visit_id || null,
      bill_number: billData.bill_number,
      bill_date: billData.bill_date,
      due_date: billData.due_date || null,
      subtotal: billData.subtotal || 0,
      tax: billData.tax || 0,
      discount: billData.discount || 0,
      total: billData.total || 0,
      amount_paid: billData.amount_paid || 0,
      balance: billData.balance || billData.total || 0,
      status: billData.status || 'pending',
      notes: billData.notes || null
    };

    db.prepare(`
      INSERT INTO bills (id, user_id, patient_id, visit_id, bill_number, bill_date, due_date, subtotal, tax, discount, total, amount_paid, balance, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      bill.id, bill.user_id, bill.patient_id, bill.visit_id, bill.bill_number,
      bill.bill_date, bill.due_date, bill.subtotal, bill.tax, bill.discount,
      bill.total, bill.amount_paid, bill.balance, bill.status, bill.notes
    );

    if (items && Array.isArray(items)) {
      const itemStmt = db.prepare(`
        INSERT INTO bill_items (id, bill_id, description, quantity, unit_price, total)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const item of items) {
        itemStmt.run(
          randomUUID(),
          billId,
          item.description,
          item.quantity,
          item.unit_price,
          item.total
        );
      }
    }

    const createdBill = db.prepare('SELECT * FROM bills WHERE id = ?').get(billId);
    const createdItems = db.prepare('SELECT * FROM bill_items WHERE bill_id = ?').all(billId);

    res.status(201).json({ ...createdBill, items: createdItems });
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({ error: 'Failed to create bill' });
  }
});

router.put('/:id', (req: AuthRequest, res) => {
  try {
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    delete updates.items;

    const fields = Object.keys(updates);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = [...fields.map(field => updates[field]), req.params.id, req.userId];

    const result = db.prepare(
      `UPDATE bills SET ${setClause} WHERE id = ? AND user_id = ?`
    ).run(...values);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const bill = db.prepare('SELECT * FROM bills WHERE id = ?').get(req.params.id);
    res.json(bill);
  } catch (error) {
    console.error('Error updating bill:', error);
    res.status(500).json({ error: 'Failed to update bill' });
  }
});

router.delete('/:id', (req: AuthRequest, res) => {
  try {
    db.prepare('DELETE FROM bill_items WHERE bill_id = ?').run(req.params.id);
    db.prepare('DELETE FROM payments WHERE bill_id = ?').run(req.params.id);

    const result = db.prepare('DELETE FROM bills WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Error deleting bill:', error);
    res.status(500).json({ error: 'Failed to delete bill' });
  }
});

export default router;
