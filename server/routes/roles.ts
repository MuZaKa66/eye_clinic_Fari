import express, { Request, Response } from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { checkRole } from '../middleware/rbac.js';
import { generateId } from '../utils/idGenerator.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', checkRole(['admin']), (req: Request, res: Response) => {
  try {
    const roles = db.prepare('SELECT * FROM roles ORDER BY is_system_role DESC, role_name').all();

    roles.forEach((role: any) => {
      if (role.permissions) {
        try {
          role.permissions = JSON.parse(role.permissions);
        } catch (e) {
          role.permissions = {};
        }
      }
    });

    res.json(roles);
  } catch (error: any) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', checkRole(['admin']), (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(id) as any;

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    if (role.permissions) {
      try {
        role.permissions = JSON.parse(role.permissions);
      } catch (e) {
        role.permissions = {};
      }
    }

    const userCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get(role.role_name) as any;
    role.userCount = userCount.count;

    res.json(role);
  } catch (error: any) {
    console.error('Error fetching role:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', checkRole(['admin']), (req: Request, res: Response) => {
  try {
    const { roleName, description, permissions } = req.body;

    const existingRole = db.prepare('SELECT id FROM roles WHERE role_name = ?').get(roleName);
    if (existingRole) {
      return res.status(400).json({ error: 'Role name already exists' });
    }

    const roleId = generateId();

    db.prepare(`
      INSERT INTO roles (id, role_name, description, permissions, is_system_role)
      VALUES (?, ?, ?, ?, 0)
    `).run(
      roleId,
      roleName,
      description || null,
      JSON.stringify(permissions || {})
    );

    const newRole = db.prepare('SELECT * FROM roles WHERE id = ?').get(roleId);
    res.status(201).json(newRole);
  } catch (error: any) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', checkRole(['admin']), (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { description, permissions } = req.body;

    const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(id) as any;

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    if (role.is_system_role) {
      return res.status(403).json({ error: 'Cannot modify system roles' });
    }

    db.prepare(`
      UPDATE roles
      SET description = ?, permissions = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      description || role.description,
      JSON.stringify(permissions || {}),
      id
    );

    const updatedRole = db.prepare('SELECT * FROM roles WHERE id = ?').get(id);
    res.json(updatedRole);
  } catch (error: any) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', checkRole(['admin']), (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(id) as any;

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    if (role.is_system_role) {
      return res.status(403).json({ error: 'Cannot delete system roles' });
    }

    const userCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get(role.role_name) as any;

    if (userCount.count > 0) {
      return res.status(400).json({ error: `Cannot delete role. ${userCount.count} user(s) are assigned to this role.` });
    }

    db.prepare('DELETE FROM roles WHERE id = ?').run(id);

    res.json({ message: 'Role deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:roleId/permissions', checkRole(['admin']), (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;

    const role = db.prepare('SELECT permissions FROM roles WHERE id = ?').get(roleId) as any;

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    let permissions = {};
    if (role.permissions) {
      try {
        permissions = JSON.parse(role.permissions);
      } catch (e) {
        permissions = {};
      }
    }

    res.json(permissions);
  } catch (error: any) {
    console.error('Error fetching role permissions:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:roleId/permissions', checkRole(['admin']), (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;
    const { permissions } = req.body;

    const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(roleId) as any;

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    if (role.is_system_role) {
      return res.status(403).json({ error: 'Cannot modify permissions for system roles' });
    }

    db.prepare(`
      UPDATE roles
      SET permissions = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(JSON.stringify(permissions), roleId);

    res.json({ message: 'Permissions updated successfully', permissions });
  } catch (error: any) {
    console.error('Error updating role permissions:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
