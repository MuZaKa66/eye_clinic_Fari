import express from 'express';
import { randomUUID } from 'crypto';
import db from '../database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', (req: AuthRequest, res) => {
  try {
    const { status, date } = req.query;
    let query = `
      SELECT a.*, p.first_name, p.last_name, p.phone, p.email
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      WHERE a.user_id = ?
    `;
    const params: any[] = [req.userId];

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    if (date) {
      query += ' AND DATE(a.appointment_date) = DATE(?)';
      params.push(date);
    }

    query += ' ORDER BY a.appointment_date DESC';

    const appointments = db.prepare(query).all(...params);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.get('/:id', (req: AuthRequest, res) => {
  try {
    const appointment = db.prepare(`
      SELECT a.*, p.first_name, p.last_name, p.phone, p.email
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      WHERE a.id = ? AND a.user_id = ?
    `).get(req.params.id, req.userId);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

router.post('/', (req: AuthRequest, res) => {
  try {
    const appointmentId = randomUUID();
    const appointmentData = {
      id: appointmentId,
      user_id: req.userId,
      patient_id: req.body.patient_id,
      appointment_date: req.body.appointment_date,
      appointment_type: req.body.appointment_type,
      status: req.body.status || 'scheduled',
      notes: req.body.notes || null
    };

    db.prepare(`
      INSERT INTO appointments (id, user_id, patient_id, appointment_date, appointment_type, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      appointmentData.id,
      appointmentData.user_id,
      appointmentData.patient_id,
      appointmentData.appointment_date,
      appointmentData.appointment_type,
      appointmentData.status,
      appointmentData.notes
    );

    const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId);
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

router.put('/:id', (req: AuthRequest, res) => {
  try {
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    const fields = Object.keys(updates);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = [...fields.map(field => updates[field]), req.params.id, req.userId];

    const result = db.prepare(
      `UPDATE appointments SET ${setClause} WHERE id = ? AND user_id = ?`
    ).run(...values);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
    res.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

router.delete('/:id', (req: AuthRequest, res) => {
  try {
    const result = db.prepare('DELETE FROM appointments WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

export default router;
