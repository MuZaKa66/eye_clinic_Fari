import express, { Request, Response } from 'express';
import db from '../database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', (req: Request, res: Response) => {
  try {
    const { q, type, limit } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const searchTerm = `%${q.trim()}%`;
    const resultLimit = limit ? parseInt(limit as string) : 10;
    const results: any = {
      patients: [],
      visits: [],
      appointments: [],
      prescriptions: []
    };

    if (!type || type === 'all' || type === 'patients') {
      results.patients = db.prepare(`
        SELECT
          id, patient_id, first_name, last_name, phone, email,
          date_of_birth, age, gender, registration_date
        FROM patients
        WHERE (first_name LIKE ? OR last_name LIKE ? OR patient_id LIKE ? OR phone LIKE ? OR email LIKE ?)
          AND is_active = 1
        ORDER BY registration_date DESC
        LIMIT ?
      `).all(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, resultLimit);
    }

    if (!type || type === 'all' || type === 'visits') {
      results.visits = db.prepare(`
        SELECT
          v.id, v.visit_number, v.visit_date, v.diagnosis, v.chief_complaint,
          p.first_name || ' ' || p.last_name as patient_name,
          p.patient_id,
          u.full_name as doctor_name
        FROM visits v
        LEFT JOIN patients p ON v.patient_id = p.id
        LEFT JOIN users u ON v.doctor_id = u.id
        WHERE (v.visit_number LIKE ? OR v.diagnosis LIKE ? OR v.chief_complaint LIKE ? OR p.first_name LIKE ? OR p.last_name LIKE ?)
        ORDER BY v.visit_date DESC
        LIMIT ?
      `).all(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, resultLimit);
    }

    if (!type || type === 'all' || type === 'appointments') {
      results.appointments = db.prepare(`
        SELECT
          a.id, a.appointment_number, a.appointment_date, a.appointment_time,
          a.status, a.appointment_type, a.reason,
          p.first_name || ' ' || p.last_name as patient_name,
          p.patient_id,
          u.full_name as doctor_name
        FROM appointments a
        LEFT JOIN patients p ON a.patient_id = p.id
        LEFT JOIN users u ON a.doctor_id = u.id
        WHERE (a.appointment_number LIKE ? OR p.first_name LIKE ? OR p.last_name LIKE ? OR a.reason LIKE ?)
        ORDER BY a.appointment_date DESC
        LIMIT ?
      `).all(searchTerm, searchTerm, searchTerm, searchTerm, resultLimit);
    }

    if (!type || type === 'all' || type === 'prescriptions') {
      results.prescriptions = db.prepare(`
        SELECT
          pr.id, pr.prescription_type, pr.issued_date, pr.medications,
          p.first_name || ' ' || p.last_name as patient_name,
          p.patient_id,
          v.visit_number
        FROM prescriptions pr
        LEFT JOIN patients p ON pr.patient_id = p.id
        LEFT JOIN visits v ON pr.visit_id = v.id
        WHERE (p.first_name LIKE ? OR p.last_name LIKE ? OR pr.medications LIKE ?)
        ORDER BY pr.issued_date DESC
        LIMIT ?
      `).all(searchTerm, searchTerm, searchTerm, resultLimit);
    }

    const totalResults =
      results.patients.length +
      results.visits.length +
      results.appointments.length +
      results.prescriptions.length;

    res.json({
      query: q,
      totalResults,
      results
    });
  } catch (error: any) {
    console.error('Error performing search:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/patients/filter', (req: Request, res: Response) => {
  try {
    const {
      name,
      patientId,
      ageMin,
      ageMax,
      gender,
      registrationDateFrom,
      registrationDateTo,
      hasActivePrescriptions,
      hasUpcomingAppointments,
      lastVisitDateFrom,
      lastVisitDateTo,
      diagnosis,
      city,
      limit,
      offset
    } = req.body;

    let query = `
      SELECT DISTINCT p.*
      FROM patients p
      WHERE p.is_active = 1
    `;
    const params: any[] = [];

    if (name) {
      query += ` AND (p.first_name LIKE ? OR p.last_name LIKE ?)`;
      const nameTerm = `%${name}%`;
      params.push(nameTerm, nameTerm);
    }

    if (patientId) {
      query += ` AND p.patient_id LIKE ?`;
      params.push(`%${patientId}%`);
    }

    if (ageMin !== undefined) {
      query += ` AND p.age >= ?`;
      params.push(ageMin);
    }

    if (ageMax !== undefined) {
      query += ` AND p.age <= ?`;
      params.push(ageMax);
    }

    if (gender && Array.isArray(gender) && gender.length > 0) {
      const placeholders = gender.map(() => '?').join(',');
      query += ` AND p.gender IN (${placeholders})`;
      params.push(...gender);
    }

    if (registrationDateFrom) {
      query += ` AND DATE(p.registration_date) >= DATE(?)`;
      params.push(registrationDateFrom);
    }

    if (registrationDateTo) {
      query += ` AND DATE(p.registration_date) <= DATE(?)`;
      params.push(registrationDateTo);
    }

    if (city) {
      query += ` AND p.city LIKE ?`;
      params.push(`%${city}%`);
    }

    if (hasActivePrescriptions !== undefined) {
      if (hasActivePrescriptions) {
        query += ` AND EXISTS (SELECT 1 FROM prescriptions WHERE patient_id = p.id)`;
      } else {
        query += ` AND NOT EXISTS (SELECT 1 FROM prescriptions WHERE patient_id = p.id)`;
      }
    }

    if (hasUpcomingAppointments !== undefined) {
      if (hasUpcomingAppointments) {
        query += ` AND EXISTS (SELECT 1 FROM appointments WHERE patient_id = p.id AND DATE(appointment_date) >= DATE('now') AND status NOT IN ('Cancelled', 'Completed'))`;
      } else {
        query += ` AND NOT EXISTS (SELECT 1 FROM appointments WHERE patient_id = p.id AND DATE(appointment_date) >= DATE('now') AND status NOT IN ('Cancelled', 'Completed'))`;
      }
    }

    if (lastVisitDateFrom || lastVisitDateTo) {
      if (lastVisitDateFrom && lastVisitDateTo) {
        query += ` AND p.id IN (SELECT patient_id FROM visits WHERE DATE(visit_date) BETWEEN DATE(?) AND DATE(?))`;
        params.push(lastVisitDateFrom, lastVisitDateTo);
      } else if (lastVisitDateFrom) {
        query += ` AND p.id IN (SELECT patient_id FROM visits WHERE DATE(visit_date) >= DATE(?))`;
        params.push(lastVisitDateFrom);
      } else if (lastVisitDateTo) {
        query += ` AND p.id IN (SELECT patient_id FROM visits WHERE DATE(visit_date) <= DATE(?))`;
        params.push(lastVisitDateTo);
      }
    }

    if (diagnosis && Array.isArray(diagnosis) && diagnosis.length > 0) {
      const diagnosisConditions = diagnosis.map(() => 'diagnosis LIKE ?').join(' OR ');
      query += ` AND p.id IN (SELECT patient_id FROM visits WHERE ${diagnosisConditions})`;
      params.push(...diagnosis.map((d: string) => `%${d}%`));
    }

    query += ` ORDER BY p.registration_date DESC`;

    if (limit) {
      query += ` LIMIT ?`;
      params.push(parseInt(limit));
    }

    if (offset) {
      query += ` OFFSET ?`;
      params.push(parseInt(offset));
    }

    const patients = db.prepare(query).all(...params);
    res.json(patients);
  } catch (error: any) {
    console.error('Error filtering patients:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/filter-presets', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { entityType } = req.query;

    let query = 'SELECT * FROM filter_presets WHERE user_id = ?';
    const params: any[] = [userId];

    if (entityType) {
      query += ' AND entity_type = ?';
      params.push(entityType);
    }

    query += ' ORDER BY is_default DESC, preset_name';

    const presets = db.prepare(query).all(...params);

    presets.forEach((preset: any) => {
      if (preset.filter_data) {
        try {
          preset.filters = JSON.parse(preset.filter_data);
        } catch (e) {
          preset.filters = {};
        }
      }
    });

    res.json(presets);
  } catch (error: any) {
    console.error('Error fetching filter presets:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/filter-presets', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { presetName, entityType, filterData, isDefault } = req.body;

    const { generateId } = require('../utils/idGenerator');
    const presetId = generateId();

    if (isDefault) {
      db.prepare(`
        UPDATE filter_presets
        SET is_default = 0
        WHERE user_id = ? AND entity_type = ?
      `).run(userId, entityType);
    }

    db.prepare(`
      INSERT INTO filter_presets (id, user_id, preset_name, entity_type, filter_data, is_default)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      presetId,
      userId,
      presetName,
      entityType,
      JSON.stringify(filterData),
      isDefault ? 1 : 0
    );

    const newPreset = db.prepare('SELECT * FROM filter_presets WHERE id = ?').get(presetId);
    res.status(201).json(newPreset);
  } catch (error: any) {
    console.error('Error creating filter preset:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/filter-presets/:id', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const result = db.prepare('DELETE FROM filter_presets WHERE id = ? AND user_id = ?').run(id, userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Filter preset not found' });
    }

    res.json({ message: 'Filter preset deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting filter preset:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
