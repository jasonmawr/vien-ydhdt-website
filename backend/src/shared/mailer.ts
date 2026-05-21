/**
 * @file mailer.ts
 * @description Nodemailer wrapper — gửi email xác nhận lịch hẹn & thông báo admin.
 */
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { logger } from './logger';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: { rejectUnauthorized: false },
    });
  }
  return transporter;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  templateName: string;
  variables: Record<string, string>;
}): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.warn('[Mailer] SMTP chưa được cấu hình — bỏ qua gửi email');
    return;
  }

  const templatePath = path.join(__dirname, 'templates', `${options.templateName}.hbs`);
  if (!fs.existsSync(templatePath)) {
    logger.error(`[Mailer] Template không tồn tại: ${templatePath}`);
    return;
  }

  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  const template = handlebars.compile(templateSource);
  const html = template(options.variables);

  await getTransporter().sendMail({
    from: `"Viện Y Dược Học Dân Tộc TP.HCM" <${process.env.SMTP_USER}>`,
    to: options.to,
    subject: options.subject,
    html,
  });

  logger.info(`[Mailer] Đã gửi email "${options.subject}" tới ${options.to}`);
}

export async function sendAdminNotification(subject: string, htmlBody: string): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;
  const adminEmails = process.env.ADMIN_NOTIFY_EMAILS || process.env.SMTP_USER;

  await getTransporter().sendMail({
    from: `"Viện YDHDT - Hệ thống" <${process.env.SMTP_USER}>`,
    to: adminEmails,
    subject,
    html: htmlBody,
  });

  logger.info(`[Mailer] Thông báo admin đã gửi: ${subject}`);
}
