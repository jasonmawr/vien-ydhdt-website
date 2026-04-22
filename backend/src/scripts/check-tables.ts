import { initDatabase, getConnection } from "../shared/database";

async function checkTables() {
  await initDatabase();
  const conn = await getConnection();
  try {
    const sql = `
      SELECT owner, table_name 
      FROM all_tables 
      WHERE table_name IN ('WEB_USERS', 'APPOINTMENTS')
    `;
    const result = await conn.execute(sql);
    console.log("=== BẢNG ĐÃ ĐƯỢC TẠO TRONG ORACLE ===");
    console.log(result.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await conn.close();
    process.exit(0);
  }
}

checkTables();
