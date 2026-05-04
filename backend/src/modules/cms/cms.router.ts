import { Router } from 'express';
import { getWebDb } from '../../shared/sqlite';
import { requireAdmin } from '../auth/auth.middleware';
import fs from 'fs';
import path from 'path';

export const cmsRouter = Router();

// ==========================================
// CATEGORIES (TAXONOMY)
// ==========================================

// GET /api/cms/categories
cmsRouter.get('/categories', async (_req, res) => {
  try {
    const db = await getWebDb();
    const categories = await db.all('SELECT * FROM post_categories ORDER BY display_order ASC, name ASC');
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('[CMS] getCategories error:', error);
    res.status(500).json({ success: false, error: 'Lỗi lấy danh sách danh mục' });
  }
});

// POST /api/cms/categories
cmsRouter.post('/categories', requireAdmin, async (req, res) => {
  try {
    const { name, slug, parent_id, description, display_order } = req.body;
    if (!name || !slug) return res.status(400).json({ success: false, error: 'Tên và Slug là bắt buộc' });
    
    const db = await getWebDb();
    const result = await db.run(
      `INSERT INTO post_categories (name, slug, parent_id, description, display_order) VALUES (?, ?, ?, ?, ?)`,
      [name, slug, parent_id || null, description, display_order || 0]
    );
    res.json({ success: true, data: { id: result.lastID, message: 'Đã tạo danh mục' } });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE')) {
      return res.status(400).json({ success: false, error: 'Slug đã tồn tại' });
    }
    console.error('[CMS] createCategory error:', error);
    res.status(500).json({ success: false, error: 'Lỗi tạo danh mục' });
  }
});

// PUT /api/cms/categories/:id
cmsRouter.put('/categories/:id', requireAdmin, async (req, res) => {
  try {
    const { name, slug, parent_id, description, display_order } = req.body;
    const db = await getWebDb();
    await db.run(
      `UPDATE post_categories SET name=?, slug=?, parent_id=?, description=?, display_order=? WHERE id=?`,
      [name, slug, parent_id || null, description, display_order || 0, req.params.id]
    );
    res.json({ success: true, message: 'Cập nhật danh mục thành công' });
  } catch (error) {
    console.error('[CMS] updateCategory error:', error);
    res.status(500).json({ success: false, error: 'Lỗi cập nhật danh mục' });
  }
});

// DELETE /api/cms/categories/:id
cmsRouter.delete('/categories/:id', requireAdmin, async (req, res) => {
  try {
    const db = await getWebDb();
    // Chuyển bài viết sang category NULL
    await db.run('UPDATE posts SET category_id = NULL WHERE category_id = ?', [req.params.id]);
    await db.run('DELETE FROM post_categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Đã xóa danh mục' });
  } catch (error) {
    console.error('[CMS] deleteCategory error:', error);
    res.status(500).json({ success: false, error: 'Lỗi xóa danh mục' });
  }
});

// ==========================================
// POSTS
// ==========================================

// GET /api/cms/posts
cmsRouter.get('/posts', async (req, res) => {
  try {
    const { category_slug, search, limit = 50, offset = 0, admin, featured } = req.query;
    const db = await getWebDb();
    
    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug_name 
      FROM posts p 
      LEFT JOIN post_categories c ON p.category_id = c.id 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (!admin) {
      query += ` AND p.status = 'published'`;
      query += ` AND (p.published_at IS NULL OR p.published_at <= CURRENT_TIMESTAMP)`;
    }
    
    if (category_slug) {
      query += ` AND c.slug = ?`;
      params.push(category_slug);
    }
    
    if (featured === 'true') {
      query += ` AND p.is_featured = 1`;
    }

    if (search) {
      query += ` AND (p.title LIKE ? OR p.excerpt LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ` ORDER BY COALESCE(p.published_at, p.created_at) DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));
    
    const posts = await db.all(query, params);
    
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM posts p 
      LEFT JOIN post_categories c ON p.category_id = c.id 
      WHERE 1=1
    `;
    const countParams: any[] = [];
    if (!admin) {
      countQuery += ` AND p.status = 'published'`;
      countQuery += ` AND (p.published_at IS NULL OR p.published_at <= CURRENT_TIMESTAMP)`;
    }
    if (category_slug) {
      countQuery += ` AND c.slug = ?`;
      countParams.push(category_slug);
    }
    if (featured === 'true') {
      countQuery += ` AND p.is_featured = 1`;
    }
    if (search) {
      countQuery += ` AND (p.title LIKE ? OR p.excerpt LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
    }
    const { total } = await db.get(countQuery, countParams) || { total: 0 };
    
    res.json({ success: true, data: posts, pagination: { total, limit: Number(limit), offset: Number(offset) } });
  } catch (error) {
    console.error('[CMS] getPosts error:', error);
    res.status(500).json({ success: false, error: 'Lỗi lấy danh sách bài viết' });
  }
});

// Helper lấy attachments
async function getPostAttachments(db: any, postId: number) {
  return await db.all('SELECT * FROM post_attachments WHERE post_id = ?', [postId]);
}

