import { getConnection, initDatabase } from "../shared/database";

async function main() {
  await initDatabase();
  const conn = await getConnection();
  try {
    console.log("--- BẢNG MEDI.TIEPDON ---");
    
    // Check columns
    const cols = await conn.execute(`
      SELECT column_name, data_type 
      FROM all_tab_columns 
      WHERE table_name = 'TIEPDON' AND owner = 'MEDI'
    `);
    console.log('Columns in TIEPDON:');
    console.table(cols.rows);

    const tCount = await conn.execute(`SELECT COUNT(*) FROM MEDI.TIEPDON`);
    console.log('TIEPDON count:', tCount.rows);

    const hCount = await conn.execute(`SELECT COUNT(*) FROM MEDI.W_HEN`);
    console.log('W_HEN count:', hCount.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await conn.close();
    process.exit(0);
  }
}

main();
