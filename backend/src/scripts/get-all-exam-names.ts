import oracledb from "oracledb";
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const config = {
  user: "system",
  password: "hssmedi123a",
  connectString: "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=192.168.1.113)(PORT=1521))(CONNECT_DATA=(SID=medi)))",
};

async function main() {
  let conn;
  try {
    conn = await oracledb.getConnection(config);
    const res = await conn.execute(`
      SELECT DISTINCT TEN
      FROM MEDI.V_GIAVP
      WHERE UPPER(TEN) LIKE 'KHÁM%' OR UPPER(TEN) LIKE 'KHAM%'
    `);
    console.log("Distinct exam names in production DB:", JSON.stringify(res.rows, null, 2));
  } catch (err: any) {
    console.error("Error:", err.message);
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

main();
