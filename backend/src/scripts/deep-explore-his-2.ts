/**
 * Deep exploration Part 2: Focus on BENHNHAN structure, GIAKHONT (giá khám ngoại trú), 
 * DMBS full data, and all patient-related tables
 */
import { initDatabase, getConnection } from "../shared/database";

async function deepExplore2() {
  await initDatabase();
  const conn = await getConnection();
  try {
    // ═══════════════════════════════════════════
    // 1. TOÀN BỘ CỘT CỦA BẢNG BENHNHAN
    // ═══════════════════════════════════════════
    console.log("\n══════ 1. TOÀN BỘ CỘT MEDI.BENHNHAN ══════");
    const bnAllCols = await conn.execute(`
      SELECT column_name, data_type, data_length, nullable 
      FROM all_tab_columns WHERE owner='MEDI' AND table_name='BENHNHAN' ORDER BY column_id
    `);
    console.log(bnAllCols.rows);

    // 2. Dữ liệu mẫu BENHNHAN
    console.log("\n══════ 2. MẪU BENHNHAN (3 dòng gần nhất) ══════");
    try {
      const bnData = await conn.execute(`
        SELECT MABN, HOTEN, NAMSINH, GIOITINH, DIENTHOAI, DIACHI, NGHENGHIEP, SOTHE, MADT, MATT, MAQU
        FROM MEDI.BENHNHAN 
        WHERE ROWNUM <= 3
      `);
      console.log(bnData.metaData?.map((m: any) => m.name));
      for (const r of (bnData.rows || [])) console.log(r);
    } catch(e: any) { console.log("Lỗi:", e.message); }

    // 3. GIÁ KHÁM NGOẠI TRÚ
    console.log("\n══════ 3. GIÁ KHÁM NGOẠI TRÚ (MEDI.GIAKHONT) ══════");
    try {
      const gkCols = await conn.execute(`
        SELECT column_name, data_type FROM all_tab_columns 
        WHERE owner='MEDI' AND table_name='GIAKHONT' ORDER BY column_id
      `);
      console.log("Columns:", gkCols.rows);
      const gkData = await conn.execute(`SELECT * FROM MEDI.GIAKHONT WHERE ROWNUM <= 5`);
      console.log("Meta:", gkData.metaData?.map((m: any) => m.name));
      for (const r of (gkData.rows || [])) console.log(r);
    } catch(e: any) { console.log("Lỗi:", e.message); }

    // 4. TOÀN BỘ BÁC SĨ (DMBS)
    console.log("\n══════ 4. TOÀN BỘ BÁC SĨ (MEDI.DMBS) ══════");
    try {
      const bsAll = await conn.execute(`SELECT * FROM MEDI.DMBS`);
      console.log("Meta:", bsAll.metaData?.map((m: any) => m.name));
      console.log("Tổng số BS:", (bsAll.rows || []).length);
      for (const r of (bsAll.rows || []).slice(0, 15)) console.log(r);
    } catch(e: any) { console.log("Lỗi:", e.message); }

    // 5. CHUYÊN KHOA
    console.log("\n══════ 5. TOÀN BỘ CHUYÊN KHOA (MEDI.DMCHUYENKHOA) ══════");
    try {
      const ckAll = await conn.execute(`SELECT * FROM MEDI.DMCHUYENKHOA`);
      for (const r of (ckAll.rows || [])) console.log(r);
    } catch(e: any) { console.log("Lỗi:", e.message); }

    // 6. BẢNG GIAVP - Giá khám bệnh cụ thể
    console.log("\n══════ 6. GIÁ KHÁM BỆNH (Lọc theo tên chứa 'khám') ══════");
    try {
      const giaKham = await conn.execute(`
        SELECT ID, MA, TEN, DVT, GIA_BH, GIA_DV, GIA_NN, BHYT 
        FROM MEDI.V_GIAVP 
        WHERE UPPER(TEN) LIKE '%KHÁM%' OR UPPER(TEN) LIKE '%KHAM%'
        FETCH FIRST 20 ROWS ONLY
      `);
      for (const r of (giaKham.rows || [])) console.log(r);
    } catch(e: any) { console.log("Lỗi:", e.message); }

    // 7. ĐỐI TƯỢNG BỆNH NHÂN (tìm bảng)
    console.log("\n══════ 7. BẢNG ĐỐI TƯỢNG (tìm DOITUONG) ══════");
    try {
      const dtTables = await conn.execute(`
        SELECT table_name FROM all_tables 
        WHERE owner='MEDI' AND table_name LIKE '%DOITUONG%'
      `);
      console.log(dtTables.rows);
    } catch(e: any) { console.log("Lỗi:", e.message); }

    // 8. Bảng HEN_SENDSMS (có dữ liệu lịch hẹn thực tế)
    console.log("\n══════ 8. HEN_SENDSMS (Lịch hẹn SMS) ══════");
    try {
      const henSmsCols = await conn.execute(`
        SELECT column_name, data_type FROM all_tab_columns 
        WHERE owner='MEDI' AND table_name='HEN_SENDSMS' ORDER BY column_id
      `);
      console.log("Columns:", henSmsCols.rows);
      const henSmsData = await conn.execute(`SELECT * FROM MEDI.HEN_SENDSMS FETCH FIRST 3 ROWS ONLY`);
      console.log("Meta:", henSmsData.metaData?.map((m: any) => m.name));
      for (const r of (henSmsData.rows || [])) console.log(r);
    } catch(e: any) { console.log("Lỗi:", e.message); }

    // 9. DMKHOACHIDINH - tất cả khoa
    console.log("\n══════ 9. TOÀN BỘ KHOA CHỈ ĐỊNH ══════");
    try {
      const kcAll = await conn.execute(`SELECT * FROM MEDI.DMKHOACHIDINH`);
      for (const r of (kcAll.rows || [])) console.log(r);
    } catch(e: any) { console.log("Lỗi:", e.message); }

    // 10. DMDIEMTHU (Điểm thu tiền)
    console.log("\n══════ 10. ĐIỂM THU TIỀN (MEDI.DMDIEMTHU) ══════");
    try {
      const dtData = await conn.execute(`SELECT * FROM MEDI.DMDIEMTHU WHERE ROWNUM <= 10`);
      console.log("Meta:", dtData.metaData?.map((m: any) => m.name));
      for (const r of (dtData.rows || [])) console.log(r);
    } catch(e: any) { console.log("Lỗi:", e.message); }

    // 11. DSTT (Danh sách thứ tự)
    console.log("\n══════ 11. DSTT (Danh sách STT) ══════");
    try {
      const dsttCols = await conn.execute(`
        SELECT column_name, data_type FROM all_tab_columns 
        WHERE owner='MEDI' AND table_name='DSTT' ORDER BY column_id
      `);
      console.log("Columns:", dsttCols.rows);
      const dsttData = await conn.execute(`SELECT * FROM MEDI.DSTT FETCH FIRST 5 ROWS ONLY`);
      console.log("Meta:", dsttData.metaData?.map((m: any) => m.name));
      for (const r of (dsttData.rows || [])) console.log(r);
    } catch(e: any) { console.log("Lỗi:", e.message); }

  } catch (err) {
    console.error("Lỗi:", err);
  } finally {
    await conn.close();
    process.exit(0);
  }
}

deepExplore2();
