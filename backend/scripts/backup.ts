/**
 * @file backup.ts
 * @description Daily backup: SQLite DB + /uploads directory.
 * Chạy: npx tsx scripts/backup.ts
 * Hoặc tự động qua scheduler lúc 02:00 mỗi ngày.
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const ROOT = path.join(__dirname, '..');
const backupDir = path.resolve(process.env.BACKUP_DIR || path.join(ROOT, 'backups'));
const retentionDays = Number(process.env.BACKUP_RETENTION_DAYS) || 30;

async function backup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_');
  fs.mkdirSync(backupDir, { recursive: true });

  const errors: string[] = [];
  const created: string[] = [];

  // 1. Backup SQLite
  const sqliteSrc = path.join(ROOT, 'data', 'web_cms.sqlite');
  if (fs.existsSync(sqliteSrc)) {
    const dest = path.join(backupDir, `web_cms_${timestamp}.sqlite`);
    fs.copyFileSync(sqliteSrc, dest);
    created.push(dest);
    console.log(`✅ SQLite backup: ${dest}`);
  } else {
    errors.push('SQLite file không tồn tại');
  }

  // 2. Backup uploads directory
  const uploadsDir = path.join(ROOT, 'uploads');
  if (fs.existsSync(uploadsDir)) {
    const dest = path.join(backupDir, `uploads_${timestamp}.tar.gz`);
    try {
      execSync(`tar -czf "${dest}" -C "${ROOT}" uploads`, { stdio: 'pipe' });
      created.push(dest);
      console.log(`✅ Uploads backup: ${dest}`);
    } catch {
      // tar không có trên Windows — dùng zip fallback
      try {
        execSync(`powershell -command "Compress-Archive -Path '${uploadsDir}' -DestinationPath '${dest.replace('.tar.gz', '.zip')}' -Force"`, { stdio: 'pipe' });
        created.push(dest.replace('.tar.gz', '.zip'));
        console.log(`✅ Uploads backup (zip): ${dest.replace('.tar.gz', '.zip')}`);
      } catch (e2) {
        errors.push(`Không thể nén uploads: ${e2}`);
      }
    }
  }

  // 3. Xóa backups cũ hơn retention days
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  let deletedCount = 0;
  for (const file of fs.readdirSync(backupDir)) {
    const filepath = path.join(backupDir, file);
    const stat = fs.statSync(filepath);
    if (stat.mtimeMs < cutoff) {
      fs.unlinkSync(filepath);
      deletedCount++;
    }
  }
  if (deletedCount > 0) console.log(`🗑️  Đã xóa ${deletedCount} backup cũ hơn ${retentionDays} ngày`);

  // 4. Tính tổng dung lượng backup
  const backupFiles = fs.readdirSync(backupDir);
  const totalSize = backupFiles.reduce((sum, f) => {
    return sum + fs.statSync(path.join(backupDir, f)).size;
  }, 0);

  const summary = {
    timestamp,
    created: created.length,
    errors: errors.length,
    totalSizeMb: (totalSize / 1024 / 1024).toFixed(2),
    backupDir,
  };

  console.log('\n📊 Backup summary:', summary);

  // 5. Gửi email báo cáo (nếu có cấu hình)
  if (process.env.SMTP_USER && process.env.ADMIN_NOTIFY_EMAILS) {
    try {
      const { sendAdminNotification } = await import('../src/shared/mailer');
      const status = errors.length === 0 ? '✅ Thành công' : `⚠️ Có ${errors.length} lỗi`;
      await sendAdminNotification(
        `[Viện YDHDT] Backup ${status} — ${new Date().toLocaleDateString('vi-VN')}`,
        `<pre style="font-family:monospace">${JSON.stringify(summary, null, 2)}</pre>${errors.length ? `<p style="color:red">Lỗi: ${errors.join(', ')}</p>` : ''}`
      );
      console.log('📧 Đã gửi báo cáo email backup');
    } catch (e) {
      console.error('Không thể gửi email báo cáo:', e);
    }
  }

  return summary;
}

export default backup;

// Chạy trực tiếp khi gọi via CLI
if (require.main === module) {
  backup().then(() => process.exit(0)).catch(err => {
    console.error('Backup failed:', err);
    process.exit(1);
  });
}
