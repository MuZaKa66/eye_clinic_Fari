import express from 'express';
import { randomUUID } from 'crypto';
import db from '../database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', (req: AuthRequest, res) => {
  try {
    const { patient_id } = req.query;
    let query = `
      SELECT v.*, p.first_name, p.last_name
      FROM visits v
      LEFT JOIN patients p ON v.patient_id = p.id
      WHERE v.user_id = ?
    `;
    const params: any[] = [req.userId];

    if (patient_id) {
      query += ' AND v.patient_id = ?';
      params.push(patient_id);
    }

    query += ' ORDER BY v.visit_date DESC';

    const visits = db.prepare(query).all(...params);
    res.json(visits);
  } catch (error) {
    console.error('Error fetching visits:', error);
    res.status(500).json({ error: 'Failed to fetch visits' });
  }
});

router.get('/:id', (req: AuthRequest, res) => {
  try {
    const visit = db.prepare(`
      SELECT v.*, p.first_name, p.last_name
      FROM visits v
      LEFT JOIN patients p ON v.patient_id = p.id
      WHERE v.id = ? AND v.user_id = ?
    `).get(req.params.id, req.userId);

    if (!visit) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    res.json(visit);
  } catch (error) {
    console.error('Error fetching visit:', error);
    res.status(500).json({ error: 'Failed to fetch visit' });
  }
});

router.post('/', (req: AuthRequest, res) => {
  try {
    const visitId = randomUUID();
    const visitData = {
      id: visitId,
      user_id: req.userId,
      patient_id: req.body.patient_id,
      appointment_id: req.body.appointment_id || null,
      visit_date: req.body.visit_date,
      chief_complaint: req.body.chief_complaint || null,
      diagnosis: req.body.diagnosis || null,
      treatment_plan: req.body.treatment_plan || null,
      notes: req.body.notes || null,
      follow_up_date: req.body.follow_up_date || null
    };

    db.prepare(`
      INSERT INTO visits (id, user_id, patient_id, appointment_id, visit_date, chief_complaint, diagnosis, treatment_plan, notes, follow_up_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      visitData.id,
      visitData.user_id,
      visitData.patient_id,
      visitData.appointment_id,
      visitData.visit_date,
      visitData.chief_complaint,
      visitData.diagnosis,
      visitData.treatment_plan,
      visitData.notes,
      visitData.follow_up_date
    );

    const visit = db.prepare('SELECT * FROM visits WHERE id = ?').get(visitId);
    res.status(201).json(visit);
  } catch (error) {
    console.error('Error creating visit:', error);
    res.status(500).json({ error: 'Failed to create visit' });
  }
});

router.put('/:id', (req: AuthRequest, res) => {
  try {
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    const fields = Object.keys(updates);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = [...fields.map(field => updates[field]), req.params.id, req.userId];

    const result = db.prepare(
      `UPDATE visits SET ${setClause} WHERE id = ? AND user_id = ?`
    ).run(...values);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    const visit = db.prepare('SELECT * FROM visits WHERE id = ?').get(req.params.id);
    res.json(visit);
  } catch (error) {
    console.error('Error updating visit:', error);
    res.status(500).json({ error: 'Failed to update visit' });
  }
});

router.delete('/:id', (req: AuthRequest, res) => {
  try {
    const result = db.prepare('DELETE FROM visits WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    res.json({ message: 'Visit deleted successfully' });
  } catch (error) {
    console.error('Error deleting visit:', error);
    res.status(500).json({ error: 'Failed to delete visit' });
  }
});

export default router;
