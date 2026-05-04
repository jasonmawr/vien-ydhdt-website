import { Router } from 'express';
import { getWebDb } from '../../shared/sqlite';
import { requireAdmin } from '../auth/auth.middleware';
import fs from 'fs';
import path from 'path';

export const cmsRouter = Router();

// Danh mục bài viết dùng chung toàn hệ thống (SSOT)
const POST_CATEGORIES = [
  'Y học cổ truyền',
  'Hoạt động Viện',
  'Sức khỏe & Dinh dưỡng',
  'Nghiên cứu khoa học',
  'Hướng dẫn bệnh nhân',
];

// GET /api/cms/categories — trả danh sách danh mục
cmsRouter.get('/categories', (_req, res) => {
  res.json({ success: true, data: POST_CATEGORIES });
});

// GET /api/cms/posts — Lấy danh sách bài viết
// Admin gửi ?admin=1 sẽ thấy cả draft, người dùng chỉ thấy published
cmsRouter.get('/posts', async (req, res) => {
  try {
    const { category, search, limit = 50, offset = 0, admin } = req.query;
    const db = await getWebDb();
    
    let query = `SELECT * FROM posts WHERE 1=1`;
    const params: any[] = [];

    // Nếu KHÔNG phải admin thì chỉ lấy published
    if (!admin) {
      query += ` AND status = 'published'`;
    }
    
    if (category && category !== 'Tất cả') {
      query += ` AND category = ?`;
      params.push(category);
    }
    
    if (search) {
      query += ` AND (title LIKE ? OR excerpt LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));
    
    const posts = await db.all(query, params);
    
    // Đếm tổng số bài để phân trang
    let countQuery = `SELECT COUNT(*) as total FROM posts WHERE 1=1`;
    const countParams: any[] = [];
    if (!admin) {
      countQuery += ` AND status = 'published'`;
    }
    if (category && category !== 'Tất cả') {
      countQuery += ` AND category = ?`;
      countParams.push(category);
    }
    if (search) {
      countQuery += ` AND (title LIKE ? OR excerpt LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
    }
    const { total } = await db.get(countQuery, countParams) || { total: 0 };
    
    res.json({ success: true, data: posts, pagination: { total, limit: Number(limit), offset: Number(offset) } });
  } catch (error) {
    console.error('[CMS] getPosts error:', error);
    res.status(500).json({ success: false, error: 'Lỗi lấy danh sách bài viết' });
  }
});

// GET /api/cms/posts/slug/:slug — Lấy chi tiết 1 bài viết theo Slug và tăng view_count
cmsRouter.get('/posts/slug/:slug', async (req, res) => {
  try {
    const db = await getWebDb();
    const post = await db.get('SELECT * FROM posts WHERE slug = ?', [req.params.slug]);
    if (!post) {
      res.status(404).json({ success: false, error: 'Bài viết không tồn tại' });
      return;
    }
    
    // Tăng lượt xem
    await db.run('UPDATE posts SET view_count = view_count + 1 WHERE id = ?', [post.id]);
    post.view_count += 1;
    
    res.json({ success: true, data: post });
  } catch (error) {
    console.error('[CMS] getPostBySlug error:', error);
    res.status(500).json({ success: false, error: 'Lỗi lấy bài viết theo slug' });
  }
});

// GET /api/cms/posts/:id — Lấy chi tiết 1 bài viết theo ID
cmsRouter.get('/posts/:id', async (req, res) => {
  try {
    const db = await getWebDb();
    const post = await db.get('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (!post) {
      res.status(404).json({ success: false, error: 'Bài viết không tồn tại' });
      return;
    }
    res.json({ success: true, data: post });
  } catch (error) {
    console.error('[CMS] getPostById error:', error);
    res.status(500).json({ success: false, error: 'Lỗi lấy bài viết' });
  }
});

// POST /api/cms/posts — Tạo bài viết mới
cmsRouter.post('/posts', requireAdmin, async (req, res) => {
  try {
    const { title, slug, category, excerpt, content, thumbnail, status = 'published' } = req.body;
    if (!title || !content) {
      res.status(400).json({ success: false, error: 'Thiếu tiêu đề hoặc nội dung' });
      return;
    }
    const db = await getWebDb();
    const finalSlug = slug || title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    
    const result = await db.run(
      `INSERT INTO posts (title, slug, category, excerpt, content, thumbnail, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, finalSlug, category || 'Y học cổ truyền', excerpt, content, thumbnail, status]
    );
    
    res.json({ success: true, data: { id: result.lastID, message: 'Đăng bài viết thành công' } });
  } catch (error) {
    console.error('[CMS] createPost error:', error);
    res.status(500).json({ success: false, error: 'Lỗi tạo bài viết' });
  }
});

// PUT /api/cms/posts/:id — Cập nhật bài viết
cmsRouter.put('/posts/:id', requireAdmin, async (req, res) => {
  try {
    const { title, slug, category, excerpt, content, thumbnail, status } = req.body;
    const db = await getWebDb();
    
    const existing = await db.get('SELECT id FROM posts WHERE id = ?', [req.params.id]);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Bài viết không tồn tại' });
      return;
    }
    
    await db.run(
      `UPDATE posts SET title=?, slug=?, category=?, excerpt=?, content=?, thumbnail=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
      [title, slug, category, excerpt, content, thumbnail, status, req.params.id]
    );
    
    res.json({ success: true, message: 'Cập nhật bài viết thành công' });
  } catch (error) {
    console.error('[CMS] updatePost error:', error);
    res.status(500).json({ success: false, error: 'Lỗi cập nhật bài viết' });
  }
});

// DELETE /api/cms/posts/:id — Xóa bài viết
cmsRouter.delete('/posts/:id', requireAdmin, async (req, res) => {
  try {
    const db = await getWebDb();
    const existing = await db.get('SELECT id FROM posts WHERE id = ?', [req.params.id]);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Bài viết không tồn tại' });
      return;
    }
    await db.run('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Đã xóa bài viết' });
  } catch (error) {
    console.error('[CMS] deletePost error:', error);
    res.status(500).json({ success: false, error: 'Lỗi xóa bài viết' });
  }
});

