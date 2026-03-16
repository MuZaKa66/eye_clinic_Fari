import express from 'express';
import { randomUUID } from 'crypto';
import db from '../database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', (req: AuthRequest, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM patients WHERE user_id = ?';
    const params: any[] = [req.userId];

    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY created_at DESC';

    const patients = db.prepare(query).all(...params);
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

router.get('/:id', (req: AuthRequest, res) => {
  try {
    const patient = db.prepare('SELECT * FROM patients WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.userId);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

router.post('/', (req: AuthRequest, res) => {
  try {
    const patientId = randomUUID();
    const patientData = { ...req.body, id: patientId, user_id: req.userId };

    const fields = Object.keys(patientData);
    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map(field => patientData[field]);

    db.prepare(
      `INSERT INTO patients (${fields.join(', ')}) VALUES (${placeholders})`
    ).run(...values);

    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);
    res.status(201).json(patient);
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

router.put('/:id', (req: AuthRequest, res) => {
  try {
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    const fields = Object.keys(updates);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = [...fields.map(field => updates[field]), req.params.id, req.userId];

    const result = db.prepare(
      `UPDATE patients SET ${setClause} WHERE id = ? AND user_id = ?`
    ).run(...values);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
    res.json(patient);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

router.delete('/:id', (req: AuthRequest, res) => {
  try {
    const result = db.prepare('DELETE FROM patients WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

export default router;
