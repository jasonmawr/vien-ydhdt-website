import { Router } from 'express';
import { getWebDb } from '../../shared/sqlite';

export const cmsRouter = Router();

// GET /api/cms/posts
cmsRouter.get('/posts', async (req, res) => {
  try {
    const { category, search, limit = 10, offset = 0 } = req.query;
    const db = await getWebDb();
    
    let query = `SELECT * FROM posts WHERE status = 'published'`;
    const params: any[] = [];
    
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
    let countQuery = `SELECT COUNT(*) as total FROM posts WHERE status = 'published'`;
    const countParams: any[] = [];
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

// POST /api/cms/posts (Chỉ dành cho Admin, sau này sẽ cắm JWT middleware vào đây)
cmsRouter.post('/posts', async (req, res) => {
  try {
    const { title, slug, category, excerpt, content, thumbnail, status = 'published' } = req.body;
    const db = await getWebDb();
    
    const result = await db.run(
      `INSERT INTO posts (title, slug, category, excerpt, content, thumbnail, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, category, excerpt, content, thumbnail, status]
    );
    
    res.json({ success: true, data: { id: result.lastID, message: 'Đăng bài viết thành công' } });
  } catch (error) {
    console.error('[CMS] createPost error:', error);
    res.status(500).json({ success: false, error: 'Lỗi tạo bài viết' });
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
cmsRouter.post('/doctors', async (req, res) => {
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
