DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'alias'
  ) THEN
    ALTER TABLE "User" RENAME COLUMN "alias" TO "displayName";
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'displayName'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "displayName" TEXT;
    UPDATE "User"
      SET "displayName" = COALESCE("name", split_part("email", '@', 1), 'Jugador')
      WHERE "displayName" IS NULL;
    ALTER TABLE "User" ALTER COLUMN "displayName" SET NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'User_alias_key'
  ) THEN
    DROP INDEX "User_alias_key";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'User_displayName_key'
  ) THEN
    DROP INDEX "User_displayName_key";
  END IF;
END $$;
