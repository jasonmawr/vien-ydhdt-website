/**
 * @file index.ts
 * @description Entry point của Backend API Server — Viện Y Dược Học Dân Tộc TP.HCM
 */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { initDatabase } from "./shared/database";
import rateLimit from "express-rate-limit";
import { logger } from "./shared/logger";
import { startAllCronJobs } from "./shared/scheduler";

// Modules
import departmentsRouter from "./modules/departments/departments.router";
import doctorsRouter from "./modules/doctors/doctors.router";
import appointmentsRouter from "./modules/appointments/appointments.router";
import { authRouter } from "./modules/auth/auth.router";
import { paymentRouter } from "./modules/payment/payment.router";
import { bookingRouter } from "./modules/booking/booking.router";
import { cmsRouter } from "./modules/cms/cms.router";
import { uploadRouter } from "./modules/upload/upload.router";
import chatbotRouter from "./modules/chatbot/chatbot.router";
import patientAuthRouter from "./modules/patient-auth/patient-auth.router";
import patientRouter from "./modules/patient/patient.router";
import usersRouter from "./modules/users/users.router";
import reviewsRouter from "./modules/reviews/reviews.router";
import { ensureWebUsersTable } from "./modules/auth/auth.service";
import { getWebDb } from "./shared/sqlite";

dotenv.config();

const app = express();
app.set("trust proxy", true);
const PORT = process.env.PORT ?? 4000;

// ──────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ 
  limit: "10mb",
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

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

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 1000 : 10000,
  message: { success: false, error: "Quá nhiều yêu cầu, vui lòng thử lại sau" },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: safeKeyGenerator,
  skip: () => process.env.NODE_ENV !== "production",
  validate: { ip: false },
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, error: "Bạn đã vượt quá giới hạn thao tác. Vui lòng thử lại sau 15 phút." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: safeKeyGenerator,
  validate: { ip: false },
});

app.use(globalLimiter);

// ──────────────────────────────────────────
// Health Check
// ──────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "Viện Y Dược Học Dân Tộc - API Server",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "healthy", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ──────────────────────────────────────────
// API Routes (Modular Monolith)
// ──────────────────────────────────────────
app.use("/api/departments", departmentsRouter);
app.use("/api/doctors", doctorsRouter);
app.use("/api/appointments", strictLimiter, appointmentsRouter);
app.use("/api/auth", authRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/cms", cmsRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/chatbot", strictLimiter, chatbotRouter);
app.use("/api/patient/auth", strictLimiter, patientAuthRouter);
app.use("/api/patient", patientRouter);
app.use("/api/users", usersRouter);
app.use("/api/reviews", reviewsRouter);

// Static files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ──────────────────────────────────────────
// 404 & Error Handlers
// ──────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Endpoint không tồn tại" });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error("Unhandled error: %o", err);
  res.status(500).json({ success: false, error: "Lỗi máy chủ nội bộ" });
});

// ──────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────
async function start() {
  try {
    // Kiểm tra độ mạnh của JWT_SECRET trong môi trường production
    if (process.env.NODE_ENV === "production") {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret || jwtSecret === "default_super_secret_key_change_me_in_production" || jwtSecret.length < 16) {
        logger.error("❌ MÔI TRƯỜNG PRODUCTION: Biến môi trường JWT_SECRET chưa được cấu hình, quá ngắn (< 16 ký tự) hoặc đang sử dụng khóa mặc định công khai. CHẶN khởi động để bảo vệ an toàn hệ thống!");
        process.exit(1);
      }
    }

    logger.info("Đang khởi tạo Oracle connection pool...");
    await initDatabase();
    logger.info("Đang khởi tạo Web CMS Database (SQLite)...");
    await getWebDb();
    await ensureWebUsersTable();

    // Khởi động tất cả cron jobs
    startAllCronJobs();

    app.listen(PORT, () => {
      logger.info(`✅ Backend API Server: http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error("Không thể khởi động server: %o", err);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received — shutting down gracefully');
  process.exit(0);
});
process.on('SIGINT', () => {
  logger.info('SIGINT received — shutting down gracefully');
  process.exit(0);
});
