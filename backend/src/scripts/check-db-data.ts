import { getConnection, initDatabase } from "../shared/database";

async function main() {
  await initDatabase();
  const conn = await getConnection();
  try {
    console.log("--- CHUYÊN KHOA (MEDI.DMCHUYENKHOA) ---");
    const khoas = await conn.execute(`SELECT * FROM MEDI.DMCHUYENKHOA`);
    console.log(`Tổng số khoa: ${khoas.rows?.length}`);
    console.log(khoas.rows);

    console.log("\n--- CHUYÊN KHOA HIỆN ĐANG LẤY TRONG SERVICE ---");
    const khoasService = await conn.execute(`SELECT ID, TEN FROM MEDI.DMCHUYENKHOA ORDER BY ID`);
    console.log(khoasService.rows);

    console.log("\n--- CHUYÊN KHOA (MEDI.CHUYENKHOA) ---");
    const k2 = await conn.execute(`SELECT * FROM MEDI.CHUYENKHOA`);
    console.log(k2.rows);

    console.log("\n--- BỘ PHẬN/KHOA PHÒNG (MEDI.BPD_BOPHAN) ---");
    try {
      const bp = await conn.execute(`SELECT ID, MA, TEN FROM MEDI.BPD_BOPHAN WHERE ROWNUM <= 20`);
      console.log(bp.rows);
    } catch(e) {}

    console.log("\n--- BÁC SĨ TỪ API ---");
    const bss = await conn.execute(`SELECT MA, HOTEN, MAKP, CHUYENKHOA FROM MEDI.DMBS WHERE ROWNUM <= 10`);
    console.log(bss.rows);
    
    console.log("\n--- SỐ LƯỢNG BÁC SĨ ---");
    const countBs = await conn.execute(`SELECT COUNT(*) as TOTAL FROM MEDI.DMBS`);
    console.log(countBs.rows);

    console.log("\n--- TẤT CẢ GIÁ KHÁM (MEDI.V_GIAVP) ---");
    const allKhams = await conn.execute(`SELECT ID, MA, TEN, GIA_BH, GIA_DV, GIA_NN FROM MEDI.V_GIAVP WHERE UPPER(MA) LIKE 'K%' AND LENGTH(MA) <= 3`);
    console.log(allKhams.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await conn.close();
    process.exit(0);
  }
}

main();
