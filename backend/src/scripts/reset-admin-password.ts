import oracledb from "oracledb";
import bcrypt from "bcryptjs";

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

    const newPassword = "VienYDhdt@2026!";
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    const updateSql = `
      UPDATE WEB_USERS
      SET PASSWORD_HASH = :hash
      WHERE USERNAME = 'admin'
    `;
    
    const result = await conn.execute(updateSql, { hash }, { autoCommit: true });
    console.log("Update admin password result:", result);
    console.log(`✅ Admin password updated successfully to: ${newPassword}`);
  } catch (err: any) {
    console.error("Error resetting admin password:", err.message);
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

main();
