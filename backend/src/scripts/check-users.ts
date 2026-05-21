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
    console.log("✅ Connected to Oracle Database successfully!");
    
    // Check if WEB_USERS table exists and list columns/data
    try {
      const res = await conn.execute("SELECT * FROM WEB_USERS");
      console.log("WEB_USERS rows:", JSON.stringify(res.rows, null, 2));
    } catch (e: any) {
      console.error("Error querying WEB_USERS:", e.message);
    }
  } catch (err: any) {
    console.error("Connection error:", err.message);
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

main();
