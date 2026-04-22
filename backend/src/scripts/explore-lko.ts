import { getConnection, initDatabase } from "../shared/database";

async function main() {
  await initDatabase();
  const conn = await getConnection();
  try {
    console.log("--- TÌM HIỂU BẢNG LICH_KHAM_ONLINE ---");
    const lkoCols = await conn.execute(`
      SELECT column_name, data_type, data_length, nullable 
      FROM all_tab_columns 
      WHERE table_name = 'LICH_KHAM_ONLINE' AND owner = 'MEDI'
    `);
    console.table(lkoCols.rows);
    
  } catch (err) {
    console.error(err);
  } finally {
    await conn.close();
    process.exit(0);
  }
}

main();
