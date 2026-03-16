import express from 'express';
import fs from 'fs';
import path from 'path';
import { authenticateToken } from '../middleware/auth';
import { logActivity } from '../middleware/activityLogger';
import { db } from '../database';

const router = express.Router();

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-z0-9._-]/gi, '_').toLowerCase();
};

router.post('/prescription', authenticateToken, logActivity('upload', 'create'), async (req, res) => {
  try {
    const { prescriptionId, file, filename } = req.body;

    if (!prescriptionId || !file || !filename) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sanitizedFilename = sanitizeFilename(filename);
    const finalFilename = `prescription-${prescriptionId}-${Date.now()}-${sanitizedFilename}`;
    const filePath = path.join(UPLOADS_DIR, finalFilename);

    const base64Data = file.replace(/^data:.*;base64,/, '');
    fs.writeFileSync(filePath, base64Data, 'base64');

    const stmt = db.prepare('UPDATE prescriptions SET prescription_image_path = ? WHERE id = ?');
    stmt.run(finalFilename, prescriptionId);

    res.json({ filename: finalFilename, path: `/uploads/${finalFilename}` });
  } catch (error) {
    console.error('Error uploading prescription file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

router.post('/test-report', authenticateToken, logActivity('upload', 'create'), async (req, res) => {
  try {
    const { visitId, file, filename } = req.body;

    if (!visitId || !file || !filename) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sanitizedFilename = sanitizeFilename(filename);
    const finalFilename = `test-report-${visitId}-${Date.now()}-${sanitizedFilename}`;
    const filePath = path.join(UPLOADS_DIR, finalFilename);

    const base64Data = file.replace(/^data:.*;base64,/, '');
    fs.writeFileSync(filePath, base64Data, 'base64');

    res.json({ filename: finalFilename, path: `/uploads/${finalFilename}` });
  } catch (error) {
    console.error('Error uploading test report:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

router.get('/:filename', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const sanitizedFilename = sanitizeFilename(filename);
    const filePath = path.join(UPLOADS_DIR, sanitizedFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(500).json({ error: 'Failed to retrieve file' });
  }
});

router.get('/prescription/:prescriptionId', authenticateToken, async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const prescription = db.prepare('SELECT prescription_image_path FROM prescriptions WHERE id = ?').get(prescriptionId);

    if (!prescription || !prescription.prescription_image_path) {
      return res.status(404).json({ error: 'No file found for this prescription' });
    }

    const filePath = path.join(UPLOADS_DIR, prescription.prescription_image_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Error retrieving prescription file:', error);
    res.status(500).json({ error: 'Failed to retrieve file' });
  }
});

router.get('/test-reports/:visitId', authenticateToken, async (req, res) => {
  try {
    const { visitId } = req.params;
    const files = fs.readdirSync(UPLOADS_DIR)
      .filter(f => f.startsWith(`test-report-${visitId}-`))
      .map(f => ({
        filename: f,
        path: `/uploads/${f}`,
        uploadDate: fs.statSync(path.join(UPLOADS_DIR, f)).mtime
      }));

    res.json(files);
  } catch (error) {
    console.error('Error retrieving test reports:', error);
    res.status(500).json({ error: 'Failed to retrieve files' });
  }
});

router.delete('/:filename', authenticateToken, logActivity('upload', 'delete'), async (req, res) => {
  try {
    const { filename } = req.params;
    const sanitizedFilename = sanitizeFilename(filename);
    const filePath = path.join(UPLOADS_DIR, sanitizedFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    fs.unlinkSync(filePath);

    db.prepare('UPDATE prescriptions SET prescription_image_path = NULL WHERE prescription_image_path = ?').run(sanitizedFilename);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;
