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
    // Check if table exists by trying to select from it
    try {
      await conn.execute(`SELECT COUNT(*) FROM WEB_USERS WHERE ROWNUM = 1`);
      // Bảng đã tồn tại, không cần tạo
      return;
    } catch {
      // Bảng chưa có -> tạo mới
    }

    {
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
      
      // Seed default admin account: admin / admin123
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash("admin123", salt);
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
      
      console.log("✅ Bảng WEB_USERS đã được tạo. Tài khoản mặc định: admin / admin123");
    }
  } catch (error) {
    console.error("❌ Lỗi khi khởi tạo bảng WEB_USERS:", error);
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
