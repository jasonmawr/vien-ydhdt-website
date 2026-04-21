/**
 * Deep exploration of ALL tables in MEDI schema
 * Focus: Patient types, doctors, departments, insurance, pricing, booking
 */
import { initDatabase, getConnection } from "../shared/database";

async function deepExplore() {
  await initDatabase();
  const conn = await getConnection();
  try {
    // ═══════════════════════════════════════════
    // PHẦN 1: DANH MỤC BÁC SĨ (DMBS)
    // ═══════════════════════════════════════════
    console.log("\n══════ 1. DANH MỤC BÁC SĨ (MEDI.DMBS) ══════");
    const bsCols = await conn.execute(`
      SELECT column_name, data_type, data_length 
      FROM all_tab_columns WHERE owner='MEDI' AND table_name='DMBS' ORDER BY column_id
    `);
    console.log("Columns:", bsCols.rows);
    
    const bsData = await conn.execute(`SELECT * FROM MEDI.DMBS WHERE ROWNUM <= 5`);
    console.log("Meta:", bsData.metaData?.map((m: any) => m.name));
    for (const r of (bsData.rows || [])) console.log(r);

    // ═══════════════════════════════════════════
    // PHẦN 2: LOẠI ĐỐI TƯỢNG BỆNH NHÂN
    // ═══════════════════════════════════════════
    console.log("\n══════ 2. BẢNG BẢO HIỂM Y TẾ (MEDI.DMBHYT) ══════");
    try {
      const bhytCols = await conn.execute(`
        SELECT column_name, data_type FROM all_tab_columns 
        WHERE owner='MEDI' AND table_name='DMBHYT' ORDER BY column_id
      `);
      console.log("Columns:", bhytCols.rows);
      const bhytData = await conn.execute(`SELECT * FROM MEDI.DMBHYT WHERE ROWNUM <= 10`);
      console.log("Meta:", bhytData.metaData?.map((m: any) => m.name));
      for (const r of (bhytData.rows || [])) console.log(r);
    } catch(e: any) { console.log("Lỗi:", e.message); }

    // ═══════════════════════════════════════════
    // PHẦN 3: LOẠI THẺ (DMTHE) - dịch vụ/BHYT/chuyên gia
    // ═══════════════════════════════════════════
    console.log("\n══════ 3. LOẠI THẺ (MEDI.DMTHE) ══════");
    try {
      const theCols = await conn.execute(`
        SELECT column_name, data_type FROM all_tab_columns 
        WHERE owner='MEDI' AND table_name='DMTHE' ORDER BY column_id
      `);
      console.log("Columns:", theCols.rows);
      const theData = await conn.execute(`SELECT * FROM MEDI.DMTHE WHERE ROWNUM <= 15`);
      console.log("Meta:", theData.metaData?.map((m: any) => m.name));
      for (const r of (theData.rows || [])) console.log(r);
    } catch(e: any) { console.log("Lỗi:", e.message); }

    // ═══════════════════════════════════════════
    // PHẦN 4: LOẠI THẺ BN (DMLOAITHE)
    // ═══════════════════════════════════════════
    console.log("\n══════ 4. LOẠI THẺ BN (MEDI.DMLOAITHE) ══════");
    try {
      const ltData = await conn.execute(`SELECT * FROM MEDI.DMLOAITHE WHERE ROWNUM <= 15`);
      console.log("Meta:", ltData.metaData?.map((m: any) => m.name));
      for (const r of (ltData.rows || [])) console.log(r);
    } catch(e: any) { console.log("Lỗi:", e.message); }

    // ═══════════════════════════════════════════
    // PHẦN 5: TUYẾN BV / ĐÚNG TUYẾN TRÁI TUYẾN
    // ═══════════════════════════════════════════
    console.log("\n══════ 5. TUYẾN BV (MEDI.DMTUYEN, MEDI.DMTUYENBV, MEDI.DMTRAITUYEN) ══════");
    try {
      const tuyenData = await conn.execute(`SELECT * FROM MEDI.DMTUYEN WHERE ROWNUM <= 10`);
      console.log("DMTUYEN Meta:", tuyenData.metaData?.map((m: any) => m.name));
      for (const r of (tuyenData.rows || [])) console.log(r);
    } catch(e: any) { console.log("DMTUYEN Lỗi:", e.message); }
    try {
      const ttData = await conn.execute(`SELECT * FROM MEDI.DMTRAITUYEN WHERE ROWNUM <= 10`);
      console.log("DMTRAITUYEN Meta:", ttData.metaData?.map((m: any) => m.name));
      for (const r of (ttData.rows || [])) console.log(r);
    } catch(e: any) { console.log("DMTRAITUYEN Lỗi:", e.message); }

    // ═══════════════════════════════════════════
    // PHẦN 6: KHOA CHỈ ĐỊNH (DMKHOACHIDINH) 
    // ═══════════════════════════════════════════
    console.log("\n══════ 6. KHOA CHỈ ĐỊNH (MEDI.DMKHOACHIDINH) ══════");
    try {
      const kcCols = await conn.execute(`
        SELECT column_name, data_type FROM all_tab_columns 
        WHERE owner='MEDI' AND table_name='DMKHOACHIDINH' ORDER BY column_id
      `);
      console.log("Columns:", kcCols.rows);
      const kcData = await conn.execute(`SELECT * FROM MEDI.DMKHOACHIDINH WHERE ROWNUM <= 15`);
      console.log("Meta:", kcData.metaData?.map((m: any) => m.name));
      for (const r of (kcData.rows || [])) console.log(r);
    } catch(e: any) { console.log("Lỗi:", e.message); }

    // ═══════════════════════════════════════════
    // PHẦN 7: V_GIAVP (Bảng giá viện phí) - Mẫu
    // ═══════════════════════════════════════════
    console.log("\n══════ 7. BẢNG GIÁ VIỆN PHÍ (V_GIAVP) - 10 dòng mẫu ══════");
    try {
      const gvp = await conn.execute(`
        SELECT ID, MA, TEN, DVT, GIA_BH, GIA_DV, GIA_NN, LOAIBN, BHYT 
        FROM MEDI.V_GIAVP 
        WHERE ROWNUM <= 10
      `);
      for (const r of (gvp.rows || [])) console.log(r);
    } catch(e: any) { console.log("Lỗi:", e.message); }

    // ═══════════════════════════════════════════
    // PHẦN 8: KHÁM BỆNH (V_KHAMBENH)
    // ═══════════════════════════════════════════
    console.log("\n══════ 8. VIEW V_KHAMBENH ══════");
    try {
      const vkbCols = await conn.execute(`
        SELECT column_name, data_type FROM all_tab_columns 
        WHERE owner='MEDI' AND table_name='V_KHAMBENH' ORDER BY column_id
        FETCH FIRST 25 ROWS ONLY
      `);
      console.log("Columns:", vkbCols.rows);
    } catch(e: any) { console.log("Lỗi:", e.message); }

    // ═══════════════════════════════════════════
    // PHẦN 9: DMKHUVUCKHAMBENH (Khu vực khám)
    // ═══════════════════════════════════════════
    console.log("\n══════ 9. KHU VỰC KHÁM (MEDI.DMKHUVUCKHAMBENH) ══════");
    try {
      const kvData = await conn.execute(`SELECT * FROM MEDI.DMKHUVUCKHAMBENH WHERE ROWNUM <= 15`);
      console.log("Meta:", kvData.metaData?.map((m: any) => m.name));
      for (const r of (kvData.rows || [])) console.log(r);
    } catch(e: any) { console.log("Lỗi:", e.message); }

    // ═══════════════════════════════════════════
    // PHẦN 10: BS CHỈ ĐỊNH (DMBSCHIDINH) 
    // ═══════════════════════════════════════════
    console.log("\n══════ 10. BS CHỈ ĐỊNH (MEDI.DMBSCHIDINH) ══════");
    try {
      const bscdData = await conn.execute(`SELECT * FROM MEDI.DMBSCHIDINH WHERE ROWNUM <= 10`);
      console.log("Meta:", bscdData.metaData?.map((m: any) => m.name));
      for (const r of (bscdData.rows || [])) console.log(r);
    } catch(e: any) { console.log("Lỗi:", e.message); }

    // ═══════════════════════════════════════════
    // PHẦN 11: NƠI TIẾP ĐÓN (DMNOITIEPDON)
    // ═══════════════════════════════════════════
    console.log("\n══════ 11. NƠI TIẾP ĐÓN (MEDI.DMNOITIEPDON) ══════");
    try {
      const ntdData = await conn.execute(`SELECT * FROM MEDI.DMNOITIEPDON WHERE ROWNUM <= 10`);
      console.log("Meta:", ntdData.metaData?.map((m: any) => m.name));
      for (const r of (ntdData.rows || [])) console.log(r);
    } catch(e: any) { console.log("Lỗi:", e.message); }

    // ═══════════════════════════════════════════
    // PHẦN 12: DỊCH VỤ CHI TRẢ (DMDVCHITRA)
    // ═══════════════════════════════════════════
    console.log("\n══════ 12. DỊCH VỤ CHI TRẢ (MEDI.DMDVCHITRA) ══════");
    try {
      const dvcData = await conn.execute(`SELECT * FROM MEDI.DMDVCHITRA WHERE ROWNUM <= 10`);
      console.log("Meta:", dvcData.metaData?.map((m: any) => m.name));
      for (const r of (dvcData.rows || [])) console.log(r);
    } catch(e: any) { console.log("Lỗi:", e.message); }

    // ═══════════════════════════════════════════
    // PHẦN 13: TỔNG SỐ BẢNG TRONG MEDI
    // ═══════════════════════════════════════════
    console.log("\n══════ 13. TỔNG SỐ BẢNG TRONG SCHEMA MEDI ══════");
    const totalTables = await conn.execute(`
      SELECT COUNT(*) as TOTAL FROM all_tables WHERE owner='MEDI'
    `);
    console.log(totalTables.rows);

  } catch (err) {
    console.error("Lỗi tổng:", err);
  } finally {
    await conn.close();
    process.exit(0);
  }
}

deepExplore();