// GET /api/cms/posts/slug/:slug
cmsRouter.get('/posts/slug/:slug', async (req, res) => {
  try {
    const db = await getWebDb();
    const post = await db.get(`
      SELECT p.*, c.name as category_name, c.slug as category_slug_name 
      FROM posts p 
      LEFT JOIN post_categories c ON p.category_id = c.id 
      WHERE p.slug = ?
    `, [req.params.slug]);
    
    if (!post) {
      return res.status(404).json({ success: false, error: 'Bài viết không tồn tại' });
    }
    
    await db.run('UPDATE posts SET view_count = view_count + 1 WHERE id = ?', [post.id]);
    post.view_count += 1;
    post.attachments = await getPostAttachments(db, post.id);
    
    res.json({ success: true, data: post });
  } catch (error) {
    console.error('[CMS] getPostBySlug error:', error);
    res.status(500).json({ success: false, error: 'Lỗi lấy bài viết theo slug' });
  }
});

// GET /api/cms/posts/:id
cmsRouter.get('/posts/:id', async (req, res) => {
  try {
    const db = await getWebDb();
    const post = await db.get(`
      SELECT p.*, c.name as category_name 
      FROM posts p 
      LEFT JOIN post_categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `, [req.params.id]);
    
    if (!post) return res.status(404).json({ success: false, error: 'Bài viết không tồn tại' });
    post.attachments = await getPostAttachments(db, post.id);
    
    res.json({ success: true, data: post });
  } catch (error) {
    console.error('[CMS] getPostById error:', error);
    res.status(500).json({ success: false, error: 'Lỗi lấy bài viết' });
  }
});

// POST /api/cms/posts
cmsRouter.post('/posts', requireAdmin, async (req, res) => {
  try {
    const { 
      title, slug, category_id, excerpt, content, thumbnail, status = 'published',
      meta_title, meta_description, keywords, is_featured, published_at, attachments
    } = req.body;
    
    if (!title || !content) return res.status(400).json({ success: false, error: 'Thiếu tiêu đề hoặc nội dung' });
    
    const db = await getWebDb();
    const finalSlug = slug || title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    
    const result = await db.run(
      `INSERT INTO posts (
        title, slug, category_id, category, excerpt, content, thumbnail, status, 
        meta_title, meta_description, keywords, is_featured, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, finalSlug, category_id || null, 'Legacy', excerpt, content, thumbnail, status,
        meta_title, meta_description, keywords, is_featured ? 1 : 0, published_at || null
      ]
    );
    
    const postId = result.lastID;

    // Insert attachments
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      for (const file of attachments) {
        await db.run(
          `INSERT INTO post_attachments (post_id, file_name, file_url, file_type, file_size) VALUES (?, ?, ?, ?, ?)`,
          [postId, file.file_name, file.file_url, file.file_type || null, file.file_size || null]
        );
      }
    }
    
    res.json({ success: true, data: { id: postId, message: 'Đăng bài viết thành công' } });
  } catch (error) {
    console.error('[CMS] createPost error:', error);
    res.status(500).json({ success: false, error: 'Lỗi tạo bài viết' });
  }
});

// PUT /api/cms/posts/:id
cmsRouter.put('/posts/:id', requireAdmin, async (req, res) => {
  try {
    const { 
      title, slug, category_id, excerpt, content, thumbnail, status,
      meta_title, meta_description, keywords, is_featured, published_at, attachments
    } = req.body;
    const db = await getWebDb();
    
    const existing = await db.get('SELECT id FROM posts WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ success: false, error: 'Bài viết không tồn tại' });
    
    await db.run(
      `UPDATE posts SET 
        title=?, slug=?, category_id=?, excerpt=?, content=?, thumbnail=?, status=?, 
        meta_title=?, meta_description=?, keywords=?, is_featured=?, published_at=?, updated_at=CURRENT_TIMESTAMP 
      WHERE id=?`,
      [
        title, slug, category_id || null, excerpt, content, thumbnail, status,
        meta_title, meta_description, keywords, is_featured ? 1 : 0, published_at || null, req.params.id
      ]
    );

    // Xóa attachments cũ và thêm mới (cách đơn giản nhất)
    if (attachments !== undefined) {
      await db.run('DELETE FROM post_attachments WHERE post_id = ?', [req.params.id]);
      if (Array.isArray(attachments) && attachments.length > 0) {
        for (const file of attachments) {
          await db.run(
            `INSERT INTO post_attachments (post_id, file_name, file_url, file_type, file_size) VALUES (?, ?, ?, ?, ?)`,
            [req.params.id, file.file_name, file.file_url, file.file_type || null, file.file_size || null]
          );
        }
      }
    }
    
    res.json({ success: true, message: 'Cập nhật bài viết thành công' });
  } catch (error) {
    console.error('[CMS] updatePost error:', error);
    res.status(500).json({ success: false, error: 'Lỗi cập nhật bài viết' });
  }
});

// DELETE /api/cms/posts/:id
cmsRouter.delete('/posts/:id', requireAdmin, async (req, res) => {
  try {
    const db = await getWebDb();
    await db.run('DELETE FROM posts WHERE id = ?', [req.params.id]);
    // post_attachments is configured with ON DELETE CASCADE so it should be deleted automatically
    res.json({ success: true, message: 'Đã xóa bài viết' });
  } catch (error) {
    console.error('[CMS] deletePost error:', error);
    res.status(500).json({ success: false, error: 'Lỗi xóa bài viết' });
  }
});

// ==========================================
// DOCTORS
// ==========================================

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

cmsRouter.post('/doctors', requireAdmin, async (req, res) => {
  try {
    const db = await getWebDb();
    const { mabs, avatar_url, bio, experience_years, special_titles } = req.body;

    if (!mabs) return res.status(400).json({ success: false, error: "Thiếu mã bác sĩ" });

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

// ==========================================
// LOGS
// ==========================================

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
