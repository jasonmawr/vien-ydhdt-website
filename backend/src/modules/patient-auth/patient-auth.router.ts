/**
 * @file patient-auth.router.ts
 * @description OTP-based authentication cho bệnh nhân.
 * Base path: /api/patient/auth
 */
import { Router, type Request, type Response } from 'express';
import { getWebDb } from '../../shared/sqlite';
import { sendSMS } from '../../shared/sms';
import { logger } from '../../shared/logger';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const router = Router();

const safeKeyGenerator = (req: any) => {
  let ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  if (Array.isArray(ip)) ip = ip[0];
  if (ip.includes(',')) ip = ip.split(',')[0].trim();
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length === 2) {
      ip = parts[0];
    } else if (ip.startsWith('[') && ip.includes(']:')) {
      ip = ip.substring(1, ip.indexOf(']:'));
    }
  }
  return ip;
};

// Giới hạn tần suất yêu cầu OTP từ cùng 1 IP (tối đa 10 lần / 15 phút) để phòng chống spam tin nhắn SMS
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: safeKeyGenerator,
  message: {
    success: false,
    error: 'Bạn đã gửi yêu cầu OTP quá nhiều lần. Vui lòng thử lại sau 15 phút.',
  },
});

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/patient/auth/send-otp
router.post('/send-otp', otpLimiter, async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^(0|\+84)[0-9]{9,10}$/.test(phone.replace(/\s/g, ''))) {
      res.status(400).json({ success: false, error: 'Số điện thoại không hợp lệ' });
      return;
    }

    const db = await getWebDb();
    const ttlMinutes = Number(process.env.OTP_TTL_MINUTES) || 5;

    // Kiểm tra xem trong 1 phút qua có gửi OTP chưa (chống spam)
    const recent = await db.get(
      `SELECT id FROM otp_requests WHERE phone = ? AND created_at > datetime('now', '-1 minute') AND used = 0`,
      phone
    );
    if (recent) {
      res.status(429).json({ success: false, error: 'Vui lòng chờ 1 phút trước khi gửi lại mã' });
      return;
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + ttlMinutes * 60000).toISOString();

    await db.run(
      `INSERT INTO otp_requests (phone, otp, expires_at) VALUES (?, ?, ?)`,
      phone, otp, expiresAt
    );

    const smsContent = `[VienYDHDT] Ma xac minh cua ban la: ${otp}. Co hieu luc ${ttlMinutes} phut. Khong chia se ma nay cho bat ky ai.`;
    await sendSMS(phone, smsContent);

    logger.info(`[PatientAuth] OTP đã gửi tới ${phone}`);
    res.json({ success: true, message: `Mã OTP đã được gửi đến ${phone}`, expiresIn: ttlMinutes * 60 });
  } catch (err) {
    logger.error(`[PatientAuth] send-otp error: ${err}`);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
  }
});

// POST /api/patient/auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      res.status(400).json({ success: false, error: 'Thiếu số điện thoại hoặc mã OTP' });
      return;
    }

    const db = await getWebDb();

    const record = await db.get(
      `SELECT * FROM otp_requests
       WHERE phone = ? AND otp = ? AND used = 0 AND expires_at > datetime('now')
       ORDER BY created_at DESC LIMIT 1`,
      phone, otp
    );

    if (!record) {
      res.status(401).json({ success: false, error: 'Mã OTP không đúng hoặc đã hết hạn' });
      return;
    }

    // Đánh dấu OTP đã dùng
    await db.run(`UPDATE otp_requests SET used = 1 WHERE id = ?`, record.id);

    // Tạo hoặc cập nhật patient record
    let patient = await db.get(`SELECT * FROM patients WHERE phone = ?`, phone);
    if (!patient) {
      const result = await db.run(
        `INSERT INTO patients (phone, last_login) VALUES (?, datetime('now'))`,
        phone
      );
      patient = await db.get(`SELECT * FROM patients WHERE id = ?`, result.lastID);
    } else {
      await db.run(`UPDATE patients SET last_login = datetime('now') WHERE phone = ?`, phone);
      patient = await db.get(`SELECT * FROM patients WHERE phone = ?`, phone);
    }

    const jwtSecret = process.env.PATIENT_JWT_SECRET || process.env.JWT_SECRET!;
    const expiresIn = (process.env.PATIENT_JWT_EXPIRES_IN || '7d') as import('jsonwebtoken').SignOptions['expiresIn'];
    const token = jwt.sign(
      { sub: patient.id, phone: patient.phone, role: 'patient' },
      jwtSecret,
      { expiresIn }
    );

    logger.info(`[PatientAuth] Đăng nhập thành công: ${phone}`);
    res.json({
      success: true,
      token,
      patient: {
        id: patient.id,
        phone: patient.phone,
        fullName: patient.full_name,
        email: patient.email,
      },
    });
  } catch (err) {
    logger.error(`[PatientAuth] verify-otp error: ${err}`);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
  }
});

export default router;
