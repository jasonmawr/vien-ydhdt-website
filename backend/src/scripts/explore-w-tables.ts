import { getConnection, initDatabase } from "../shared/database";

async function main() {
  await initDatabase();
  const conn = await getConnection();
  try {
    const r1 = await conn.execute(`SELECT * FROM MEDI.W_LOGIN WHERE ROWNUM=1`);
    console.log("W_LOGIN:", r1.rows);
    const r2 = await conn.execute(`SELECT * FROM MEDI.W_HEN WHERE ROWNUM=1`);
    console.log("W_HEN:", r2.rows);
    const r3 = await conn.execute(`SELECT * FROM MEDI.W_HENCT WHERE ROWNUM=1`);
    console.log("W_HENCT:", r3.rows);
    const r4 = await conn.execute(`SELECT * FROM MEDI.TBL_STTKHAM WHERE ROWNUM=1`);
    console.log("TBL_STTKHAM:", r4.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await conn.close();
  }
}

main();
