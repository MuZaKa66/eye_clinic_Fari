import express, { Request, Response } from 'express';
import db from '../database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/patients/:patientId/prescription-history', authenticateToken, (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    const prescriptions = db.prepare(`
      SELECT p.*,
        v.visit_date,
        v.visit_number,
        u.full_name as doctor_name
      FROM prescriptions p
      LEFT JOIN visits v ON p.visit_id = v.id
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.patient_id = ?
        AND (p.prescription_type = 'spectacle' OR p.prescription_type = 'both')
      ORDER BY p.issued_date DESC
    `).all(patientId);

    res.json(prescriptions);
  } catch (error: any) {
    console.error('Error fetching prescription history:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/patients/:patientId/prescription-comparison', authenticateToken, (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const { limit } = req.query;

    const prescriptions = db.prepare(`
      SELECT p.*,
        v.visit_date,
        u.full_name as doctor_name
      FROM prescriptions p
      LEFT JOIN visits v ON p.visit_id = v.id
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.patient_id = ?
        AND (p.prescription_type = 'spectacle' OR p.prescription_type = 'both')
      ORDER BY p.issued_date DESC
      LIMIT ?
    `).all(patientId, limit ? parseInt(limit as string) : 10);

    const comparisons = [];
    for (let i = 0; i < prescriptions.length; i++) {
      const current: any = prescriptions[i];
      const previous: any = prescriptions[i + 1];

      const comparison: any = {
        date: current.issued_date,
        visitDate: current.visit_date,
        doctorName: current.doctor_name,
        od: {
          sphere: current.spectacle_od_sphere,
          cylinder: current.spectacle_od_cylinder,
          axis: current.spectacle_od_axis,
          add: current.spectacle_od_add
        },
        os: {
          sphere: current.spectacle_os_sphere,
          cylinder: current.spectacle_os_cylinder,
          axis: current.spectacle_os_axis,
          add: current.spectacle_os_add
        }
      };

      if (previous) {
        comparison.changes = {
          od: {
            sphere: (current.spectacle_od_sphere || 0) - (previous.spectacle_od_sphere || 0),
            cylinder: (current.spectacle_od_cylinder || 0) - (previous.spectacle_od_cylinder || 0),
            axis: (current.spectacle_od_axis || 0) - (previous.spectacle_od_axis || 0),
            add: (current.spectacle_od_add || 0) - (previous.spectacle_od_add || 0)
          },
          os: {
            sphere: (current.spectacle_os_sphere || 0) - (previous.spectacle_os_sphere || 0),
            cylinder: (current.spectacle_os_cylinder || 0) - (previous.spectacle_os_cylinder || 0),
            axis: (current.spectacle_os_axis || 0) - (previous.spectacle_os_axis || 0),
            add: (current.spectacle_os_add || 0) - (previous.spectacle_os_add || 0)
          }
        };

        const maxChange = Math.max(
          Math.abs(comparison.changes.od.sphere),
          Math.abs(comparison.changes.od.cylinder),
          Math.abs(comparison.changes.os.sphere),
          Math.abs(comparison.changes.os.cylinder)
        );

        if (maxChange > 0.5) {
          comparison.alert = 'Significant change detected';
        } else if (maxChange > 0) {
          comparison.trend = maxChange > 0 ? 'Increasing' : 'Stable';
        } else {
          comparison.trend = 'Stable';
        }
      }

      comparisons.push(comparison);
    }

    res.json(comparisons);
  } catch (error: any) {
    console.error('Error fetching prescription comparison:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/patients/:patientId/iop-history', authenticateToken, (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    const iopReadings = db.prepare(`
      SELECT e.*,
        v.visit_date,
        v.visit_time,
        v.visit_number,
        u.full_name as doctor_name
      FROM eye_examinations e
      LEFT JOIN visits v ON e.visit_id = v.id
      LEFT JOIN users u ON v.doctor_id = u.id
      WHERE e.patient_id = ?
        AND (e.od_iop IS NOT NULL OR e.os_iop IS NOT NULL)
      ORDER BY v.visit_date DESC, v.visit_time DESC
    `).all(patientId);

    const chartData = iopReadings.map((reading: any) => ({
      date: reading.visit_date,
      time: reading.visit_time,
      visitNumber: reading.visit_number,
      odIOP: reading.od_iop,
      osIOP: reading.os_iop,
      doctorName: reading.doctor_name,
      alert: (reading.od_iop > 21 || reading.os_iop > 21) ? 'High IOP' : null,
      status: (reading.od_iop > 24 || reading.os_iop > 24) ? 'Critical' :
              (reading.od_iop > 21 || reading.os_iop > 21) ? 'Borderline' : 'Normal'
    }));

    res.json(chartData);
  } catch (error: any) {
    console.error('Error fetching IOP history:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/patients/:patientId/vision-history', authenticateToken, (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    const visionReadings = db.prepare(`
      SELECT e.*,
        v.visit_date,
        v.visit_number,
        u.full_name as doctor_name
      FROM eye_examinations e
      LEFT JOIN visits v ON e.visit_id = v.id
      LEFT JOIN users u ON v.doctor_id = u.id
      WHERE e.patient_id = ?
        AND (e.od_vision_distance IS NOT NULL OR e.os_vision_distance IS NOT NULL)
      ORDER BY v.visit_date DESC
    `).all(patientId);

    const visionToDecimal = (vision: string): number => {
      if (!vision) return 0;
      const match = vision.match(/6\/(\d+)/);
      if (match) {
        return 6 / parseFloat(match[1]);
      }
      return 0;
    };

    const chartData = visionReadings.map((reading: any) => ({
      date: reading.visit_date,
      visitNumber: reading.visit_number,
      odDistance: reading.od_vision_distance,
      osDistance: reading.os_vision_distance,
      odNear: reading.od_vision_near,
      osNear: reading.os_vision_near,
      odDistanceDecimal: visionToDecimal(reading.od_vision_distance),
      osDistanceDecimal: visionToDecimal(reading.os_vision_distance),
      doctorName: reading.doctor_name
    }));

    res.json(chartData);
  } catch (error: any) {
    console.error('Error fetching vision history:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
