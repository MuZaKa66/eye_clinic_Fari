import express, { Request, Response } from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { generateAppointmentNumber, generateId } from '../utils/idGenerator.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', (req: Request, res: Response) => {
  try {
    const {
      status,
      date,
      dateFrom,
      dateTo,
      doctorId,
      patientId,
      appointmentType
    } = req.query;

    let query = `
      SELECT a.*,
        p.first_name || ' ' || p.last_name as patient_name,
        p.phone, p.email, p.patient_id,
        d.full_name as doctor_name,
        c.full_name as created_by_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN users d ON a.doctor_id = d.id
      LEFT JOIN users c ON a.created_by = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    if (date) {
      query += ' AND DATE(a.appointment_date) = DATE(?)';
      params.push(date);
    }

    if (dateFrom) {
      query += ' AND DATE(a.appointment_date) >= DATE(?)';
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ' AND DATE(a.appointment_date) <= DATE(?)';
      params.push(dateTo);
    }

    if (doctorId) {
      query += ' AND a.doctor_id = ?';
      params.push(doctorId);
    }

    if (patientId) {
      query += ' AND a.patient_id = ?';
      params.push(patientId);
    }

    if (appointmentType) {
      query += ' AND a.appointment_type = ?';
      params.push(appointmentType);
    }

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    const appointments = db.prepare(query).all(...params);
    res.json(appointments);
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/calendar/daily', (req: Request, res: Response) => {
  try {
    const { date, doctorId } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    let query = `
      SELECT a.*,
        p.first_name || ' ' || p.last_name as patient_name,
        p.phone, p.patient_id,
        d.full_name as doctor_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN users d ON a.doctor_id = d.id
      WHERE DATE(a.appointment_date) = DATE(?)
        AND a.status NOT IN ('Cancelled', 'No-show')
    `;
    const params: any[] = [date];

    if (doctorId) {
      query += ' AND a.doctor_id = ?';
      params.push(doctorId);
    }

    query += ' ORDER BY a.appointment_time';

    const appointments = db.prepare(query).all(...params);
    res.json(appointments);
  } catch (error: any) {
    console.error('Error fetching daily calendar:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/calendar/weekly', (req: Request, res: Response) => {
  try {
    const { weekStart, doctorId } = req.query;

    if (!weekStart) {
      return res.status(400).json({ error: 'Week start date parameter is required' });
    }

    let query = `
      SELECT a.*,
        p.first_name || ' ' || p.last_name as patient_name,
        p.phone, p.patient_id,
        d.full_name as doctor_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN users d ON a.doctor_id = d.id
      WHERE DATE(a.appointment_date) BETWEEN DATE(?) AND DATE(?, '+6 days')
        AND a.status NOT IN ('Cancelled', 'No-show')
    `;
    const params: any[] = [weekStart, weekStart];

    if (doctorId) {
      query += ' AND a.doctor_id = ?';
      params.push(doctorId);
    }

    query += ' ORDER BY a.appointment_date, a.appointment_time';

    const appointments = db.prepare(query).all(...params);
    res.json(appointments);
  } catch (error: any) {
    console.error('Error fetching weekly calendar:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/calendar/monthly', (req: Request, res: Response) => {
  try {
    const { month, year, doctorId } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year parameters are required' });
    }

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    let query = `
      SELECT DATE(a.appointment_date) as date,
        COUNT(*) as count,
        SUM(CASE WHEN a.status = 'Scheduled' THEN 1 ELSE 0 END) as scheduled,
        SUM(CASE WHEN a.status = 'Confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN a.status = 'Completed' THEN 1 ELSE 0 END) as completed
      FROM appointments a
      WHERE DATE(a.appointment_date) BETWEEN DATE(?) AND DATE(?)
        AND a.status NOT IN ('Cancelled', 'No-show')
    `;
    const params: any[] = [startDate, endDate];

    if (doctorId) {
      query += ' AND a.doctor_id = ?';
      params.push(doctorId);
    }

    query += ' GROUP BY DATE(a.appointment_date) ORDER BY date';

    const appointments = db.prepare(query).all(...params);
    res.json(appointments);
  } catch (error: any) {
    console.error('Error fetching monthly calendar:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/check-conflicts', (req: Request, res: Response) => {
  try {
    const { appointmentDate, appointmentTime, durationMinutes, doctorId, excludeId } = req.body;

    if (!appointmentDate || !appointmentTime || !durationMinutes || !doctorId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    let query = `
      SELECT a.id, a.appointment_time, a.duration_minutes,
        p.first_name || ' ' || p.last_name as patient_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      WHERE a.doctor_id = ?
        AND DATE(a.appointment_date) = DATE(?)
        AND a.status NOT IN ('Cancelled', 'No-show')
        AND (
          (TIME(a.appointment_time) <= TIME(?) AND
           TIME(a.appointment_time, '+' || a.duration_minutes || ' minutes') > TIME(?))
          OR
          (TIME(a.appointment_time) < TIME(?, '+' || ? || ' minutes') AND
           TIME(a.appointment_time) >= TIME(?))
        )
    `;
    const params: any[] = [
      doctorId,
      appointmentDate,
      appointmentTime,
      appointmentTime,
      appointmentTime,
      durationMinutes,
      appointmentTime
    ];

    if (excludeId) {
      query += ' AND a.id != ?';
      params.push(excludeId);
    }

    query += ' LIMIT 1';

    const conflict = db.prepare(query).get(...params) as any;

    res.json({
      hasConflict: conflict !== undefined,
      conflictingAppointment: conflict || null
    });
  } catch (error: any) {
    console.error('Error checking conflicts:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo, doctorId } = req.query;

    let query = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Scheduled' THEN 1 ELSE 0 END) as scheduled,
        SUM(CASE WHEN status = 'Confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status = 'No-show' THEN 1 ELSE 0 END) as no_show
      FROM appointments
      WHERE 1=1
    `;
    const params: any[] = [];

    if (dateFrom) {
      query += ' AND DATE(appointment_date) >= DATE(?)';
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ' AND DATE(appointment_date) <= DATE(?)';
      params.push(dateTo);
    }

    if (doctorId) {
      query += ' AND doctor_id = ?';
      params.push(doctorId);
    }

    const stats = db.prepare(query).get(...params);
    res.json(stats);
  } catch (error: any) {
    console.error('Error fetching appointment stats:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const appointment = db.prepare(`
      SELECT a.*,
        p.first_name, p.last_name, p.phone, p.email, p.patient_id,
        p.date_of_birth, p.gender,
        d.full_name as doctor_name,
        c.full_name as created_by_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN users d ON a.doctor_id = d.id
      LEFT JOIN users c ON a.created_by = c.id
      WHERE a.id = ?
    `).get(id) as any;

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const statusHistory = db.prepare(`
      SELECT h.*,
        u.full_name as changed_by_name
      FROM appointment_status_history h
      LEFT JOIN users u ON h.changed_by = u.id
      WHERE h.appointment_id = ?
      ORDER BY h.created_at DESC
    `).all(id);

    appointment.statusHistory = statusHistory;

    res.json(appointment);
  } catch (error: any) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const {
      patientId,
      appointmentDate,
      appointmentTime,
      durationMinutes,
      appointmentType,
      reason,
      notes,
      doctorId,
      confirmedByPhone,
      confirmedBySms,
      reminderSent
    } = req.body;

    const userId = (req as any).user.userId;
    const appointmentId = generateId();
    const appointmentNumber = generateAppointmentNumber();

    db.prepare(`
      INSERT INTO appointments (
        id, appointment_number, user_id, patient_id,
        appointment_date, appointment_time, duration_minutes,
        appointment_type, status, reason, notes, doctor_id,
        confirmed_by_phone, confirmed_by_sms, reminder_sent,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      appointmentId,
      appointmentNumber,
      userId,
      patientId,
      appointmentDate,
      appointmentTime,
      durationMinutes || 30,
      appointmentType || null,
      'Scheduled',
      reason || null,
      notes || null,
      doctorId || userId,
      confirmedByPhone ? 1 : 0,
      confirmedBySms ? 1 : 0,
      reminderSent ? 1 : 0,
      userId
    );

    db.prepare(`
      INSERT INTO appointment_status_history (
        id, appointment_id, previous_status, new_status, changed_by, reason
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      generateId(),
      appointmentId,
      null,
      'Scheduled',
      userId,
      'Appointment created'
    );

    const newAppointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId);
    res.status(201).json(newAppointment);
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason, notes } = req.body;
    const userId = (req as any).user.userId;

    const appointment = db.prepare('SELECT status FROM appointments WHERE id = ?').get(id) as any;

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const previousStatus = appointment.status;
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'Cancelled') {
      updateData.cancellation_reason = reason;
      updateData.cancelled_at = new Date().toISOString();
      updateData.cancelled_by = userId;
    } else if (status === 'Completed') {
      updateData.completed_at = new Date().toISOString();
    } else if (status === 'No-show') {
      updateData.no_show_notes = notes;
    }

    const fields = Object.keys(updateData);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = [...fields.map(field => updateData[field]), id];

    db.prepare(`UPDATE appointments SET ${setClause} WHERE id = ?`).run(...values);

    db.prepare(`
      INSERT INTO appointment_status_history (
        id, appointment_id, previous_status, new_status, changed_by, reason
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      generateId(),
      id,
      previousStatus,
      status,
      userId,
      reason || notes || `Status changed to ${status}`
    );

    const updatedAppointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
    res.json(updatedAppointment);
  } catch (error: any) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date().toISOString() };

    delete updates.id;
    delete updates.appointment_number;
    delete updates.user_id;
    delete updates.created_by;
    delete updates.created_at;

    const fields = Object.keys(updates);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = [...fields.map(field => updates[field]), id];

    const result = db.prepare(`UPDATE appointments SET ${setClause} WHERE id = ?`).run(...values);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
    res.json(appointment);
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM appointments WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
