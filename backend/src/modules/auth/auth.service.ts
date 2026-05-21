import { getConnection } from "../../shared/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, JwtPayload } from "./auth.types";
import { v4 as uuidv4 } from "uuid";

const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_key_change_me_in_production";
const JWT_EXPIRES_IN = "24h";

export async function ensureWebUsersTable() {
  const conn = await getConnection();
  try {
    let tableExists = false;
    try {
      await conn.execute(`SELECT COUNT(*) FROM WEB_USERS WHERE ROWNUM = 1`);
      tableExists = true;
    } catch {
      // Bảng chưa có -> tạo mới
    }

    if (!tableExists) {
      console.log("🛠️ Bảng WEB_USERS chưa tồn tại. Đang tạo mới...");
      const createSql = `
        CREATE TABLE WEB_USERS (
          ID VARCHAR2(36) PRIMARY KEY,
          USERNAME VARCHAR2(50) UNIQUE NOT NULL,
          PASSWORD_HASH VARCHAR2(255) NOT NULL,
          ROLE VARCHAR2(20) DEFAULT 'ADMIN',
          CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await conn.execute(createSql);
      
      // Seed default admin account: admin / admin123 (ở dev) hoặc VienYDhdt@2026! ở production
      const isProduction = process.env.NODE_ENV === "production";
      const defaultPassword = isProduction ? "VienYDhdt@2026!" : "admin123";
      
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(defaultPassword, salt);
      const insertSql = `
        INSERT INTO WEB_USERS (ID, USERNAME, PASSWORD_HASH, ROLE)
        VALUES (:id, :username, :hash, :role)
      `;
      await conn.execute(insertSql, {
        id: uuidv4(),
        username: "admin",
        hash: hash,
        role: "ADMIN"
      }, { autoCommit: true });
      
      if (isProduction) {
        console.warn(`🚨 CẢNH BÁO BẢO MẬT: Bảng WEB_USERS đã được khởi tạo trên Production.`);
        console.warn(`🚨 Đã tạo tài khoản quản trị mặc định 'admin' với MẬT KHẨU: ${defaultPassword}`);
      } else {
        console.log("✅ Bảng WEB_USERS đã được tạo. Tài khoản mặc định: admin / admin123");
      }
    } else {
      // Bảng đã tồn tại -> Kiểm tra tự sửa mật khẩu (self-healing) nếu ở production mà vẫn dùng hash của admin123
      const isProduction = process.env.NODE_ENV === "production";
      if (isProduction) {
        const selectSql = `SELECT ID, PASSWORD_HASH FROM WEB_USERS WHERE USERNAME = :username`;
        const result = await conn.execute<any>(selectSql, { username: "admin" });
        if (result.rows && result.rows.length > 0) {
          const adminRow = result.rows[0];
          // Kiểm tra xem mật khẩu hiện tại trong DB có phải là hash của 'admin123' hay không
          const isLegacy = await bcrypt.compare("admin123", adminRow.PASSWORD_HASH);
          if (isLegacy) {
            console.log("🚨 PHÁT HIỆN: Tài khoản 'admin' đang sử dụng mật khẩu mặc định 'admin123' trên Production.");
            console.log("🔒 Đang tự động cập nhật lên mật khẩu bảo mật 'VienYDhdt@2026!'...");
            
            const salt = await bcrypt.genSalt(10);
            const newHash = await bcrypt.hash("VienYDhdt@2026!", salt);
            
            const updateSql = `
              UPDATE WEB_USERS 
              SET PASSWORD_HASH = :hash 
              WHERE USERNAME = :username
            `;
            await conn.execute(updateSql, {
              hash: newHash,
              username: "admin"
            }, { autoCommit: true });
            console.log("✅ CẬP NHẬT THÀNH CÔNG: Đã chuyển mật khẩu tài khoản 'admin' sang 'VienYDhdt@2026!' bảo mật.");
          }
        }
      }
    }
  } catch (error) {
    console.error("❌ Lỗi khi khởi tạo/cập nhật bảng WEB_USERS:", error);
  } finally {
    await conn.close();
  }
}

export async function login(username: string, passwordRaw: string): Promise<{ token: string; user: User } | null> {
  const conn = await getConnection();
  try {
    const sql = `
      SELECT ID, USERNAME, PASSWORD_HASH, ROLE, CREATED_AT
      FROM WEB_USERS
      WHERE USERNAME = :username
    `;
    const result = await conn.execute<any>(sql, { username });
    
    if (!result.rows || result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const isMatch = await bcrypt.compare(passwordRaw, row.PASSWORD_HASH);
    
    if (!isMatch) {
      return null;
    }

    // Chặn tuyệt đối đăng nhập bằng mật khẩu mặc định admin123 trên Production để bảo đảm an toàn hệ thống
    if (process.env.NODE_ENV === "production" && passwordRaw === "admin123") {
      console.error("🚨 CẢNH BÁO BẢO MẬT: Phát hiện đăng nhập bằng mật khẩu admin123 mặc định trên môi trường Production! Đã bị chặn.");
      throw new Error("Mật khẩu mặc định 'admin123' đã bị chặn trên môi trường Production vì lý do an ninh. Vui lòng cập nhật lại mật khẩu trong cơ sở dữ liệu.");
    }

    const user: User = {
      id: row.ID,
      username: row.USERNAME,
      role: row.ROLE,
      createdAt: row.CREATED_AT
    };

    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return { token, user };
  } finally {
    await conn.close();
  }
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
