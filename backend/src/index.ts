/**
 * @file index.ts
 * @description Entry point của Backend API Server.
 * Khởi động Express server, kết nối Oracle DB pool, đăng ký các router.
 */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDatabase } from "./shared/database";
import rateLimit from "express-rate-limit";
import { logger } from "./shared/logger";

// Modules
import departmentsRouter from "./modules/departments/departments.router";
import doctorsRouter from "./modules/doctors/doctors.router";
import appointmentsRouter from "./modules/appointments/appointments.router";
import { authRouter } from "./modules/auth/auth.router";
import { paymentRouter } from "./modules/payment/payment.router";
import { bookingRouter } from "./modules/booking/booking.router";
import { cmsRouter } from "./modules/cms/cms.router";
import chatbotRouter from "./modules/chatbot/chatbot.router";
import { ensureWebUsersTable } from "./modules/auth/auth.service";
import { getWebDb } from "./shared/sqlite";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 4000;

// ──────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: { success: false, error: "Quá nhiều yêu cầu, vui lòng thử lại sau" },
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: { success: false, error: "Bạn đã vượt quá giới hạn thao tác. Vui lòng thử lại sau 15 phút." },
});

app.use(globalLimiter);

// ──────────────────────────────────────────
// Health Check
// ──────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "Viện Y Dược Học Dân Tộc - API Server",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "healthy", uptime: process.uptime() });
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
app.use("/api/chatbot", strictLimiter, chatbotRouter);

// ──────────────────────────────────────────
// 404 Handler
// ──────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Endpoint không tồn tại" });
});

// ──────────────────────────────────────────
// Error Handler
// ──────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error("Unhandled error: %o", err);
  res.status(500).json({ success: false, error: "Lỗi máy chủ nội bộ" });
});

// ──────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────
async function start() {
  try {
    logger.info("Đang khởi tạo Oracle connection pool...");
    await initDatabase();
    logger.info("Đang khởi tạo Web CMS Database (SQLite)...");
    await getWebDb();
    await ensureWebUsersTable();

    app.listen(PORT, () => {
      logger.info(`Backend API Server đang chạy tại: http://localhost:${PORT}`);
      console.log(`📋 API Endpoints:`);
      console.log(`   GET  /api/departments`);
      console.log(`   GET  /api/doctors?featured=true&limit=8`);
      console.log(`   GET  /api/doctors/:id`);
      console.log(`   GET  /api/doctors/:id/image`);
      console.log(`   POST /api/appointments`);
      console.log(`   GET  /api/appointments (Protected)`);
      console.log(`   POST /api/auth/login`);
      console.log(`   POST /api/chatbot/message`);
      console.log(`   GET  /api/chatbot/health`);
    });
  } catch (err) {
    logger.error("Không thể khởi động server: %o", err);
    process.exit(1);
  }
}

start();
