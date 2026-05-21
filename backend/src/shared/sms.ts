/**
 * @file sms.ts
 * @description ESMS.vn wrapper — gửi SMS xác nhận & nhắc lịch hẹn.
 */
import { logger } from './logger';

const ESMS_URL = 'https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json/';

export async function sendSMS(phone: string, content: string): Promise<void> {
  const apiKey = process.env.ESMS_API_KEY;
  const secretKey = process.env.ESMS_SECRET_KEY;

  if (!apiKey || !secretKey) {
    logger.warn(`[SMS] ESMS chưa cấu hình — bỏ qua SMS tới ${phone}`);
    return;
  }

  // Chuẩn hoá số điện thoại VN: 0xxx -> 84xxx
  const normalizedPhone = phone.replace(/^0/, '84').replace(/\D/g, '');

  try {
    const response = await fetch(ESMS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ApiKey: apiKey,
        Content: content,
        Phone: normalizedPhone,
        SecretKey: secretKey,
        SmsType: '2',
        Brandname: process.env.ESMS_BRANDNAME || 'VienYDHDT',
      }),
    });

    const data = await response.json() as any;
    if (data.CodeResult !== '100') {
      logger.warn(`[SMS] Gửi thất bại tới ${phone}: ${JSON.stringify(data)}`);
    } else {
      logger.info(`[SMS] Đã gửi SMS tới ${phone}`);
    }
  } catch (err) {
    logger.error(`[SMS] Lỗi gửi SMS tới ${phone}: ${err}`);
  }
}
