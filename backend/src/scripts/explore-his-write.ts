import { getConnection, initDatabase } from "../shared/database";

async function main() {
  await initDatabase();
  const conn = await getConnection();
  try {
    console.log("--- TÌM HIỂU BẢNG W_HEN ---");
    const searchTables = await conn.execute(`
      SELECT table_name FROM all_tables WHERE owner = 'MEDI' AND (
        table_name LIKE '%HEN%' OR 
        table_name LIKE '%DATKHAM%' OR 
        table_name LIKE '%ONLINE%' OR
        table_name LIKE 'DK%'
      )
    `);
    console.log("Các bảng có khả năng chứa Lịch hẹn:", searchTables.rows);

    console.log("--- TÌM HIỂU BẢNG TIEPDON ---");
    const tiepdonCols = await conn.execute(`
      SELECT column_name, data_type, data_length, nullable 
      FROM all_tab_columns 
      WHERE table_name = 'TIEPDON' AND owner = 'MEDI'
    `);
    // Chỉ in ra 10 cột đầu tiên để tránh console quá dài
    console.log("Số cột TIEPDON:", tiepdonCols.rows?.length);
    console.table(tiepdonCols.rows?.slice(0, 15));

    // Thử xem 1 dòng mẫu trong W_HEN
    const sampleWhen = await conn.execute(`SELECT * FROM MEDI.W_HEN WHERE ROWNUM = 1`);
    console.log("Mẫu dữ liệu W_HEN:", sampleWhen.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await conn.close();
    process.exit(0);
  }
}

main();
