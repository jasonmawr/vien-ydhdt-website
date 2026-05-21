/**
 * @file backup.ts
 * @description Sao lưu cơ sở dữ liệu SQLite CMS hằng ngày.
 * Lưu file backup vào ./backups/ với timestamp, xóa file cũ hơn BACKUP_RETENTION_DAYS ngày.
 * Gửi email báo cáo kết quả backup qua SMTP.
 */
import fs from "fs";
import path from "path";
import { sendAdminNotification } from "../shared/mailer";
import { logger } from "../shared/logger";

const SQLITE_PATH =
  process.env.SQLITE_PATH || path.join(process.cwd(), "data", "web_cms.sqlite");
const BACKUP_DIR = path.join(process.cwd(), "backups");
const RETENTION_DAYS = Number(process.env.BACKUP_RETENTION_DAYS) || 30;

export default async function runBackup(): Promise<void> {
  const startTime = Date.now();

  // Tạo thư mục backup nếu chưa có
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .split("T")[0];
  const backupFilename = `web_cms_${timestamp}.sqlite`;
  const backupPath = path.join(BACKUP_DIR, backupFilename);

  try {
    // Kiểm tra file nguồn tồn tại
    if (!fs.existsSync(SQLITE_PATH)) {
      throw new Error(`File SQLite không tồn tại: ${SQLITE_PATH}`);
    }

    // Copy file SQLite (SQLite hỗ trợ hot backup khi WAL mode)
    fs.copyFileSync(SQLITE_PATH, backupPath);
    const stats = fs.statSync(backupPath);
    const sizeMb = (stats.size / 1024 / 1024).toFixed(2);

    logger.info(`[Backup] Đã backup thành công: ${backupFilename} (${sizeMb} MB)`);

    // Dọn file backup cũ
    const deleted = cleanOldBackups(BACKUP_DIR, RETENTION_DAYS);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    // Gửi email báo cáo
    if (process.env.ADMIN_NOTIFY_EMAILS) {
      const html = `
        <div style="font-family:Arial,sans-serif;padding:20px;background:#f5f5f5">
          <div style="background:#fff;padding:24px;border-radius:12px;max-width:480px">
            <h2 style="color:#109173;margin:0 0 16px">✅ Backup thành công</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:6px 0;color:#888;width:140px">Thời gian</td><td style="font-weight:bold">${new Date().toLocaleString("vi-VN")}</td></tr>
              <tr><td style="padding:6px 0;color:#888">File</td><td style="font-family:monospace;font-size:13px">${backupFilename}</td></tr>
              <tr><td style="padding:6px 0;color:#888">Kích thước</td><td>${sizeMb} MB</td></tr>
              <tr><td style="padding:6px 0;color:#888">Thời gian chạy</td><td>${elapsed}s</td></tr>
              <tr><td style="padding:6px 0;color:#888">Đã xóa backup cũ</td><td>${deleted} file</td></tr>
              <tr><td style="padding:6px 0;color:#888">Còn lưu</td><td>${RETENTION_DAYS} ngày gần nhất</td></tr>
            </table>
          </div>
        </div>
      `;
      await sendAdminNotification(
        `[Viện YDHDT] Backup DB thành công — ${timestamp}`,
        html
      ).catch((e) => logger.warn(`[Backup] Không gửi được email báo cáo: ${e}`));
    }
  } catch (err: any) {
    logger.error(`[Backup] Thất bại: ${err.message}`);

    if (process.env.ADMIN_NOTIFY_EMAILS) {
      await sendAdminNotification(
        `[Viện YDHDT] ⚠️ Backup DB THẤT BẠI — ${timestamp}`,
        `<div style="font-family:Arial;padding:20px"><h2 style="color:#dc2626">❌ Backup thất bại</h2><p><b>Lỗi:</b> ${err.message}</p><p>Vui lòng kiểm tra server ngay.</p></div>`
      ).catch(() => {});
    }

    throw err;
  }
}

function cleanOldBackups(dir: string, retentionDays: number): number {
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  let deleted = 0;
  try {
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.startsWith("web_cms_") && f.endsWith(".sqlite"));
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.mtimeMs < cutoff) {
        fs.unlinkSync(filePath);
        deleted++;
        logger.info(`[Backup] Đã xóa backup cũ: ${file}`);
      }
    }
  } catch (e) {
    logger.warn(`[Backup] Lỗi dọn backup cũ: ${e}`);
  }
  return deleted;
}

// Cho phép chạy trực tiếp: npx tsx src/scripts/backup.ts
if (require.main === module) {
  runBackup()
    .then(() => {
      console.log("✅ Backup hoàn tất");
      process.exit(0);
    })
    .catch((e) => {
      console.error("❌ Backup thất bại:", e);
      process.exit(1);
    });
}
