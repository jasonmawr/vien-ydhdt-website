/**
 * @file test-connection.ts
 * @description Script kiểm tra kết nối Oracle DB.
 * Chạy: npm run test:db
 */
import { initDatabase, getConnection, closeDatabase } from "../shared/database";

async function main() {
  console.log("🔍 Đang kết nối tới Oracle Database...\n");

  try {
    await initDatabase();

    const conn = await getConnection();
    try {
      // Test đơn giản: lấy thời gian từ Oracle
      const result = await conn.execute("SELECT SYSDATE FROM DUAL");
      console.log("🕐 Thời gian Oracle Server:", result.rows);
      console.log("\n✅ Kết nối Oracle DB THÀNH CÔNG!");
    } finally {
      await conn.close();
    }
  } catch (err) {
    console.error("\n❌ KẾT NỐI THẤT BẠI:", err);
  } finally {
    await closeDatabase();
  }
}

main();
