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
  // WAL mode — hiệu suất cao hơn với concurrent reads
  await db.exec(`PRAGMA journal_mode = WAL`);
  await db.exec(`PRAGMA synchronous = NORMAL`);
  await db.exec(`PRAGMA busy_timeout = 5000`);
  await db.exec(`PRAGMA foreign_keys = ON`);

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

  // ─── Bảng SMS Reminders ───
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sms_reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      patient_name TEXT,
      doctor_name TEXT,
      appointment_date TEXT,
      appointment_time TEXT,
      send_at DATETIME NOT NULL,
      appointment_id TEXT,
      sent INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ─── Bảng OTP Requests (Patient Auth) ───
  await db.exec(`
    CREATE TABLE IF NOT EXISTS otp_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      otp TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ─── Bảng Patients ───
  await db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE NOT NULL,
      full_name TEXT,
      dob TEXT,
      gender TEXT,
      email TEXT,
      his_login_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    )
  `);

  // ─── Content Versioning ───
  await db.exec(`
    CREATE TABLE IF NOT EXISTS post_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      title TEXT,
      content TEXT,
      excerpt TEXT,
      changed_by TEXT,
      changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      change_summary TEXT,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    )
  `);

  // ─── Doctor Reviews ───
  await db.exec(`
    CREATE TABLE IF NOT EXISTS doctor_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctor_id TEXT NOT NULL,
      appointment_id TEXT,
      rating INTEGER CHECK(rating BETWEEN 1 AND 5),
      comment TEXT,
      patient_phone TEXT,
      is_published INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ─── Chatbot Configs ───
  await db.exec(`
    CREATE TABLE IF NOT EXISTS chatbot_configs (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_by TEXT
    )
  `);

  // ─── Chatbot Knowledge Base (FAQ & RAG Sources) ───
  await db.exec(`
    CREATE TABLE IF NOT EXISTS chatbot_knowledge (
      id TEXT PRIMARY KEY,
      source_type TEXT NOT NULL, -- 'faq', 'document', 'cms_post', 'url'
      source_reference TEXT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ─── Chatbot Conversations ───
  await db.exec(`
    CREATE TABLE IF NOT EXISTS chatbot_conversations (
      session_id TEXT PRIMARY KEY,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      rating INTEGER, -- 1: 👍, -1: 👎
      feedback_notes TEXT
    )
  `);

  // ─── Chatbot Messages ───
  await db.exec(`
    CREATE TABLE IF NOT EXISTS chatbot_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL, -- 'user', 'assistant'
      content TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (session_id) REFERENCES chatbot_conversations(session_id) ON DELETE CASCADE
    )
  `);

  // ─── Chatbot Schedules (Lịch khám RAG) ───
  await db.exec(`
    CREATE TABLE IF NOT EXISTS chatbot_schedules (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ─── Chatbot Unresolved Questions (Cần bổ sung) ───
  await db.exec(`
    CREATE TABLE IF NOT EXISTS chatbot_unresolved (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      match_score INTEGER DEFAULT 0,
      is_resolved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ─── Patient Q&As (Hỏi đáp y học y khoa) ───
  await db.exec(`
    CREATE TABLE IF NOT EXISTS patient_qnas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      is_answered INTEGER DEFAULT 0,
      answer TEXT,
      answered_by TEXT,
      answered_at DATETIME,
      is_public INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default patient Q&As if table is empty
  const qnaCount = await db.get('SELECT COUNT(*) as count FROM patient_qnas');
  if (qnaCount.count === 0) {
    await db.run(`
      INSERT INTO patient_qnas (name, phone, email, subject, message, is_answered, answer, answered_by, answered_at, is_public)
      VALUES 
      ('Nguyễn Văn A', '0912345678', 'vana@gmail.com', 'Khám & Điều trị', 'Châm cứu chữa thoái hóa cột sống cổ có đau không thưa bác sĩ? Liệu trình mất bao lâu?', 1, 'Chào bạn! Phương pháp châm cứu tại Viện sử dụng kim châm cứu chuyên dụng vô trùng dùng một lần cực kỳ mỏng nên hầu như không gây đau đớn. Bạn chỉ cảm thấy cảm giác căng tức nhẹ (còn gọi là đắc khí) tại các huyệt đạo, điều này chứng tỏ hiệu quả kích thích dòng năng lượng tốt. Thông thường một liệu trình kéo dài khoảng 10–12 buổi, mỗi buổi 20–30 phút tùy thuộc vào mức độ thoái hóa cột sống của bạn.', 'BS. Đỗ Tấn Khoa', CURRENT_TIMESTAMP, 1),
      ('Trần Thị B', '0987654321', 'thib@gmail.com', 'Bảo hiểm y tế', 'Bệnh viện có nhận khám bảo hiểm y tế trái tuyến vào ngày Thứ Bảy không ạ?', 1, 'Chào chị! Viện Y Dược Học Dân Tộc có tiếp nhận khám BHYT đúng tuyến và trái tuyến bình thường vào Thứ Bảy (Sáng 7:00-11:30, Chiều 13:30-16:30) theo hình thức khám ngoài giờ. Khi đi khám, chị vui lòng mang theo thẻ BHYT và căn cước công dân gốc để nhân viên y tế hỗ trợ làm thủ tục hưởng chế độ theo tỷ lệ quy định hiện hành.', 'Bộ phận hỗ trợ BHYT', CURRENT_TIMESTAMP, 1),
      ('Phạm Văn C', '0903334445', 'vanc@gmail.com', 'Đặt lịch khám', 'Tôi đã đặt lịch khám online qua web nhưng muốn đổi giờ khám có được không?', 0, NULL, NULL, NULL, 0)
    `);
    console.log('[Web CMS] Đã tạo dữ liệu mẫu Hỏi đáp y học (Q&A).');
  }

  // Seed default chatbot configs
  const configCount = await db.get('SELECT COUNT(*) as count FROM chatbot_configs');
  if (configCount.count === 0) {
    const defaultPrompt = `Bạn là "Y Dược AI" — trợ lý ảo Viện Y Dược Học Dân Tộc TP.HCM.

NGUYÊN TẮC:
1. Trả lời tiếng Việt, lịch sự, ngắn gọn (<150 từ). Dùng emoji phù hợp.
2. KHÔNG chẩn đoán, KHÔNG kê đơn. Khuyên đặt lịch khám khi hỏi triệu chứng.
3. Không biết → nói thẳng, hướng dẫn gọi (028) 3844 2349.
4. Ưu tiên hướng dẫn đặt lịch qua website khi phù hợp.`;

    await db.run('INSERT INTO chatbot_configs (key, value) VALUES (?, ?)', 'system_prompt', defaultPrompt);
    await db.run('INSERT INTO chatbot_configs (key, value) VALUES (?, ?)', 'welcome_message', 'Xin chào! Tôi là trợ lý ảo Y Dược AI của Viện Y Dược Học Dân Tộc TP.HCM. Tôi có thể giúp gì cho bạn hôm nay?');
    await db.run('INSERT INTO chatbot_configs (key, value) VALUES (?, ?)', 'ai_model', 'gemini-2.0-flash');
    await db.run('INSERT INTO chatbot_configs (key, value) VALUES (?, ?)', 'temperature', '0.7');
    await db.run('INSERT INTO chatbot_configs (key, value) VALUES (?, ?)', 'widget_theme_color', '#0ea5e9');
    await db.run('INSERT INTO chatbot_configs (key, value) VALUES (?, ?)', 'widget_avatar_url', '');
    console.log('[Web CMS] Đã tạo cấu hình chatbot mặc định.');
  }

  // Seed default chatbot schedules
  const scheduleCount = await db.get('SELECT COUNT(*) as count FROM chatbot_schedules');
  if (scheduleCount.count === 0) {
    const defaultScheduleContent = `LỊCH KHÁM NGOẠI TRÚ BÁC SĨ (Áp dụng từ 04/05/2026):
- Bác sĩ Đỗ Tấn Khoa: Khám sáng Thứ 2, Thứ 4 (Phòng chuyên gia 102).
- Bác sĩ Nguyễn Thùy My: Khám cả ngày Thứ 3, Thứ 5 (Phòng châm cứu 204).
- Bác sĩ Phạm Quốc Thịnh: Khám Thứ 6 (Phòng Vật lý trị liệu 105).
- Giờ khám: Sáng 7:00-11:30, Chiều 13:30-16:30.`;

    await db.run(
      `INSERT INTO chatbot_schedules (id, title, content, is_active) VALUES (?, ?, ?, 1)`,
      'sched-default',
      'Lịch khám ngoại trú — áp dụng từ 04/05/2026',
      defaultScheduleContent
    );
    console.log('[Web CMS] Đã tạo lịch khám chatbot mẫu.');
  }

  // Seed unresolved questions (Cần bổ sung)
  const unresolvedCount = await db.get('SELECT COUNT(*) as count FROM chatbot_unresolved');
  if (unresolvedCount.count === 0) {
    const questions = [
      "Có gì hay ho bro",
      "Sao tin được",
      "Lịch nhậu có không bro",
      "Giao ra Hà Nội được không",
      "Bác sỹ tên my",
      "bác sỹ thịnh khám ngày nào",
      "bác sĩ Đỗ Tấn Khoa là ai",
      "ai là giám đốc bệnh viện",
      "bệnh viện có cao phong thấp không",
      "Opening hours"
    ];
    for (const q of questions) {
      await db.run('INSERT INTO chatbot_unresolved (question, match_score, is_resolved) VALUES (?, 0, 0)', q);
    }
    console.log('[Web CMS] Đã tạo danh sách câu hỏi cần bổ sung mẫu.');
  }

  // ─── Scheduled publishing column (nếu chưa có) ───
  try {
    await db.exec(`ALTER TABLE posts ADD COLUMN scheduled_at DATETIME`);
  } catch {}

  // ─── Status 'scheduled' cho posts ───
  try {
    await db.exec(`ALTER TABLE posts ADD COLUMN author_id INTEGER`);
  } catch {}

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
