import { getConnection, initDatabase } from "../shared/database";

async function main() {
  await initDatabase();
  const conn = await getConnection();
  try {
    console.log("--- BÁC SĨ (MEDI.DMBS) ---");
    const r1 = await conn.execute(`SELECT NHOM, COUNT(*) as SL FROM MEDI.DMBS WHERE UPPER(HOTEN) LIKE '%BS%' GROUP BY NHOM`);
    console.log('Nhóm của những người có BS trong tên:', r1.rows);
    
    const r2 = await conn.execute(`SELECT NHOM, COUNT(*) as SL FROM MEDI.DMBS WHERE UPPER(HOTEN) LIKE 'ĐD%' OR UPPER(HOTEN) LIKE 'DS%' OR UPPER(HOTEN) LIKE 'CN%' GROUP BY NHOM`);
    console.log('Nhóm của những người có ĐD/DS/CN trong tên:', r2.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await conn.close();
    process.exit(0);
  }
}

main();
