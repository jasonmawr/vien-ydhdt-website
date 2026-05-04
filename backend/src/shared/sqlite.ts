import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

// Đảm bảo thư mục lưu trữ DB tồn tại
const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'web_cms.sqlite');

let dbInstance: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export async function getWebDb() {
  if (!dbInstance) {
    dbInstance = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    console.log(`[Web CMS] Đã kết nối SQLite tại: ${dbPath}`);
    await initWebDb(dbInstance);
  }
  return dbInstance;
}

async function initWebDb(db: Database<sqlite3.Database, sqlite3.Statement>) {
  // Tạo bảng danh mục (Categories)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS post_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      parent_id INTEGER DEFAULT NULL,
      description TEXT,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES post_categories(id) ON DELETE SET NULL
    )
  `);

  // Bảng File đính kèm
  await db.exec(`
    CREATE TABLE IF NOT EXISTS post_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_type TEXT,
      file_size INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    )
  `);

  // Tạo bảng bài viết (Posts)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      category_id INTEGER,
      excerpt TEXT,
      content TEXT NOT NULL,
      thumbnail TEXT,
      author TEXT DEFAULT 'Admin',
      status TEXT DEFAULT 'published', -- 'draft', 'published'
      tags TEXT,
      meta_title TEXT,
      meta_description TEXT,
      keywords TEXT,
      is_featured INTEGER DEFAULT 0,
      published_at DATETIME,
      view_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES post_categories(id) ON DELETE SET NULL
    )
  `);

  // Thêm các cột mới nếu bảng đã tồn tại từ trước
  try {
    await db.exec('ALTER TABLE posts ADD COLUMN category_id INTEGER REFERENCES post_categories(id) ON DELETE SET NULL');
  } catch (e) {}
  try {
    await db.exec('ALTER TABLE posts ADD COLUMN meta_title TEXT');
  } catch (e) {}
  try {
    await db.exec('ALTER TABLE posts ADD COLUMN meta_description TEXT');
  } catch (e) {}
  try {
    await db.exec('ALTER TABLE posts ADD COLUMN keywords TEXT');
  } catch (e) {}
  try {
    await db.exec('ALTER TABLE posts ADD COLUMN is_featured INTEGER DEFAULT 0');
  } catch (e) {}
  try {
    await db.exec('ALTER TABLE posts ADD COLUMN published_at DATETIME');
  } catch (e) {}

  // Tạo bảng chuyên khoa (mở rộng thông tin từ HIS)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS web_departments (
      id TEXT PRIMARY KEY, -- Khớp với ID của HIS
      description TEXT,
      thumbnail TEXT,
      featured_services TEXT
    )
  `);

  // Tạo bảng hồ sơ bác sĩ (mở rộng thông tin từ HIS)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS web_doctors (
      mabs TEXT PRIMARY KEY, -- Khớp với Mã Bác Sĩ của HIS
      avatar_url TEXT,
      bio TEXT,
      experience_years INTEGER,
      special_titles TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Thêm dữ liệu mẫu danh mục nếu bảng trống
  const catRow = await db.get('SELECT COUNT(*) as count FROM post_categories');
  if (catRow.count === 0) {
    await db.exec(`
      INSERT INTO post_categories (name, slug, description, display_order) VALUES
      ('Tin tức', 'tin-tuc', 'Danh mục tin tức chung', 1),
      ('Y học cổ truyền', 'y-hoc-co-truyen', 'Kiến thức y học cổ truyền', 2),
      ('Hoạt động Viện', 'hoat-dong-vien', 'Tin tức hoạt động của Viện', 3),
      ('Sức khỏe & Dinh dưỡng', 'suc-khoe-dinh-duong', 'Kiến thức sức khỏe', 4),
      ('Nghiên cứu khoa học', 'nghien-cuu-khoa-hoc', 'Bài báo nghiên cứu', 5),
      ('Hướng dẫn bệnh nhân', 'huong-dan-benh-nhan', 'Hướng dẫn dành cho người bệnh', 6)
    `);
    console.log('[Web CMS] Đã tạo dữ liệu danh mục mẫu.');
  }

  // Thêm dữ liệu mẫu nếu bảng posts trống
  const row = await db.get('SELECT COUNT(*) as count FROM posts');
  if (row.count === 0) {
    await db.exec(`
      INSERT INTO posts (title, slug, category_id, category, excerpt, content, status, is_featured)
      VALUES 
      ('Châm cứu điều trị thoái hóa cột sống cổ — Hiệu quả và An toàn', 'cham-cuu-dieu-tri-thoai-hoa-cot-song', 2, 'Y học cổ truyền', 'Nghiên cứu mới nhất của Viện Y Dược Học Dân Tộc chứng minh phương pháp châm cứu kết hợp xoa bóp cho hiệu quả điều trị cao.', '<p>Nội dung chi tiết của bài viết sẽ được Admin soạn thảo thông qua trình soạn thảo Rich Text...</p>', 'published', 1),
      ('Viện Y Dược Học Dân Tộc triển khai Cổng Đặt Lịch Khám Trực Tuyến', 'vien-ydhdt-trien-khai-cong-dat-lich-truc-tuyen', 3, 'Hoạt động Viện', 'Chính thức ra mắt hệ thống đặt lịch khám online tích hợp thanh toán điện tử VietQR, giúp bệnh nhân thuận tiện hơn.', '<p>Hệ thống đặt lịch khám trực tuyến mới mang lại sự tiện lợi và nhanh chóng...</p>', 'published', 0),
      ('Thực phẩm tốt cho người bị đau khớp theo Y học cổ truyền', 'thuc-pham-tot-cho-nguoi-dau-khop', 4, 'Sức khỏe & Dinh dưỡng', 'Chế độ dinh dưỡng đóng vai trò quan trọng trong điều trị bệnh xương khớp. Các thực phẩm có tác dụng chống viêm tự nhiên.', '<p>Gừng, tỏi, nghệ là những thực phẩm...</p>', 'published', 0)
    `);
    console.log('[Web CMS] Đã tạo dữ liệu bài viết mẫu.');
  }
}
