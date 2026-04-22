import { initDatabase, getConnection } from "../shared/database";

async function findTables() {
  await initDatabase();
  const conn = await getConnection();
  try {
    const sql = `
      SELECT table_name 
      FROM all_tables 
      WHERE owner = 'MEDI' 
      AND (
        table_name LIKE '%TIEPNHAN%' OR 
        table_name LIKE '%DANGKY%' OR 
        table_name LIKE '%KHAMBENH%' OR 
        table_name LIKE '%HEN%' OR
        table_name LIKE '%VIENPHI%' OR
        table_name LIKE '%THANHTOAN%'
      )
    `;
    const result = await conn.execute(sql);
    console.log("=== CÁC BẢNG TIẾP NHẬN / KHÁM / THANH TOÁN TRONG MEDI ===");
    console.log(result.rows?.map((r: any) => r.TABLE_NAME));
  } catch (err) {
    console.error(err);
  } finally {
    await conn.close();
    process.exit(0);
  }
}

findTables();
