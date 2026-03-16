import express from 'express';
import db from '../database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', (req: AuthRequest, res) => {
  try {
    const totalPatients = db.prepare(
      'SELECT COUNT(*) as count FROM patients WHERE user_id = ?'
    ).get(req.userId) as any;

    const todayAppointments = db.prepare(
      `SELECT COUNT(*) as count FROM appointments
       WHERE user_id = ? AND DATE(appointment_date) = DATE('now')`
    ).get(req.userId) as any;

    const pendingBills = db.prepare(
      `SELECT COUNT(*) as count FROM bills
       WHERE user_id = ? AND status = 'pending'`
    ).get(req.userId) as any;

    const monthlyRevenue = db.prepare(
      `SELECT COALESCE(SUM(amount_paid), 0) as revenue FROM bills
       WHERE user_id = ? AND strftime('%Y-%m', bill_date) = strftime('%Y-%m', 'now')`
    ).get(req.userId) as any;

    res.json({
      totalPatients: totalPatients.count,
      todayAppointments: todayAppointments.count,
      pendingBills: pendingBills.count,
      monthlyRevenue: monthlyRevenue.revenue
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