// GET /api/cms/doctors/:mabs
cmsRouter.get('/doctors/:mabs', async (req, res) => {
  try {
    const { mabs } = req.params;
    const db = await getWebDb();
    const doctor = await db.get("SELECT * FROM web_doctors WHERE mabs = ?", [mabs]);
    res.json({ success: true, data: doctor || null });
  } catch (err) {
    console.error("[Web Doctors] GET /:mabs error:", err);
    res.status(500).json({ success: false, error: "Lỗi máy chủ" });
  }
});

// POST /api/cms/doctors
cmsRouter.post('/doctors', requireAdmin, async (req, res) => {
  try {
    const db = await getWebDb();
    const { mabs, avatar_url, bio, experience_years, special_titles } = req.body;

    if (!mabs) {
      res.status(400).json({ success: false, error: "Thiếu mã bác sĩ" });
      return;
    }

    // Upsert
    await db.run(`
      INSERT INTO web_doctors (mabs, avatar_url, bio, experience_years, special_titles, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(mabs) DO UPDATE SET
        avatar_url=excluded.avatar_url,
        bio=excluded.bio,
        experience_years=excluded.experience_years,
        special_titles=excluded.special_titles,
        updated_at=CURRENT_TIMESTAMP
    `, [mabs, avatar_url || null, bio || null, experience_years || null, special_titles || null]);

    res.json({ success: true, message: "Cập nhật hồ sơ bác sĩ thành công" });
  } catch (err) {
    console.error("[Web Doctors] POST / error:", err);
    res.status(500).json({ success: false, error: "Lỗi máy chủ" });
  }
});

// GET /api/cms/logs
cmsRouter.get('/logs', requireAdmin, async (req, res) => {
  try {
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      res.json({ success: true, data: [] });
      return;
    }
    const files = fs.readdirSync(logDir).filter(f => f.endsWith('.log')).sort().reverse();
    const requestedFile = req.query.file ? String(req.query.file) : (files.length > 0 ? files[0] : null);
    
    let content = '';
    if (requestedFile && files.includes(requestedFile)) {
      content = fs.readFileSync(path.join(logDir, requestedFile), 'utf-8');
    }
    
    res.json({ success: true, data: { files, content, currentFile: requestedFile } });
  } catch (error) {
    console.error('[CMS] getLogs error:', error);
    res.status(500).json({ success: false, error: 'Lỗi lấy logs' });
  }
});
