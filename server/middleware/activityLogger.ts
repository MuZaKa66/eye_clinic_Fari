import { Request, Response, NextFunction } from 'express';
import db from '../database';
import { generateId } from '../utils/idGenerator';

export function logActivity(action: string, entityType: string, entityId?: string, changes?: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const userId = (req as any).user?.userId;
          if (!userId) return;

          const activityId = generateId();
          const ipAddress = req.ip || req.socket.remoteAddress || null;
          const userAgent = req.get('user-agent') || null;

          db.prepare(`
            INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, changes, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            activityId,
            userId,
            action,
            entityType,
            entityId || req.params.id || null,
            changes ? JSON.stringify(changes) : null,
            ipAddress,
            userAgent
          );
        } catch (error) {
          console.error('Error logging activity:', error);
        }
      }
    });
    next();
  };
}

export function extractChanges(req: Request, oldData?: any): any {
  const newData = req.body;

  if (!oldData) {
    return { created: newData };
  }

  const changes: any = {};

  for (const key in newData) {
    if (newData[key] !== oldData[key]) {
      changes[key] = {
        from: oldData[key],
        to: newData[key]
      };
    }
  }

  return Object.keys(changes).length > 0 ? changes : null;
}
