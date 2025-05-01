import { sql } from "drizzle-orm";
import { db } from "../db";

async function checkSchema() {
  try {
    // Check journeys table schema
    console.log("Checking journeys table schema...");
    const journeysSchema = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'journeys'
      ORDER BY ordinal_position;
    `);
    console.log(JSON.stringify(journeysSchema, null, 2));

    // Check activities table schema
    console.log("\nChecking activities table schema...");
    const activitiesSchema = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'activities'
      ORDER BY ordinal_position;
    `);
    console.log(JSON.stringify(activitiesSchema, null, 2));

    process.exit(0);
  } catch (error) {
    console.error("Error checking schema:", error);
    process.exit(1);
  }
}

checkSchema();
