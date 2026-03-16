import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

const rolePermissions = {
  admin: ['all'],
  doctor: ['patients:read', 'patients:write', 'visits:all', 'prescriptions:all', 'tests:all', 'appointments:all', 'billing:read'],
  receptionist: ['patients:read', 'patients:write', 'appointments:all', 'billing:read'],
  accountant: ['billing:all', 'patients:read', 'reports:financial']
};

export function checkPermission(requiredPermissions: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userRole = req.user.role as keyof typeof rolePermissions;
    const permissions = rolePermissions[userRole] || [];

    if (permissions.includes('all')) {
      return next();
    }

    const hasPermission = requiredPermissions.some(perm =>
      permissions.some(userPerm =>
        userPerm === perm || userPerm.startsWith(perm.split(':')[0] + ':all')
      )
    );

    if (!hasPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
}

export function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient role' });
    }

    next();
  };
}
