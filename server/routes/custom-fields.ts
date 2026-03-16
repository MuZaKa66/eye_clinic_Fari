import express, { Request, Response } from 'express';
import db from '../database';
import { authenticateToken } from '../middleware/auth';
import { generateId } from '../utils/idGenerator';
import { checkRole } from '../middleware/rbac';

const router = express.Router();

router.get('/definitions', authenticateToken, (req: Request, res: Response) => {
  try {
    const { entityType, activeOnly } = req.query;

    let query = 'SELECT * FROM custom_field_definitions WHERE 1=1';
    const params: any[] = [];

    if (entityType) {
      query += ' AND entity_type = ?';
      params.push(entityType);
    }

    if (activeOnly === 'true') {
      query += ' AND is_active = 1';
    }

    query += ' ORDER BY sort_order, field_name';

    const fields = db.prepare(query).all(...params);

    fields.forEach((field: any) => {
      if (field.field_options) {
        try {
          field.options = JSON.parse(field.field_options);
        } catch (e) {
          field.options = [];
        }
      }
    });

    res.json(fields);
  } catch (error: any) {
    console.error('Error fetching custom field definitions:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/definitions/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const field = db.prepare('SELECT * FROM custom_field_definitions WHERE id = ?').get(id) as any;

    if (!field) {
      return res.status(404).json({ error: 'Custom field not found' });
    }

    if (field.field_options) {
      try {
        field.options = JSON.parse(field.field_options);
      } catch (e) {
        field.options = [];
      }
    }

    res.json(field);
  } catch (error: any) {
    console.error('Error fetching custom field:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/definitions', authenticateToken, checkRole(['admin']), (req: Request, res: Response) => {
  try {
    const {
      fieldName,
      entityType,
      dataType,
      fieldOptions,
      isRequired,
      showInReports,
      isResearchField,
      helpText,
      sortOrder
    } = req.body;

    const userId = (req as any).user.userId;
    const fieldId = generateId();

    const optionsJson = fieldOptions ? JSON.stringify(fieldOptions) : null;

    db.prepare(`
      INSERT INTO custom_field_definitions (
        id, field_name, entity_type, data_type, field_options,
        is_required, show_in_reports, is_research_field, help_text,
        sort_order, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      fieldId,
      fieldName,
      entityType,
      dataType,
      optionsJson,
      isRequired ? 1 : 0,
      showInReports ? 1 : 0,
      isResearchField ? 1 : 0,
      helpText || null,
      sortOrder || 0,
      userId
    );

    const newField = db.prepare('SELECT * FROM custom_field_definitions WHERE id = ?').get(fieldId);
    res.status(201).json(newField);
  } catch (error: any) {
    console.error('Error creating custom field:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/definitions/:id', authenticateToken, checkRole(['admin']), (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      fieldName,
      dataType,
      fieldOptions,
      isRequired,
      showInReports,
      isResearchField,
      helpText,
      sortOrder,
      isActive
    } = req.body;

    const optionsJson = fieldOptions ? JSON.stringify(fieldOptions) : null;

    const result = db.prepare(`
      UPDATE custom_field_definitions
      SET field_name = ?,
          data_type = ?,
          field_options = ?,
          is_required = ?,
          show_in_reports = ?,
          is_research_field = ?,
          help_text = ?,
          sort_order = ?,
          is_active = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      fieldName,
      dataType,
      optionsJson,
      isRequired ? 1 : 0,
      showInReports ? 1 : 0,
      isResearchField ? 1 : 0,
      helpText || null,
      sortOrder || 0,
      isActive !== undefined ? (isActive ? 1 : 0) : 1,
      id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Custom field not found' });
    }

    const updatedField = db.prepare('SELECT * FROM custom_field_definitions WHERE id = ?').get(id);
    res.json(updatedField);
  } catch (error: any) {
    console.error('Error updating custom field:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/definitions/:id', authenticateToken, checkRole(['admin']), (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const valuesCount = db.prepare(
      'SELECT COUNT(*) as count FROM custom_field_values WHERE field_id = ?'
    ).get(id) as any;

    if (valuesCount.count > 0) {
      return res.status(400).json({
        error: 'Cannot delete custom field with existing values',
        valuesCount: valuesCount.count
      });
    }

    const result = db.prepare('DELETE FROM custom_field_definitions WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Custom field not found' });
    }

    res.json({ message: 'Custom field deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting custom field:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/values/:entityType/:entityId', authenticateToken, (req: Request, res: Response) => {
  try {
    const { entityType, entityId } = req.params;

    const values = db.prepare(`
      SELECT cfv.*,
        cfd.field_name,
        cfd.data_type,
        cfd.help_text
      FROM custom_field_values cfv
      LEFT JOIN custom_field_definitions cfd ON cfv.field_id = cfd.id
      WHERE cfv.entity_type = ? AND cfv.entity_id = ?
    `).all(entityType, entityId);

    res.json(values);
  } catch (error: any) {
    console.error('Error fetching custom field values:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/values', authenticateToken, (req: Request, res: Response) => {
  try {
    const { fieldId, entityType, entityId, fieldValue } = req.body;

    const existing = db.prepare(`
      SELECT id FROM custom_field_values
      WHERE field_id = ? AND entity_type = ? AND entity_id = ?
    `).get(fieldId, entityType, entityId) as any;

    if (existing) {
      db.prepare(`
        UPDATE custom_field_values
        SET field_value = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(fieldValue, existing.id);

      const updatedValue = db.prepare('SELECT * FROM custom_field_values WHERE id = ?').get(existing.id);
      return res.json(updatedValue);
    }

    const valueId = generateId();

    db.prepare(`
      INSERT INTO custom_field_values (
        id, field_id, entity_type, entity_id, field_value
      ) VALUES (?, ?, ?, ?, ?)
    `).run(valueId, fieldId, entityType, entityId, fieldValue);

    const newValue = db.prepare('SELECT * FROM custom_field_values WHERE id = ?').get(valueId);
    res.status(201).json(newValue);
  } catch (error: any) {
    console.error('Error saving custom field value:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/values/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fieldValue } = req.body;

    const result = db.prepare(`
      UPDATE custom_field_values
      SET field_value = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(fieldValue, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Custom field value not found' });
    }

    const updatedValue = db.prepare('SELECT * FROM custom_field_values WHERE id = ?').get(id);
    res.json(updatedValue);
  } catch (error: any) {
    console.error('Error updating custom field value:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/values/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM custom_field_values WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Custom field value not found' });
    }

    res.json({ message: 'Custom field value deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting custom field value:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
