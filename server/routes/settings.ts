import express, { Request, Response } from 'express';
import db from '../database';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { generateId } from '../utils/idGenerator';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

router.use(authenticateToken);

router.get('/', requireRole(['admin']), (req: Request, res: Response) => {
  try {
    const settings = db.prepare('SELECT * FROM system_settings ORDER BY setting_key').all();

    const settingsObj: any = {};
    settings.forEach((setting: any) => {
      settingsObj[setting.setting_key] = {
        value: setting.setting_value,
        description: setting.description,
        updatedAt: setting.updated_at
      };
    });

    res.json(settingsObj);
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:key', (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    const setting = db.prepare('SELECT * FROM system_settings WHERE setting_key = ?').get(key);

    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json(setting);
  } catch (error: any) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:key', requireRole(['admin']), (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    const existing = db.prepare('SELECT id FROM system_settings WHERE setting_key = ?').get(key) as any;

    if (existing) {
      db.prepare(`
        UPDATE system_settings
        SET setting_value = ?, description = COALESCE(?, description), updated_at = CURRENT_TIMESTAMP
        WHERE setting_key = ?
      `).run(value, description || null, key);
    } else {
      db.prepare(`
        INSERT INTO system_settings (id, setting_key, setting_value, description)
        VALUES (?, ?, ?, ?)
      `).run(generateId(), key, value, description || null);
    }

    const updated = db.prepare('SELECT * FROM system_settings WHERE setting_key = ?').get(key);
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/backup', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const backupDir = join(__dirname, '../../backups');

    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `clinic-db-${timestamp}.db`;
    const backupPath = join(backupDir, filename);

    db.backup(backupPath);

    const stats = await import('fs/promises').then(fs => fs.stat(backupPath));

    const backupId = generateId();
    db.prepare(`
      INSERT INTO backups (id, backup_filename, backup_path, backup_size, backup_type, created_by)
      VALUES (?, ?, ?, ?, 'manual', ?)
    `).run(backupId, filename, backupPath, stats.size, userId);

    res.json({
      message: 'Backup created successfully',
      filename,
      size: stats.size,
      path: backupPath
    });
  } catch (error: any) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/backups/list', requireRole(['admin']), (req: Request, res: Response) => {
  try {
    const backups = db.prepare(`
      SELECT b.*,
        u.full_name as created_by_name
      FROM backups b
      LEFT JOIN users u ON b.created_by = u.id
      ORDER BY b.created_at DESC
    `).all();

    res.json(backups);
  } catch (error: any) {
    console.error('Error fetching backups:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/import-services', requireRole(['admin']), (req: Request, res: Response) => {
  try {
    const { services } = req.body;

    if (!Array.isArray(services)) {
      return res.status(400).json({ error: 'Services must be an array' });
    }

    const insertService = db.prepare(`
      INSERT OR REPLACE INTO service_catalog (id, service_name, service_code, description, default_price, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    let imported = 0;
    for (const service of services) {
      const serviceId = service.id || generateId();
      insertService.run(
        serviceId,
        service.service_name,
        service.service_code || null,
        service.description || null,
        service.default_price || 0,
        service.category || 'General'
      );
      imported++;
    }

    res.json({
      message: `Successfully imported ${imported} services`,
      imported
    });
  } catch (error: any) {
    console.error('Error importing services:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
