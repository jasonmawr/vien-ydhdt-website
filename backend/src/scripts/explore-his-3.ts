import { initDatabase, getConnection } from "../shared/database";

async function exploreSTT() {
  await initDatabase();
  const conn = await getConnection();
  try {
    // 1. Cấu trúc bảng TBL_STTKHAM (Số thứ tự khám)
    console.log("\n=== 1. CẤU TRÚC BẢNG MEDI.TBL_STTKHAM ===");
    const sttCols = await conn.execute(`
      SELECT column_name, data_type, data_length, nullable 
      FROM all_tab_columns 
      WHERE owner = 'MEDI' AND table_name = 'TBL_STTKHAM' 
      ORDER BY column_id
    `);
    console.log(sttCols.rows);

    // 2. Dữ liệu mẫu TBL_STTKHAM
    console.log("\n=== 2. DỮ LIỆU MẪU TBL_STTKHAM (5 dòng gần nhất) ===");
    try {
      const sttData = await conn.execute(`SELECT * FROM MEDI.TBL_STTKHAM ORDER BY 1 DESC FETCH FIRST 5 ROWS ONLY`);
      console.log(sttData.metaData?.map((m: any) => m.name));
      for (const row of (sttData.rows || [])) {
        console.log(row);
      }
    } catch(e: any) {
      console.log("Lỗi:", e.message);
    }

    // 3. Bảng DMCHUYENKHOA 
    console.log("\n=== 3. BẢNG MEDI.DMCHUYENKHOA ===");
    try {
      const ckData = await conn.execute(`SELECT * FROM MEDI.DMCHUYENKHOA WHERE ROWNUM <= 15`);
      console.log(ckData.metaData?.map((m: any) => m.name));
      for (const row of (ckData.rows || [])) {
        console.log(row);
      }
    } catch(e: any) {
      console.log("Lỗi:", e.message);
    }

    // 4. Bảng CHUYENKHOA
    console.log("\n=== 4. BẢNG MEDI.CHUYENKHOA ===");
    try {
      const ck2Data = await conn.execute(`SELECT * FROM MEDI.CHUYENKHOA WHERE ROWNUM <= 15`);
      console.log(ck2Data.metaData?.map((m: any) => m.name));
      for (const row of (ck2Data.rows || [])) {
        console.log(row);
      }
    } catch(e: any) {
      console.log("Lỗi:", e.message);
    }

    // 5. Bảng V_GIAVP (Giá viện phí)
    console.log("\n=== 5. CẤU TRÚC BẢNG V_GIAVP (Giá Viện Phí) ===");
    try {
      const gvpCols = await conn.execute(`
        SELECT column_name, data_type 
        FROM all_tab_columns 
        WHERE owner = 'MEDI' AND table_name = 'V_GIAVP' 
        ORDER BY column_id
        FETCH FIRST 20 ROWS ONLY
      `);
      console.log(gvpCols.rows);
    } catch(e: any) {
      console.log("Lỗi:", e.message);
    }

    // 6. Bảng DMPHONG (Danh mục phòng khám)
    console.log("\n=== 6. BẢNG MEDI.DMPHONG ===");
    try {
      const phongCols = await conn.execute(`
        SELECT column_name, data_type, nullable 
        FROM all_tab_columns 
        WHERE owner = 'MEDI' AND table_name = 'DMPHONG' 
        ORDER BY column_id
        FETCH FIRST 15 ROWS ONLY
      `);
      console.log(phongCols.rows);
      const phongData = await conn.execute(`SELECT * FROM MEDI.DMPHONG WHERE ROWNUM <= 10`);
      console.log(phongData.metaData?.map((m: any) => m.name));
      for (const row of (phongData.rows || [])) {
        console.log(row);
      }
    } catch(e: any) {
      console.log("Lỗi:", e.message);
    }

    // 7. Bảng W_HEN structures
    console.log("\n=== 7. BẢNG MEDI.DMNOITIEPDON ===");
    try {
      const tdData = await conn.execute(`SELECT * FROM MEDI.DMNOITIEPDON WHERE ROWNUM <= 10`);
      console.log(tdData.metaData?.map((m: any) => m.name));
      for (const row of (tdData.rows || [])) {
        console.log(row);
      }
    } catch(e: any) {
      console.log("Lỗi:", e.message);
    }

  } catch (err) {
    console.error("Lỗi:", err);
  } finally {
    await conn.close();
    process.exit(0);
  }
}

exploreSTT();
