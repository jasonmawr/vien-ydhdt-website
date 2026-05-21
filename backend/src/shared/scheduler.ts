/**
 * @file scheduler.ts
 * @description Cron jobs: SMS reminders, scheduled post publishing, daily backup.
 */
import cron from 'node-cron';
import path from 'path';
import { sendSMS } from './sms';
import { getWebDb } from './sqlite';
import { logger } from './logger';

interface ReminderJob {
  phone: string;
  appointmentDate: string;
  appointmentTime: string;
  patientName: string;
  doctorName: string;
  appointmentId: string;
}

/** Lưu reminder vào DB để persist qua restart */
export async function scheduleReminder(job: ReminderJob): Promise<void> {
  try {
    const db = await getWebDb();
    const timeStr = job.appointmentTime || '07:00';
    const sendAt24h = new Date(`${job.appointmentDate}T${timeStr}:00`);
    if (isNaN(sendAt24h.getTime())) return;
    sendAt24h.setHours(sendAt24h.getHours() - 24);

    await db.run(
      `INSERT INTO sms_reminders
         (phone, patient_name, doctor_name, appointment_date, appointment_time, send_at, appointment_id, sent)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      job.phone,
      job.patientName,
      job.doctorName,
      job.appointmentDate,
      job.appointmentTime,
      sendAt24h.toISOString(),
      job.appointmentId
    );
    logger.info(`[Scheduler] Đã lên lịch SMS reminder lúc ${sendAt24h.toISOString()} cho ${job.phone}`);
  } catch (err) {
    logger.error(`[Scheduler] Lỗi lên lịch reminder: ${err}`);
  }
}

/** Cron chính — chạy mỗi phút, kiểm tra & gửi các reminder đến hạn */
function startReminderCron(): void {
  cron.schedule('* * * * *', async () => {
    try {
      const db = await getWebDb();
      const pending = await db.all(
        `SELECT * FROM sms_reminders WHERE sent = 0 AND send_at <= datetime('now') LIMIT 10`
      ) as any[];

      for (const r of pending) {
        const msg = `[VienYDHDT] Nhac lich: Ngay mai ${r.appointment_date} luc ${r.appointment_time || 'theo lich'}, ban co lich hen voi BS ${r.doctor_name}. Dia chi: 273-275 Nam Ky Khoi Nghia Q3. Hotline: 0964392632`;
        await sendSMS(r.phone, msg);
        await db.run(`UPDATE sms_reminders SET sent = 1 WHERE id = ?`, r.id);
      }

      if (pending.length > 0) {
        logger.info(`[Scheduler] Đã gửi ${pending.length} SMS reminder`);
      }
    } catch (err) {
      logger.error(`[Scheduler] Lỗi reminder cron: ${err}`);
    }
  });
  logger.info('[Scheduler] SMS Reminder cron đã khởi động (mỗi phút)');
}

/** Cron auto-publish — mỗi 5 phút, publish bài viết đã đến scheduled_at */
function startPublishCron(): void {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const db = await getWebDb();
      const result = await db.run(
        `UPDATE posts SET status = 'published', published_at = CURRENT_TIMESTAMP
         WHERE status = 'scheduled' AND scheduled_at <= datetime('now')`
      );
      if (result.changes && result.changes > 0) {
        logger.info(`[Scheduler] Auto-published ${result.changes} bài viết đã lên lịch`);
      }
    } catch (err) {
      logger.error(`[Scheduler] Lỗi auto-publish cron: ${err}`);
    }
  });
  logger.info('[Scheduler] Auto-publish cron đã khởi động (mỗi 5 phút)');
}

/** Cron dọn OTP hết hạn — mỗi 30 phút */
function startOtpCleanupCron(): void {
  cron.schedule('*/30 * * * *', async () => {
    try {
      const db = await getWebDb();
      const result = await db.run(
        `DELETE FROM otp_requests WHERE expires_at < datetime('now') AND used = 1`
      );
      if (result.changes && result.changes > 0) {
        logger.info(`[Scheduler] Đã dọn ${result.changes} OTP đã dùng/hết hạn`);
      }
    } catch {}
  });
}

/** Cron backup hằng ngày lúc 02:00 */
function startBackupCron(): void {
  cron.schedule('0 2 * * *', async () => {
    logger.info('[Scheduler] Bắt đầu backup hằng ngày...');
    try {
      // Lazy-load backup để tránh circular dependency + rootDir issue
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const backupModule = require(path.join(process.cwd(), 'scripts', 'backup'));
      await (backupModule.default || backupModule)();
    } catch (err) {
      logger.error(`[Scheduler] Backup cron lỗi: ${err}`);
    }
  });
  logger.info('[Scheduler] Backup cron đã khởi động (mỗi ngày lúc 02:00)');
}

/** Khởi động tất cả cron jobs */
export function startAllCronJobs(): void {
  startReminderCron();
  startPublishCron();
  startOtpCleanupCron();
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_BACKUP_CRON === 'true') {
    startBackupCron();
  }
  logger.info('[Scheduler] Tất cả cron jobs đã được khởi động');
}
