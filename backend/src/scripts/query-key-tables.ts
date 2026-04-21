/**
 * @file query-key-tables.ts  
 * @description Truy vấn cấu trúc và dữ liệu mẫu của các bảng nghiệp vụ chính.
 */
import { initDatabase, getConnection, closeDatabase } from "../shared/database";

async function describeTable(conn: any, owner: string, tableName: string) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`📊 ${owner}.${tableName}`);
  console.log("─".repeat(60));

  const cols = await conn.execute(
    `SELECT COLUMN_NAME, DATA_TYPE, DATA_LENGTH, NULLABLE
     FROM ALL_TAB_COLUMNS
     WHERE OWNER = :owner AND TABLE_NAME = :tableName
     ORDER BY COLUMN_ID`,
    { owner, tableName }
  );

  if (cols.rows) {
    for (const col of cols.rows as any[]) {
      console.log(`  ${col.COLUMN_NAME.padEnd(30)} ${col.DATA_TYPE.padEnd(15)} ${col.NULLABLE === "Y" ? "NULL" : "NOT NULL"}`);
    }
  }
}

async function sampleData(conn: any, owner: string, tableName: string, limit = 3) {
  try {
    const result = await conn.execute(
      `SELECT * FROM "${owner}"."${tableName}" WHERE ROWNUM <= ${limit}`
    );
    if (result.rows && (result.rows as any[]).length > 0) {
      console.log(`\n  📋 Dữ liệu mẫu (${limit} rows):`);
      for (const row of result.rows as any[]) {
        console.log("  ", JSON.stringify(row));
      }
    }
  } catch (err: any) {
    console.log(`  ⚠️  Không thể đọc dữ liệu: ${err.message}`);
  }
}

async function main() {
  await initDatabase();
  const conn = await getConnection();

  try {
    const OWNER = "MEDI";

    // ──────────────────────────────────────────
    // 1. Bảng Bác sĩ
    // ──────────────────────────────────────────
    await describeTable(conn, OWNER, "DMBS");
    await sampleData(conn, OWNER, "DMBS", 2);

    // ──────────────────────────────────────────
    // 2. Bảng Chuyên khoa
    // ──────────────────────────────────────────
    await describeTable(conn, OWNER, "DMCHUYENKHOA");
    await sampleData(conn, OWNER, "DMCHUYENKHOA", 5);

    // ──────────────────────────────────────────
    // 3. Tìm thêm bảng Khoa/Phòng (DMKP)
    // ──────────────────────────────────────────
    const kpTables = await conn.execute(
      `SELECT TABLE_NAME FROM ALL_TABLES
       WHERE OWNER = :owner AND (TABLE_NAME LIKE 'DMKP%' OR TABLE_NAME LIKE 'DM_KP%' OR TABLE_NAME = 'DMKHOA')
       ORDER BY TABLE_NAME`,
      { owner: OWNER }
    );
    console.log(`\n📋 Bảng Khoa/Phòng tìm thấy:`);
    if (kpTables.rows) {
      for (const t of kpTables.rows as any[]) {
        await describeTable(conn, OWNER, t.TABLE_NAME);
        await sampleData(conn, OWNER, t.TABLE_NAME, 3);
      }
    }

    // ──────────────────────────────────────────
    // 4. Tìm bảng Dược liệu / Thuốc
    // ──────────────────────────────────────────
    const herbTables = await conn.execute(
      `SELECT TABLE_NAME, NUM_ROWS FROM ALL_TABLES
       WHERE OWNER = :owner AND (
         TABLE_NAME LIKE 'DUOCLIEU%' OR TABLE_NAME LIKE 'DMDL%' OR
         TABLE_NAME LIKE 'DMTHUOC%' OR TABLE_NAME LIKE 'THUOC%'
       )
       ORDER BY NUM_ROWS DESC NULLS LAST`,
      { owner: OWNER }
    );
    console.log(`\n📋 Bảng Thuốc/Dược liệu:`);
    if (herbTables.rows) {
      for (const t of herbTables.rows as any[]) {
        await describeTable(conn, OWNER, t.TABLE_NAME);
        await sampleData(conn, OWNER, t.TABLE_NAME, 2);
      }
    }

    // ──────────────────────────────────────────
    // 5. Bảng Bệnh nhân
    // ──────────────────────────────────────────
    await describeTable(conn, OWNER, "BENHNHAN");
    // Không lấy sample data bệnh nhân vì nhạy cảm

    // ──────────────────────────────────────────
    // 6. Tìm bảng liên quan đến Đặt lịch / Hẹn khám
    // ──────────────────────────────────────────
    const apptTables = await conn.execute(
      `SELECT TABLE_NAME, NUM_ROWS FROM ALL_TABLES
       WHERE OWNER = :owner AND (
         TABLE_NAME LIKE 'HENKHAM%' OR TABLE_NAME LIKE 'DATLICH%' OR
         TABLE_NAME LIKE 'LICHKHAM%' OR TABLE_NAME LIKE 'PHIEU%' OR
         TABLE_NAME LIKE 'DATHENKHAM%'
       )
       ORDER BY TABLE_NAME`,
      { owner: OWNER }
    );
    console.log(`\n📋 Bảng Hẹn khám / Đặt lịch:`);
    if (apptTables.rows) {
      for (const t of apptTables.rows as any[]) {
        console.log(`  📁 ${t.TABLE_NAME} (~${t.NUM_ROWS ?? 0} rows)`);
        await describeTable(conn, OWNER, t.TABLE_NAME);
      }
    }

    // ──────────────────────────────────────────
    // 7. Bảng Tin tức / Bài viết (nếu có)
    // ──────────────────────────────────────────
    const newsTables = await conn.execute(
      `SELECT TABLE_NAME, NUM_ROWS FROM ALL_TABLES
       WHERE OWNER = :owner AND (
         TABLE_NAME LIKE 'TINTUC%' OR TABLE_NAME LIKE 'BAIVIET%' OR
         TABLE_NAME LIKE 'NEWS%' OR TABLE_NAME LIKE 'POST%'
       )
       ORDER BY TABLE_NAME`,
      { owner: OWNER }
    );
    if (newsTables.rows && (newsTables.rows as any[]).length > 0) {
      console.log(`\n📋 Bảng Tin tức/Bài viết:`);
      for (const t of newsTables.rows as any[]) {
        console.log(`  📁 ${t.TABLE_NAME} (~${t.NUM_ROWS ?? 0} rows)`);
      }
    }

  } finally {
    await conn.close();
    await closeDatabase();
  }
}

main().catch(console.error);
