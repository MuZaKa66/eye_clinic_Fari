import express, { Request, Response } from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/summary', (req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    const todayPatients = db.prepare(`
      SELECT COUNT(*) as count FROM patients WHERE DATE(created_at) = DATE(?)
    `).get(today) as any;

    const yesterdayPatients = db.prepare(`
      SELECT COUNT(*) as count FROM patients WHERE DATE(created_at) = DATE(?)
    `).get(yesterday) as any;

    const todayAppointments = db.prepare(`
      SELECT COUNT(*) as count FROM appointments
      WHERE DATE(appointment_date) = DATE(?)
    `).get(today) as any;

    const yesterdayAppointments = db.prepare(`
      SELECT COUNT(*) as count FROM appointments
      WHERE DATE(appointment_date) = DATE(?)
    `).get(yesterday) as any;

    const completedAppointments = db.prepare(`
      SELECT COUNT(*) as count FROM appointments
      WHERE DATE(appointment_date) = DATE(?) AND status = 'Completed'
    `).get(today) as any;

    const pendingAppointments = db.prepare(`
      SELECT COUNT(*) as count FROM appointments
      WHERE DATE(appointment_date) = DATE(?) AND status IN ('Scheduled', 'Confirmed')
    `).get(today) as any;

    const todayRevenue = db.prepare(`
      SELECT COALESCE(SUM(total), 0) as amount FROM bills
      WHERE DATE(billing_date) = DATE(?)
    `).get(today) as any;

    const yesterdayRevenue = db.prepare(`
      SELECT COALESCE(SUM(total), 0) as amount FROM bills
      WHERE DATE(billing_date) = DATE(?)
    `).get(yesterday) as any;

    res.json({
      patients: {
        today: todayPatients.count,
        yesterday: yesterdayPatients.count,
        change: todayPatients.count - yesterdayPatients.count
      },
      appointments: {
        today: todayAppointments.count,
        yesterday: yesterdayAppointments.count,
        change: todayAppointments.count - yesterdayAppointments.count,
        completed: completedAppointments.count,
        pending: pendingAppointments.count
      },
      revenue: {
        today: todayRevenue.amount,
        yesterday: yesterdayRevenue.amount,
        change: todayRevenue.amount - yesterdayRevenue.amount
      }
    });
  } catch (error: any) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/charts/patients-registered', (req: Request, res: Response) => {
  try {
    const { days } = req.query;
    const daysCount = days ? parseInt(days as string) : 30;

    const data = db.prepare(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM patients
      WHERE DATE(created_at) >= DATE('now', '-' || ? || ' days')
      GROUP BY DATE(created_at)
      ORDER BY date
    `).all(daysCount);

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching patients chart:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/charts/visits-per-day', (req: Request, res: Response) => {
  try {
    const { days } = req.query;
    const daysCount = days ? parseInt(days as string) : 7;

    const data = db.prepare(`
      SELECT
        DATE(visit_date) as date,
        COUNT(*) as count
      FROM visits
      WHERE DATE(visit_date) >= DATE('now', '-' || ? || ' days')
      GROUP BY DATE(visit_date)
      ORDER BY date
    `).all(daysCount);

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching visits chart:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/charts/revenue-trend', (req: Request, res: Response) => {
  try {
    const { days } = req.query;
    const daysCount = days ? parseInt(days as string) : 30;

    const data = db.prepare(`
      SELECT
        DATE(billing_date) as date,
        COALESCE(SUM(total), 0) as revenue,
        COALESCE(SUM(amount_paid), 0) as collected,
        COUNT(*) as invoice_count
      FROM bills
      WHERE DATE(billing_date) >= DATE('now', '-' || ? || ' days')
      GROUP BY DATE(billing_date)
      ORDER BY date
    `).all(daysCount);

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching revenue chart:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/charts/diagnosis-breakdown', (req: Request, res: Response) => {
  try {
    const { period } = req.query;
    const periodFilter = period === 'year' ? '365' :
                         period === 'quarter' ? '90' :
                         period === 'week' ? '7' : '30';

    const data = db.prepare(`
      SELECT
        diagnosis,
        COUNT(*) as count
      FROM visits
      WHERE DATE(visit_date) >= DATE('now', '-' || ? || ' days')
        AND diagnosis IS NOT NULL
        AND diagnosis != ''
      GROUP BY diagnosis
      ORDER BY count DESC
      LIMIT 10
    `).all(periodFilter);

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching diagnosis chart:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/recent-patients', (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const limitCount = limit ? parseInt(limit as string) : 5;

    const patients = db.prepare(`
      SELECT
        id, patient_id, first_name, last_name, age, gender, phone, registration_date
      FROM patients
      ORDER BY created_at DESC
      LIMIT ?
    `).all(limitCount);

    res.json(patients);
  } catch (error: any) {
    console.error('Error fetching recent patients:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/today-appointments', (req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const appointments = db.prepare(`
      SELECT
        a.id,
        a.appointment_number,
        a.appointment_time,
        a.duration_minutes,
        a.status,
        a.appointment_type,
        a.reason,
        p.first_name || ' ' || p.last_name as patient_name,
        p.patient_id,
        p.phone,
        u.full_name as doctor_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN users u ON a.doctor_id = u.id
      WHERE DATE(a.appointment_date) = DATE(?)
      ORDER BY a.appointment_time
    `).all(today);

    res.json(appointments);
  } catch (error: any) {
    console.error('Error fetching today appointments:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/pending-payments', (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const limitCount = limit ? parseInt(limit as string) : 5;

    const pendingPayments = db.prepare(`
      SELECT
        b.id,
        b.invoice_number,
        b.billing_date,
        b.total,
        b.amount_paid,
        b.balance,
        b.payment_status,
        p.first_name || ' ' || p.last_name as patient_name,
        p.patient_id,
        p.phone,
        CAST((julianday('now') - julianday(b.billing_date)) AS INTEGER) as days_overdue
      FROM bills b
      LEFT JOIN patients p ON b.patient_id = p.id
      WHERE b.balance > 0
      ORDER BY b.billing_date ASC
      LIMIT ?
    `).all(limitCount);

    res.json(pendingPayments);
  } catch (error: any) {
    console.error('Error fetching pending payments:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/upcoming-appointments', (req: Request, res: Response) => {
  try {
    const { days } = req.query;
    const daysCount = days ? parseInt(days as string) : 7;

    const appointments = db.prepare(`
      SELECT
        DATE(appointment_date) as date,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'Scheduled' THEN 1 ELSE 0 END) as scheduled,
        SUM(CASE WHEN status = 'Confirmed' THEN 1 ELSE 0 END) as confirmed
      FROM appointments
      WHERE DATE(appointment_date) BETWEEN DATE('now') AND DATE('now', '+' || ? || ' days')
        AND status NOT IN ('Cancelled', 'Completed', 'No-show')
      GROUP BY DATE(appointment_date)
      ORDER BY date
    `).all(daysCount);

    res.json(appointments);
  } catch (error: any) {
    console.error('Error fetching upcoming appointments:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats/overview', (req: Request, res: Response) => {
  try {
    const totalPatients = db.prepare('SELECT COUNT(*) as count FROM patients WHERE is_active = 1').get() as any;
    const totalVisits = db.prepare('SELECT COUNT(*) as count FROM visits').get() as any;
    const totalAppointments = db.prepare('SELECT COUNT(*) as count FROM appointments').get() as any;
    const totalRevenue = db.prepare('SELECT COALESCE(SUM(total), 0) as amount FROM bills').get() as any;
    const outstandingBalance = db.prepare('SELECT COALESCE(SUM(balance), 0) as amount FROM bills WHERE balance > 0').get() as any;

    const activeUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_active = 1').get() as any;

    res.json({
      totalPatients: totalPatients.count,
      totalVisits: totalVisits.count,
      totalAppointments: totalAppointments.count,
      totalRevenue: totalRevenue.amount,
      outstandingBalance: outstandingBalance.amount,
      activeUsers: activeUsers.count
    });
  } catch (error: any) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
