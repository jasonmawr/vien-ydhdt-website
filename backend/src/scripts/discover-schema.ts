/**
 * @file discover-schema.ts
 * @description Script tự động khám phá schema Oracle DB.
 * Tập trung vào các bảng nghiệp vụ, bỏ qua bảng hệ thống.
 * Chạy: npm run discover:schema
 */
import { initDatabase, getConnection, closeDatabase } from "../shared/database";

// Danh sách các schema hệ thống Oracle cần bỏ qua
const SYSTEM_SCHEMAS = [
  'SYS', 'SYSTEM', 'OUTLN', 'DBSNMP', 'XDB', 'CTXSYS', 'MDSYS',
  'OLAPSYS', 'WMSYS', 'ORDSYS', 'ORDDATA', 'LBACSYS', 'APEX_040200',
  'FLOWS_FILES', 'DVSYS', 'AUDSYS', 'GSMADMIN_INTERNAL', 'APPQOSSYS',
  'OJVMSYS', 'DVF', 'REMOTE_SCHEDULER_AGENT', 'DBSFWUSER', 'ORACLE_OCM'
];

async function main() {
  console.log("🔍 Đang khám phá schema Oracle Database...\n");

  try {
    await initDatabase();
    const conn = await getConnection();

    try {
      // 1. Liệt kê TẤT CẢ schemas có bảng (bỏ qua schemas hệ thống)
      console.log("=" .repeat(70));
      console.log("📋 CÁC SCHEMA CÓ DỮ LIỆU NGHIỆP VỤ");
      console.log("=" .repeat(70));

      const schemas = await conn.execute<{ OWNER: string; TABLE_COUNT: number }>(
        `SELECT OWNER, COUNT(*) as TABLE_COUNT
         FROM ALL_TABLES
         WHERE OWNER NOT IN (${SYSTEM_SCHEMAS.map(s => `'${s}'`).join(',')})
         GROUP BY OWNER
         ORDER BY OWNER`
      );

      if (schemas.rows && schemas.rows.length > 0) {
        for (const row of schemas.rows) {
          console.log(`  👤 ${row.OWNER} — ${row.TABLE_COUNT} bảng`);
        }
      }

      // 2. Với mỗi schema nghiệp vụ, liệt kê bảng + cột
      if (schemas.rows) {
        for (const schema of schemas.rows) {
          console.log(`\n${"=".repeat(70)}`);
          console.log(`📦 SCHEMA: ${schema.OWNER} (${schema.TABLE_COUNT} bảng)`);
          console.log("=".repeat(70));

          const tables = await conn.execute<{ TABLE_NAME: string; NUM_ROWS: number | null }>(
            `SELECT TABLE_NAME, NUM_ROWS FROM ALL_TABLES
             WHERE OWNER = :owner ORDER BY TABLE_NAME`,
            { owner: schema.OWNER }
          );

          if (tables.rows) {
            for (const table of tables.rows) {
              const rowCount = table.NUM_ROWS !== null ? `~${table.NUM_ROWS} rows` : "unknown rows";
              console.log(`\n  📁 ${table.TABLE_NAME} (${rowCount})`);

              const columns = await conn.execute<{
                COLUMN_NAME: string;
                DATA_TYPE: string;
                DATA_LENGTH: number;
                NULLABLE: string;
              }>(
                `SELECT COLUMN_NAME, DATA_TYPE, DATA_LENGTH, NULLABLE
                 FROM ALL_TAB_COLUMNS
                 WHERE OWNER = :owner AND TABLE_NAME = :tableName
                 ORDER BY COLUMN_ID`,
                { owner: schema.OWNER, tableName: table.TABLE_NAME }
              );

              if (columns.rows) {
                for (const col of columns.rows) {
                  const nullable = col.NULLABLE === "Y" ? "NULL" : "NOT NULL";
                  console.log(`     ${col.COLUMN_NAME.padEnd(30)} ${col.DATA_TYPE.padEnd(15)} ${nullable}`);
                }
              }
            }
          }
        }
      }

      // 3. Thử đếm vài bảng phổ biến
      console.log(`\n${"=".repeat(70)}`);
      console.log("📊 THỬ ĐẾM DỮ LIỆU TRONG CÁC BẢNG USER (SYSTEM)");
      console.log("=".repeat(70));

      const userTables = await conn.execute<{ TABLE_NAME: string }>(
        `SELECT TABLE_NAME FROM USER_TABLES
         WHERE TABLE_NAME NOT LIKE 'ROLLING$%'
           AND TABLE_NAME NOT LIKE 'SCHEDULER_%'
           AND TABLE_NAME NOT LIKE 'SQLPLUS_%'
           AND TABLE_NAME NOT LIKE 'LOGMNR%'
           AND TABLE_NAME NOT LIKE 'HELP%'
           AND TABLE_NAME NOT LIKE 'OL$%'
           AND TABLE_NAME NOT LIKE 'REDO_%'
           AND TABLE_NAME NOT LIKE 'LOGSTDBY%'
         ORDER BY TABLE_NAME`
      );

      if (userTables.rows) {
        for (const t of userTables.rows) {
          try {
            const count = await conn.execute<{ CNT: number }>(
              `SELECT COUNT(*) as CNT FROM "${t.TABLE_NAME}"`
            );
            if (count.rows && count.rows[0].CNT > 0) {
              console.log(`  ✅ ${t.TABLE_NAME}: ${count.rows[0].CNT} rows`);
            }
          } catch {
            // bỏ qua bảng lỗi
          }
        }
      }

    } finally {
      await conn.close();
    }
  } catch (err) {
    console.error("❌ Lỗi:", err);
  } finally {
    await closeDatabase();
  }
}

main();
