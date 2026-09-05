import * as dotenv from "dotenv";
import { join } from "path";

dotenv.config({ path: join(__dirname, "../../../.env.local") });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema: { users } });

  console.log("Ensuring database schema is up to date...");
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;`;
  await sql`ALTER TABLE users ALTER COLUMN email DROP NOT NULL;`;

  console.log("Seeding database...");

  const existing = await db.select().from(users).where(eq(users.username, "dhaafinm")).limit(1);

  if (existing.length > 0) {
    console.log("User 'dhaafinm' already exists. Updating user data...");
    await db
      .update(users)
      .set({
        name: "Dhaafin Makhalingga",
        passwordHash: "dhaafin5758",
        updatedAt: new Date(),
      })
      .where(eq(users.username, "dhaafinm"));
    console.log("User 'dhaafinm' updated successfully!");
  } else {
    console.log("Creating user 'dhaafinm'...");
    await db.insert(users).values({
      username: "dhaafinm",
      name: "Dhaafin Makhalingga",
      passwordHash: "dhaafin5758",
    });
    console.log("User 'dhaafinm' created successfully!");
  }
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
