import { getConnection, initDatabase } from "../shared/database";

async function main() {
  await initDatabase();
  const conn = await getConnection();
  try {
    const r4 = await conn.execute(`SELECT TABLE_NAME FROM ALL_TABLES WHERE OWNER='MEDI' AND (TABLE_NAME LIKE '%KHOA%' OR TABLE_NAME LIKE '%PHONG%')`);
    console.log('Tables:', r4.rows?.map((r: any) => r.TABLE_NAME));
    
    // Check BVKHOA
    try {
      const r5 = await conn.execute(`SELECT * FROM MEDI.BVKHOA`);
      console.log('BVKHOA:', r5.rows);
    } catch {}

    try {
      const r6 = await conn.execute(`SELECT * FROM MEDI.KHOAPHONG`);
      console.log('KHOAPHONG:', r6.rows);
    } catch {}

    try {
      const r7 = await conn.execute(`SELECT * FROM MEDI.BTDKP_BV`);
      console.log('BTDKP_BV:', r7.rows);
    } catch {}

  } catch (err) {
    console.error(err);
  } finally {
    await conn.close();
    process.exit(0);
  }
}

main();
