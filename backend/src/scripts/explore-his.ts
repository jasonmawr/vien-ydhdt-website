import { initDatabase, getConnection } from "../shared/database";

async function exploreHISTables() {
  await initDatabase();
  const conn = await getConnection();
  try {
    // 1. Cấu trúc bảng HEN (Lịch hẹn)
    console.log("\n=== 1. CẤU TRÚC BẢNG MEDI.HEN ===");
    const henCols = await conn.execute(`
      SELECT column_name, data_type, data_length, nullable 
      FROM all_tab_columns 
      WHERE owner = 'MEDI' AND table_name = 'HEN' 
      ORDER BY column_id
    `);
    console.log(henCols.rows);

    // 2. Dữ liệu mẫu bảng HEN
    console.log("\n=== 2. DỮ LIỆU MẪU MEDI.HEN (10 dòng) ===");
    const henData = await conn.execute(`SELECT * FROM MEDI.HEN WHERE ROWNUM <= 10`);
    console.log(henData.metaData?.map((m: any) => m.name));
    console.log(henData.rows);

    // 3. Cấu trúc bảng BENHNHAN
    console.log("\n=== 3. CẤU TRÚC BẢNG MEDI.BENHNHAN (30 cột đầu) ===");
    const bnCols = await conn.execute(`
      SELECT column_name, data_type, data_length, nullable 
      FROM all_tab_columns 
      WHERE owner = 'MEDI' AND table_name = 'BENHNHAN' 
      ORDER BY column_id
      FETCH FIRST 40 ROWS ONLY
    `);
    console.log(bnCols.rows);

    // 4. Bảng BA_KHAMBENH
    console.log("\n=== 4. CẤU TRÚC BẢNG MEDI.BA_KHAMBENH ===");
    const baCols = await conn.execute(`
      SELECT column_name, data_type, data_length, nullable 
      FROM all_tab_columns 
      WHERE owner = 'MEDI' AND table_name = 'BA_KHAMBENH' 
      ORDER BY column_id
    `);
    console.log(baCols.rows);

    // 5. Kiểm tra bảng W_HEN và W_HENCT (có thể là bảng web)
    console.log("\n=== 5. CẤU TRÚC BẢNG MEDI.W_HEN ===");
    const whenCols = await conn.execute(`
      SELECT column_name, data_type, data_length, nullable 
      FROM all_tab_columns 
      WHERE owner = 'MEDI' AND table_name = 'W_HEN' 
      ORDER BY column_id
    `);
    console.log(whenCols.rows);

    console.log("\n=== 6. CẤU TRÚC BẢNG MEDI.W_HENCT ===");
    const whenctCols = await conn.execute(`
      SELECT column_name, data_type, data_length, nullable 
      FROM all_tab_columns 
      WHERE owner = 'MEDI' AND table_name = 'W_HENCT' 
      ORDER BY column_id
    `);
    console.log(whenctCols.rows);

    // 7. Xem dữ liệu mẫu W_HEN
    console.log("\n=== 7. DỮ LIỆU MẪU MEDI.W_HEN ===");
    const whenData = await conn.execute(`SELECT * FROM MEDI.W_HEN WHERE ROWNUM <= 5`);
    console.log(whenData.metaData?.map((m: any) => m.name));
    console.log(whenData.rows);

    // 8. Sequence liên quan
    console.log("\n=== 8. CÁC SEQUENCE LIÊN QUAN ĐẾN HEN/KHAM ===");
    const seqs = await conn.execute(`
      SELECT sequence_name FROM all_sequences 
      WHERE sequence_owner = 'MEDI' 
      AND (sequence_name LIKE '%HEN%' OR sequence_name LIKE '%KHAM%' OR sequence_name LIKE '%BN%')
    `);
    console.log(seqs.rows);

  } catch (err) {
    console.error("Lỗi:", err);
  } finally {
    await conn.close();
    process.exit(0);
  }
}

exploreHISTables();
