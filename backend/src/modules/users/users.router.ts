/**
 * @file users.router.ts
 * @description Admin user management (CRUD for WEB_USERS in Oracle).
 * Base path: /api/users
 */
import { Router, type Request, type Response } from 'express';
import { requireAdmin, requireMinRole } from '../auth/auth.middleware';

const requireSuperAdmin = requireMinRole('SUPER_ADMIN');
import { getConnection } from '../../shared/database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../shared/logger';

const router = Router();

// GET /api/users — list all admin users
router.get('/', requireAdmin, async (_req: Request, res: Response) => {
  const conn = await getConnection();
  try {
    const result = await conn.execute<any>(
      `SELECT ID, USERNAME, ROLE, CREATED_AT FROM WEB_USERS ORDER BY CREATED_AT DESC`
    );
    const users = (result.rows || []).map((r: any) => ({
      id: r.ID,
      username: r.USERNAME,
      role: r.ROLE,
      createdAt: r.CREATED_AT,
    }));
    res.json({ success: true, data: users });
  } catch (err) {
    logger.error(`[Users] GET / error: ${err}`);
    res.status(500).json({ success: false, error: 'Lỗi lấy danh sách người dùng' });
  } finally {
    await conn.close();
  }
});

// POST /api/users — create admin user
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  const { username, password, role = 'EDITOR' } = req.body;
  if (!username || !password) {
    res.status(400).json({ success: false, error: 'Thiếu username hoặc password' });
    return;
  }
  const validRoles = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'MODERATOR', 'VIEWER'];
  if (!validRoles.includes(role.toUpperCase())) {
    res.status(400).json({ success: false, error: 'Role không hợp lệ' });
    return;
  }

  const conn = await getConnection();
  try {
    const existing = await conn.execute<any>(
      `SELECT ID FROM WEB_USERS WHERE USERNAME = :u`, { u: username }
    );
    if (existing.rows && existing.rows.length > 0) {
      res.status(409).json({ success: false, error: 'Username đã tồn tại' });
      return;
    }

    const hash = await bcrypt.hash(password, 10);
    await conn.execute(
      `INSERT INTO WEB_USERS (ID, USERNAME, PASSWORD_HASH, ROLE) VALUES (:id, :u, :h, :r)`,
      { id: uuidv4(), u: username, h: hash, r: role.toUpperCase() },
      { autoCommit: true }
    );
    logger.info(`[Users] Created user: ${username} (${role})`);
    res.json({ success: true, message: 'Tạo người dùng thành công' });
  } catch (err) {
    logger.error(`[Users] POST / error: ${err}`);
    res.status(500).json({ success: false, error: 'Lỗi tạo người dùng' });
  } finally {
    await conn.close();
  }
});

// PUT /api/users/:id — update role or password
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  const { role, password } = req.body;
  const conn = await getConnection();
  try {
    if (role) {
      const validRoles = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'MODERATOR', 'VIEWER'];
      if (!validRoles.includes(role.toUpperCase())) {
        res.status(400).json({ success: false, error: 'Role không hợp lệ' });
        return;
      }
      await conn.execute(
        `UPDATE WEB_USERS SET ROLE = :r WHERE ID = :id`,
        { r: role.toUpperCase(), id: req.params.id },
        { autoCommit: true }
      );
    }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await conn.execute(
        `UPDATE WEB_USERS SET PASSWORD_HASH = :h WHERE ID = :id`,
        { h: hash, id: req.params.id },
        { autoCommit: true }
      );
    }
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (err) {
    logger.error(`[Users] PUT /:id error: ${err}`);
    res.status(500).json({ success: false, error: 'Lỗi cập nhật người dùng' });
  } finally {
    await conn.close();
  }
});

// DELETE /api/users/:id
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  const conn = await getConnection();
  try {
    await conn.execute(
      `DELETE FROM WEB_USERS WHERE ID = :id`,
      { id: req.params.id },
      { autoCommit: true }
    );
    res.json({ success: true, message: 'Đã xóa người dùng' });
  } catch (err) {
    logger.error(`[Users] DELETE /:id error: ${err}`);
    res.status(500).json({ success: false, error: 'Lỗi xóa người dùng' });
  } finally {
    await conn.close();
  }
});

export default router;
