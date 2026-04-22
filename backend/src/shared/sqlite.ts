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
  // Tạo bảng bài viết (Posts)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      excerpt TEXT,
      content TEXT NOT NULL,
      thumbnail TEXT,
      author TEXT DEFAULT 'Admin',
      status TEXT DEFAULT 'published', -- 'draft', 'published'
      tags TEXT,
      view_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tạo bảng chuyên khoa (mở rộng thông tin từ HIS)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS web_departments (
      id TEXT PRIMARY KEY, -- Khớp với ID của HIS
      description TEXT,
      thumbnail TEXT,
      featured_services TEXT
    )
  `);

  // Thêm dữ liệu mẫu nếu bảng posts trống
  const row = await db.get('SELECT COUNT(*) as count FROM posts');
  if (row.count === 0) {
    await db.exec(`
      INSERT INTO posts (title, slug, category, excerpt, content, status)
      VALUES 
      ('Châm cứu điều trị thoái hóa cột sống cổ — Hiệu quả và An toàn', 'cham-cuu-dieu-tri-thoai-hoa-cot-song', 'Y học cổ truyền', 'Nghiên cứu mới nhất của Viện Y Dược Học Dân Tộc chứng minh phương pháp châm cứu kết hợp xoa bóp cho hiệu quả điều trị cao.', '<p>Nội dung chi tiết của bài viết sẽ được Admin soạn thảo thông qua trình soạn thảo Rich Text...</p>', 'published'),
      ('Viện Y Dược Học Dân Tộc triển khai Cổng Đặt Lịch Khám Trực Tuyến', 'vien-ydhdt-trien-khai-cong-dat-lich-truc-tuyen', 'Hoạt động Viện', 'Chính thức ra mắt hệ thống đặt lịch khám online tích hợp thanh toán điện tử VietQR, giúp bệnh nhân thuận tiện hơn.', '<p>Hệ thống đặt lịch khám trực tuyến mới mang lại sự tiện lợi và nhanh chóng...</p>', 'published'),
      ('Thực phẩm tốt cho người bị đau khớp theo Y học cổ truyền', 'thuc-pham-tot-cho-nguoi-dau-khop', 'Sức khỏe & Dinh dưỡng', 'Chế độ dinh dưỡng đóng vai trò quan trọng trong điều trị bệnh xương khớp. Các thực phẩm có tác dụng chống viêm tự nhiên.', '<p>Gừng, tỏi, nghệ là những thực phẩm...</p>', 'published')
    `);
    console.log('[Web CMS] Đã tạo dữ liệu bài viết mẫu.');
  }
}
