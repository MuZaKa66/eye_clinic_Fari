import express from 'express';
import db from '../database';
import { authenticateToken } from '../middleware/auth';
import { logActivity } from '../middleware/activityLogger';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { patient_id, prescription_type } = req.query;

    let query = `
      SELECT p.*,
             pat.first_name || ' ' || pat.last_name as patient_name
      FROM prescriptions p
      LEFT JOIN patients pat ON p.patient_id = pat.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (patient_id) {
      query += ' AND p.patient_id = ?';
      params.push(patient_id);
    }

    if (prescription_type) {
      query += ' AND p.prescription_type = ?';
      params.push(prescription_type);
    }

    query += ' ORDER BY p.issued_date DESC';

    const prescriptions = db.prepare(query).all(...params);
    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = db.prepare(`
      SELECT p.*,
             pat.first_name || ' ' || pat.last_name as patient_name,
             pat.patient_id as patient_code
      FROM prescriptions p
      LEFT JOIN patients pat ON p.patient_id = pat.id
      WHERE p.id = ?
    `).get(id);

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    res.json(prescription);
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({ error: 'Failed to fetch prescription' });
  }
});

router.get('/patient/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const prescriptions = db.prepare(`
      SELECT p.*,
             pat.first_name || ' ' || pat.last_name as patient_name
      FROM prescriptions p
      LEFT JOIN patients pat ON p.patient_id = pat.id
      WHERE p.patient_id = ?
      ORDER BY p.issued_date DESC
    `).all(patientId);

    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

router.post('/', authenticateToken, logActivity('prescription', 'create'), async (req, res) => {
  try {
    const {
      patient_id,
      visit_id,
      prescription_type,
      od_sphere,
      od_cylinder,
      od_axis,
      od_add,
      os_sphere,
      os_cylinder,
      os_axis,
      os_add,
      pd,
      medication_name,
      dosage,
      frequency,
      duration,
      instructions,
      issued_date,
      expiry_date,
    } = req.body;

    if (!patient_id || !prescription_type || !issued_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = `RX-${Date.now()}`;

    const stmt = db.prepare(`
      INSERT INTO prescriptions (
        id, patient_id, visit_id, prescription_type,
        od_sphere, od_cylinder, od_axis, od_add,
        os_sphere, os_cylinder, os_axis, os_add, pd,
        medication_name, dosage, frequency, duration, instructions,
        issued_date, expiry_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id, patient_id, visit_id || null, prescription_type,
      od_sphere || null, od_cylinder || null, od_axis || null, od_add || null,
      os_sphere || null, os_cylinder || null, os_axis || null, os_add || null, pd || null,
      medication_name || null, dosage || null, frequency || null, duration || null, instructions || null,
      issued_date, expiry_date || null
    );

    const prescription = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(id);
    res.status(201).json(prescription);
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ error: 'Failed to create prescription' });
  }
});

router.put('/:id', authenticateToken, logActivity('prescription', 'update'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      prescription_type,
      od_sphere,
      od_cylinder,
      od_axis,
      od_add,
      os_sphere,
      os_cylinder,
      os_axis,
      os_add,
      pd,
      medication_name,
      dosage,
      frequency,
      duration,
      instructions,
      issued_date,
      expiry_date,
    } = req.body;

    const stmt = db.prepare(`
      UPDATE prescriptions SET
        prescription_type = ?,
        od_sphere = ?, od_cylinder = ?, od_axis = ?, od_add = ?,
        os_sphere = ?, os_cylinder = ?, os_axis = ?, os_add = ?, pd = ?,
        medication_name = ?, dosage = ?, frequency = ?, duration = ?, instructions = ?,
        issued_date = ?, expiry_date = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      prescription_type,
      od_sphere || null, od_cylinder || null, od_axis || null, od_add || null,
      os_sphere || null, os_cylinder || null, os_axis || null, os_add || null, pd || null,
      medication_name || null, dosage || null, frequency || null, duration || null, instructions || null,
      issued_date, expiry_date || null,
      id
    );

    const prescription = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(id);
    res.json(prescription);
  } catch (error) {
    console.error('Error updating prescription:', error);
    res.status(500).json({ error: 'Failed to update prescription' });
  }
});

router.delete('/:id', authenticateToken, logActivity('prescription', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare('DELETE FROM prescriptions WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    res.status(500).json({ error: 'Failed to delete prescription' });
  }
});

export default router;
