import { PrismaClient } from "@prisma/client";

const directUrl = process.env.DATABASE_URL_DIRECT;

if (!directUrl || directUrl.trim().length === 0) {
  console.error("DATABASE_URL_DIRECT must be defined to drop tables safely.");
  process.exit(1);
}

const prisma = new PrismaClient({ datasourceUrl: directUrl });

async function dropAllTables() {
  try {
    const tables = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname = 'public';`;

    if (!Array.isArray(tables) || tables.length === 0) {
      console.log("No tables found in public schema.");
      return;
    }

    for (const entry of tables) {
      const tableName = entry?.tablename;
      if (!tableName) {
        continue;
      }

      const dropStatement = `DROP TABLE IF EXISTS "${tableName}" CASCADE;`;
      await prisma.$executeRawUnsafe(dropStatement);
      console.log(`Dropped table ${tableName}`);
    }

    console.log("All public tables removed.");
  } catch (error) {
    console.error("Failed to drop tables", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

dropAllTables();
