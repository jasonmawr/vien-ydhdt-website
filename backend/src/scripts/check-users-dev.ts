import dotenv from "dotenv";
dotenv.config();
import { initDatabase, getConnection } from "../shared/database";

async function main() {
  await initDatabase();
  const conn = await getConnection();
  try {
    console.log("✅ Connected to Oracle Database successfully!");
    
    // Check if WEB_USERS table exists and list columns/data
    try {
      const res = await conn.execute("SELECT ID, USERNAME, PASSWORD_HASH, ROLE FROM WEB_USERS");
      console.log("WEB_USERS rows:", JSON.stringify(res.rows, null, 2));
    } catch (e: any) {
      console.error("Error querying WEB_USERS:", e.message);
    }
  } catch (err: any) {
    console.error("Connection error:", err.message);
  } finally {
    await conn.close();
  }
}

main();
