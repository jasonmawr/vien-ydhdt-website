import { getConnection, initDatabase } from "../shared/database";

async function main() {
  await initDatabase();
  const conn = await getConnection();
  try {
    console.log("--- BÁC SĨ (MEDI.DMBS) ---");
    // Explore prefixes in HOTEN
    const prefixes = await conn.execute(`
      SELECT SUBSTR(HOTEN, 1, INSTR(HOTEN, ' ') - 1) as PREFIX, COUNT(*) as SL
      FROM MEDI.DMBS
      WHERE (HIDE IS NULL OR HIDE = 0)
        AND INSTR(HOTEN, ' ') > 0
      GROUP BY SUBSTR(HOTEN, 1, INSTR(HOTEN, ' ') - 1)
      ORDER BY SL DESC
    `);
    console.log("Tiền tố tên:", prefixes.rows);

    const nhom = await conn.execute(`
      SELECT NHOM, COUNT(*) as SL
      FROM MEDI.DMBS
      WHERE HIDE IS NULL OR HIDE = 0
      GROUP BY NHOM
    `);
    console.log("Nhóm:", nhom.rows);

    // See if there's a DMNHOM
    const dmnhom = await conn.execute(`
      SELECT * FROM all_tables WHERE table_name LIKE '%NHOM%' OR table_name LIKE '%LOAI%'
    `);
    console.log("Bảng liên quan nhóm/loại:", (dmnhom.rows || []).map((r: any) => r.TABLE_NAME).filter((t: string) => t.includes('DM') || t.includes('BS')));

  } catch (err) {
    console.error(err);
  } finally {
    await conn.close();
    process.exit(0);
  }
}

main();
