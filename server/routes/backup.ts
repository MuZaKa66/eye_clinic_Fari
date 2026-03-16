import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

const router = express.Router();
const execAsync = promisify(exec);

// Backup directory
const BACKUP_DIR = path.join(process.cwd(), 'backups');
const DB_PATH = path.join(process.cwd(), 'server', 'clinic.db');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Get all backups
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const backups = files
      .filter(f => f.endsWith('.db') || f.endsWith('.tar.gz'))
      .map(file => {
        const stats = fs.statSync(path.join(BACKUP_DIR, file));
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          type: file.endsWith('.db') ? 'database' : 'files'
        };
      })
      .sort((a, b) => b.created.getTime() - a.created.getTime());

    res.json(backups);
  } catch (error: any) {
    console.error('Error listing backups:', error);
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

// Create manual backup
router.post('/create', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' +
                     new Date().toTimeString().split(' ')[0].replace(/:/g, '-');

    const dbBackupName = `clinic_${timestamp}.db`;
    const dbBackupPath = path.join(BACKUP_DIR, dbBackupName);

    // Copy database file
    fs.copyFileSync(DB_PATH, dbBackupPath);

    // Create uploads backup if directory exists and has files
    let uploadsBackupName = null;
    if (fs.existsSync(UPLOADS_DIR)) {
      const uploadsFiles = fs.readdirSync(UPLOADS_DIR, { recursive: true });
      if (uploadsFiles.length > 0) {
        uploadsBackupName = `uploads_${timestamp}.tar.gz`;
        const uploadsBackupPath = path.join(BACKUP_DIR, uploadsBackupName);

        try {
          // Create tar.gz of uploads directory
          await execAsync(`tar -czf "${uploadsBackupPath}" -C "${path.dirname(UPLOADS_DIR)}" "${path.basename(UPLOADS_DIR)}"`);
        } catch (tarError) {
          console.warn('Could not create uploads backup (tar not available):', tarError);
          // Continue without uploads backup
        }
      }
    }

    const dbStats = fs.statSync(dbBackupPath);

    res.json({
      success: true,
      message: 'Backup created successfully',
      backup: {
        database: {
          filename: dbBackupName,
          size: dbStats.size,
          created: dbStats.birthtime
        },
        uploads: uploadsBackupName ? {
          filename: uploadsBackupName,
          size: fs.statSync(path.join(BACKUP_DIR, uploadsBackupName)).size,
          created: fs.statSync(path.join(BACKUP_DIR, uploadsBackupName)).birthtime
        } : null
      }
    });
  } catch (error: any) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Failed to create backup: ' + error.message });
  }
});

// Download backup file
router.get('/download/:filename', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const { filename } = req.params;

    // Validate filename (prevent directory traversal)
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Backup file not found' });
    }

    res.download(filePath);
  } catch (error: any) {
    console.error('Error downloading backup:', error);
    res.status(500).json({ error: 'Failed to download backup' });
  }
});

// Delete backup file
router.delete('/:filename', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const { filename } = req.params;

    // Validate filename
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Backup file not found' });
    }

    fs.unlinkSync(filePath);

    res.json({ success: true, message: 'Backup deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting backup:', error);
    res.status(500).json({ error: 'Failed to delete backup' });
  }
});

// Get backup configuration
router.get('/config', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const configPath = path.join(BACKUP_DIR, 'config.json');

    let config = {
      autoBackupEnabled: false,
      autoBackupSchedule: 'daily',
      autoBackupTime: '02:00',
      retentionDays: 30,
      lastAutoBackup: null
    };

    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }

    res.json(config);
  } catch (error: any) {
    console.error('Error getting backup config:', error);
    res.status(500).json({ error: 'Failed to get backup configuration' });
  }
});

// Update backup configuration
router.post('/config', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const config = req.body;
    const configPath = path.join(BACKUP_DIR, 'config.json');

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    res.json({ success: true, message: 'Backup configuration updated' });
  } catch (error: any) {
    console.error('Error updating backup config:', error);
    res.status(500).json({ error: 'Failed to update backup configuration' });
  }
});

// Restore from backup (dangerous - requires confirmation)
router.post('/restore/:filename', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { filename } = req.params;
    const { confirmed } = req.body;

    if (!confirmed) {
      return res.status(400).json({ error: 'Restoration must be confirmed' });
    }

    // Validate filename
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    if (!filename.endsWith('.db')) {
      return res.status(400).json({ error: 'Can only restore database files' });
    }

    const backupPath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ error: 'Backup file not found' });
    }

    // Create a backup of current database before restoring
    const preRestoreBackup = `clinic_pre_restore_${Date.now()}.db`;
    fs.copyFileSync(DB_PATH, path.join(BACKUP_DIR, preRestoreBackup));

    // Restore the backup
    fs.copyFileSync(backupPath, DB_PATH);

    res.json({
      success: true,
      message: 'Database restored successfully. Please restart the application.',
      preRestoreBackup
    });
  } catch (error: any) {
    console.error('Error restoring backup:', error);
    res.status(500).json({ error: 'Failed to restore backup: ' + error.message });
  }
});

// Get backup statistics
router.get('/stats', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const backups = files.filter(f => f.endsWith('.db') || f.endsWith('.tar.gz'));

    const dbBackups = backups.filter(f => f.endsWith('.db'));
    const fileBackups = backups.filter(f => f.endsWith('.tar.gz'));

    const totalSize = backups.reduce((sum, file) => {
      const stats = fs.statSync(path.join(BACKUP_DIR, file));
      return sum + stats.size;
    }, 0);

    const latestBackup = backups
      .map(file => ({
        file,
        time: fs.statSync(path.join(BACKUP_DIR, file)).birthtime
      }))
      .sort((a, b) => b.time.getTime() - a.time.getTime())[0];

    res.json({
      totalBackups: backups.length,
      databaseBackups: dbBackups.length,
      fileBackups: fileBackups.length,
      totalSize,
      latestBackup: latestBackup ? {
        filename: latestBackup.file,
        created: latestBackup.time
      } : null,
      backupDirectory: BACKUP_DIR
    });
  } catch (error: any) {
    console.error('Error getting backup stats:', error);
    res.status(500).json({ error: 'Failed to get backup statistics' });
  }
});

export default router;
