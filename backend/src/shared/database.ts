/**
 * @file database.ts
 * @description Oracle Database Connection Pool Manager.
 * Sử dụng driver `oracledb` chính thức để kết nối tới Oracle DB của Viện.
 * Khởi tạo pool 1 lần duy nhất khi server start, tái sử dụng cho mọi request.
 */
import oracledb from "oracledb";
import dotenv from "dotenv";

dotenv.config();

// Cấu hình Oracle Instant Client path (Windows)
if (process.env.ORACLE_PATH) {
  try {
    oracledb.initOracleClient({ libDir: process.env.ORACLE_PATH });
  } catch (err) {
    // Đã khởi tạo rồi thì bỏ qua
  }
}

// Cấu hình output: trả về object thay vì array
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

let pool: oracledb.Pool | null = null;

/**
 * Khởi tạo Oracle Connection Pool.
 * Gọi 1 lần duy nhất khi server khởi động.
 */
export async function initDatabase(): Promise<void> {
  try {
    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1,
    });
    console.log("✅ Oracle Database connection pool đã khởi tạo thành công.");
  } catch (err) {
    console.error("❌ Không thể kết nối Oracle Database:", err);
    throw err;
  }
}

/**
 * Lấy một connection từ pool.
 * Sử dụng trong các Service để thực hiện query.
 * 
 * @example
 * const conn = await getConnection();
 * try {
 *   const result = await conn.execute("SELECT * FROM DOCTORS");
 *   return result.rows;
 * } finally {
 *   await conn.close();
 * }
 */
export async function getConnection(): Promise<oracledb.Connection> {
  if (!pool) {
    throw new Error("Database pool chưa được khởi tạo. Gọi initDatabase() trước.");
  }
  return pool.getConnection();
}

/**
 * Đóng pool khi server shutdown.
 */
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.close(0);
    console.log("🔌 Oracle Database pool đã đóng.");
  }
}
