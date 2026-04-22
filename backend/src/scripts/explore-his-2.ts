import { initDatabase, getConnection } from "../shared/database";

async function exploreMore() {
  await initDatabase();
  const conn = await getConnection();
  try {
    // 1. Tìm bảng KHOA/PHONG trong MEDI
    console.log("\n=== 1. BẢNG KHOA / PHÒNG ===");
    const khoaTables = await conn.execute(`
      SELECT table_name FROM all_tables 
      WHERE owner = 'MEDI' 
      AND (table_name LIKE '%KHOA%' OR table_name LIKE 'DM%')
      ORDER BY table_name
    `);
    console.log(khoaTables.rows?.map((r: any) => r.TABLE_NAME));

    // 2. Tìm bảng giá / phí
    console.log("\n=== 2. BẢNG GIÁ / PHÍ ===");
    const giaTables = await conn.execute(`
      SELECT table_name FROM all_tables 
      WHERE owner = 'MEDI' 
      AND (table_name LIKE '%GIA%' OR table_name LIKE '%DICHVU%' OR table_name LIKE '%VIENPHI%')
      ORDER BY table_name
    `);
    console.log(giaTables.rows?.map((r: any) => r.TABLE_NAME));

    // 3. Danh mục khoa phòng (DMKHOAPHONG or DMPK)
    const allDM = await conn.execute(`
      SELECT table_name FROM all_tables 
      WHERE owner = 'MEDI' 
      AND table_name LIKE 'DM%'
      ORDER BY table_name
    `);
    console.log("\n=== 3. TẤT CẢ BẢNG DM (Danh mục) ===");
    console.log(allDM.rows?.map((r: any) => r.TABLE_NAME));

    // 4. Xem QUANLY columns
    console.log("\n=== 4. CẤU TRÚC BẢNG MEDI.QUANLY ===");
    try {
      const qlCols = await conn.execute(`
        SELECT column_name, data_type, nullable 
        FROM all_tab_columns 
        WHERE owner = 'MEDI' AND table_name = 'QUANLY' 
        ORDER BY column_id
        FETCH FIRST 30 ROWS ONLY
      `);
      console.log(qlCols.rows);
    } catch(e: any) {
      console.log("Bảng QUANLY không tồn tại:", e.message);
    }

    // 5. Tìm bảng STT / queue
    console.log("\n=== 5. BẢNG STT / QUEUE ===");
    const sttTables = await conn.execute(`
      SELECT table_name FROM all_tables 
      WHERE owner = 'MEDI' 
      AND (table_name LIKE '%STT%' OR table_name LIKE '%QUEUE%' 
           OR table_name LIKE '%SOTHUTU%' OR table_name LIKE '%NUM%')
      ORDER BY table_name
    `);
    console.log(sttTables.rows?.map((r: any) => r.TABLE_NAME));

    // 6. Bảng G_SO_LUOT_KHAM_TRONG_NGAY
    console.log("\n=== 6. BẢNG G_SO_LUOT_KHAM_TRONG_NGAY ===");
    try {
      const gslk = await conn.execute(`SELECT * FROM MEDI.G_SO_LUOT_KHAM_TRONG_NGAY WHERE ROWNUM <= 5`);
      console.log(gslk.metaData?.map((m: any) => m.name));
      console.log(gslk.rows);
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

exploreMore();
