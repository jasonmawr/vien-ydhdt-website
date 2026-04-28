import { getConnection, initDatabase } from "../shared/database";

async function main() {
  await initDatabase();
  const conn = await getConnection();
  try {
    const res = await conn.execute(`
      SELECT column_name, data_type, data_length, nullable 
      FROM all_tab_columns 
      WHERE table_name = 'W_HEN' AND owner = 'MEDI'
    `);
    console.log("=== W_HEN ===");
    console.table(res.rows);

    const res2 = await conn.execute(`
      SELECT column_name, data_type, data_length, nullable 
      FROM all_tab_columns 
      WHERE table_name = 'W_HENCT' AND owner = 'MEDI'
    `);
    console.log("=== W_HENCT ===");
    console.table(res2.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await conn.close();
  }
}

main();
