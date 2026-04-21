/**
 * @file index.ts
 * @description Entry point của Backend API Server.
 * Khởi động Express server, kết nối Oracle DB pool, đăng ký các router.
 */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDatabase } from "./shared/database";

// Modules
import departmentsRouter from "./modules/departments/departments.router";
import doctorsRouter from "./modules/doctors/doctors.router";
import appointmentsRouter from "./modules/appointments/appointments.router";
import { authRouter } from "./modules/auth/auth.router";
import { paymentRouter } from "./modules/payment/payment.router";
import { ensureWebUsersTable } from "./modules/auth/auth.service";

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
app.use("/api/appointments", appointmentsRouter);
app.use("/api/auth", authRouter);
app.use("/api/payment", paymentRouter);

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
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Lỗi máy chủ nội bộ" });
});

// ──────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────
async function start() {
  try {
    console.log("🔄 Đang khởi tạo Oracle connection pool...");
    await initDatabase();
    await ensureWebUsersTable();

    app.listen(PORT, () => {
      console.log(`\n🚀 Backend API Server đang chạy tại: http://localhost:${PORT}`);
      console.log(`📋 API Endpoints:`);
      console.log(`   GET  /api/departments`);
      console.log(`   GET  /api/doctors?featured=true&limit=8`);
      console.log(`   GET  /api/doctors/:id`);
      console.log(`   GET  /api/doctors/:id/image`);
      console.log(`   POST /api/appointments`);
      console.log(`   GET  /api/appointments (Protected)`);
      console.log(`   POST /api/auth/login`);
    });
  } catch (err) {
    console.error("❌ Không thể khởi động server:", err);
    process.exit(1);
  }
}

start();
