import { getConnection, initDatabase } from "../shared/database";

async function main() {
  await initDatabase();
  const conn = await getConnection();
  try {
    console.log("--- BÁC SĨ (MEDI.DMBS) ---");
    const countTotal = await conn.execute(`SELECT COUNT(*) as TOTAL FROM MEDI.DMBS WHERE HIDE IS NULL OR HIDE = 0`);
    console.log("Tổng số (không HIDE):", countTotal.rows);
    
    const countBS = await conn.execute(`SELECT COUNT(*) as TOTAL FROM MEDI.DMBS WHERE (HIDE IS NULL OR HIDE = 0) AND UPPER(HOTEN) LIKE '%BS%'`);
    console.log("Số lượng chứa 'BS':", countBS.rows);

    const checkChucVu = await conn.execute(`SELECT BANGCAP, COUNT(*) as SL FROM MEDI.DMBS WHERE (HIDE IS NULL OR HIDE = 0) GROUP BY BANGCAP`);
    console.log("Thống kê Bằng cấp:", checkChucVu.rows);

    console.log("\n--- CỘT CỦA BẢNG MEDI.DMBS ---");
    const colsBS = await conn.execute(`SELECT column_name FROM all_tab_columns WHERE table_name = 'DMBS'`);
    console.log(colsBS.rows);

    console.log("\n--- ĐỐI TƯỢNG (MEDI.DOITUONG) ---");
    const doituong = await conn.execute(`SELECT * FROM MEDI.DOITUONG`);
    console.log(doituong.rows);

    console.log("\n--- BẢNG GIÁ CÔNG KHÁM (MEDI.V_GIAVP) ---");
    // User mentioned Khám Y học cổ truyền, Khám phục hồi chức năng... let's see how many names start with "Khám"
    const khamList = await conn.execute(`
      SELECT ID, MA, TEN, GIA_BH, GIA_DV, GIA_NN, GIA_TH
      FROM MEDI.V_GIAVP 
      WHERE UPPER(TEN) LIKE 'KHÁM%' OR UPPER(TEN) LIKE 'KHAM%'
    `);
    console.log(khamList.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await conn.close();
    process.exit(0);
  }
}

main();
