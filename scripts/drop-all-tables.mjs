import { Client } from "pg";

const connectionString =
  process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;

if (!connectionString || connectionString.trim().length === 0) {
  console.error(
    "DATABASE_URL_DIRECT or DATABASE_URL must be defined to drop tables safely.",
  );
  process.exit(1);
}

const client = new Client({ connectionString });

async function dropAllTables() {
  try {
    await client.connect();

    const result = await client.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public';",
    );

    if (!result.rows || result.rows.length === 0) {
      console.log("No tables found in public schema.");
      return;
    }

    for (const row of result.rows) {
      const tableName = row.tablename;
      if (!tableName) {
        continue;
      }

      await client.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
      console.log(`Dropped table ${tableName}`);
    }

    console.log("All public tables removed.");
  } catch (error) {
    console.error("Failed to drop tables", error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

dropAllTables();
