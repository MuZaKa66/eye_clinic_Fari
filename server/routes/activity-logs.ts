import express, { Request, Response } from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { checkRole } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticateToken);
router.use(checkRole(['admin']));

router.get('/', (req: Request, res: Response) => {
  try {
    const { userId, action, entityType, dateFrom, dateTo, limit, offset } = req.query;

    let query = `
      SELECT al.*,
        u.full_name as user_name,
        u.role as user_role
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (userId) {
      query += ' AND al.user_id = ?';
      params.push(userId);
    }

    if (action) {
      query += ' AND al.action = ?';
      params.push(action);
    }

    if (entityType) {
      query += ' AND al.entity_type = ?';
      params.push(entityType);
    }

    if (dateFrom) {
      query += ' AND DATE(al.created_at) >= DATE(?)';
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ' AND DATE(al.created_at) <= DATE(?)';
      params.push(dateTo);
    }

    query += ' ORDER BY al.created_at DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit as string));
    }

    if (offset) {
      query += ' OFFSET ?';
      params.push(parseInt(offset as string));
    }

    const logs = db.prepare(query).all(...params);

    logs.forEach((log: any) => {
      if (log.changes) {
        try {
          log.changes = JSON.parse(log.changes);
        } catch (e) {
          log.changes = null;
        }
      }
    });

    res.json(logs);
  } catch (error: any) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/summary', (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;

    let dateFilter = '';
    const params: any[] = [];

    if (dateFrom && dateTo) {
      dateFilter = ' AND DATE(created_at) BETWEEN DATE(?) AND DATE(?)';
      params.push(dateFrom, dateTo);
    } else if (dateFrom) {
      dateFilter = ' AND DATE(created_at) >= DATE(?)';
      params.push(dateFrom);
    } else if (dateTo) {
      dateFilter = ' AND DATE(created_at) <= DATE(?)';
      params.push(dateTo);
    }

    const totalLogs = db.prepare(`SELECT COUNT(*) as count FROM activity_logs WHERE 1=1 ${dateFilter}`).get(...params) as any;

    const byAction = db.prepare(`
      SELECT action, COUNT(*) as count
      FROM activity_logs
      WHERE 1=1 ${dateFilter}
      GROUP BY action
      ORDER BY count DESC
    `).all(...params);

    const byUser = db.prepare(`
      SELECT
        al.user_id,
        u.full_name,
        COUNT(*) as count
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1 ${dateFilter}
      GROUP BY al.user_id
      ORDER BY count DESC
      LIMIT 10
    `).all(...params);

    const byEntityType = db.prepare(`
      SELECT entity_type, COUNT(*) as count
      FROM activity_logs
      WHERE 1=1 ${dateFilter}
      GROUP BY entity_type
      ORDER BY count DESC
    `).all(...params);

    const recentActivity = db.prepare(`
      SELECT
        al.*,
        u.full_name as user_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1 ${dateFilter}
      ORDER BY al.created_at DESC
      LIMIT 20
    `).all(...params);

    res.json({
      totalLogs: totalLogs.count,
      byAction,
      byUser,
      byEntityType,
      recentActivity
    });
  } catch (error: any) {
    console.error('Error fetching activity log summary:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
