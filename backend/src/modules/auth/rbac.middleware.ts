/**
 * @file rbac.middleware.ts
 * @description Role-Based Access Control middleware.
 * Roles: super_admin > admin > editor > moderator > viewer
 */
import { Request, Response, NextFunction } from 'express';

export type AdminRole = 'super_admin' | 'admin' | 'editor' | 'moderator' | 'viewer';

const ROLE_HIERARCHY: Record<AdminRole, number> = {
  super_admin: 5,
  admin: 4,
  editor: 3,
  moderator: 2,
  viewer: 1,
};

/** Yêu cầu một trong các roles được liệt kê */
export function requireRole(...roles: AdminRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req.user?.role || '').toLowerCase() as AdminRole;

    // ADMIN (cũ) = admin role mới
    const mappedRole = userRole === 'admin' ? 'admin' : userRole;

    if (!roles.some(r => {
      // Cho phép role cao hơn pass qua
      return ROLE_HIERARCHY[mappedRole] >= ROLE_HIERARCHY[r];
    })) {
      res.status(403).json({
        success: false,
        error: `Yêu cầu quyền: ${roles.join(' hoặc ')}`,
      });
      return;
    }
    next();
  };
}

/** Chỉ super_admin */
export const requireSuperAdmin = requireRole('super_admin');

/** admin trở lên */
export const requireAdminRole = requireRole('admin');

/** editor trở lên */
export const requireEditorRole = requireRole('editor');

/** Bất kỳ authenticated admin */
export const requireViewerRole = requireRole('viewer');
