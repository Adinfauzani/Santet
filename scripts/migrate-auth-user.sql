-- Drop old FK constraints pointing to Users.User, recreate pointing to auth.user
-- Run this BEFORE prisma db push

DO $$
DECLARE
  fk RECORD;
BEGIN
  -- Drop all FKs referencing the old Users.User table
  FOR fk IN
    SELECT con.conname AS constraint_name,
           con.conrelid::regclass::text AS table_name
    FROM pg_catalog.pg_constraint con
    JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
    JOIN pg_catalog.pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE con.confrelid = '"Users"."User"'::regclass
      AND con.contype = 'f'
  LOOP
    EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT %I',
      split_part(fk.table_name, '.', 1),
      split_part(fk.table_name, '.', 2),
      fk.constraint_name);
  END LOOP;
END $$;

-- Drop old Users schema entirely
DROP TABLE IF EXISTS "Users"."User" CASCADE;
DROP SCHEMA IF EXISTS "Users" CASCADE;

-- Recreate FKs to auth.user
-- TeamMember
ALTER TABLE "Santai"."TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES auth."user"("id") ON DELETE CASCADE;

-- Project (creatorId)
ALTER TABLE "Santai"."Project" ADD CONSTRAINT "Project_creatorId_fkey"
  FOREIGN KEY ("creatorId") REFERENCES auth."user"("id") ON DELETE CASCADE;

-- Comment
ALTER TABLE "Santai"."Comment" ADD CONSTRAINT "Comment_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES auth."user"("id") ON DELETE CASCADE;

-- Idea
ALTER TABLE "Santai"."Idea" ADD CONSTRAINT "Idea_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES auth."user"("id") ON DELETE CASCADE;

-- Vote
ALTER TABLE "Santai"."Vote" ADD CONSTRAINT "Vote_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES auth."user"("id") ON DELETE CASCADE;

-- Contribution
ALTER TABLE "Santai"."Contribution" ADD CONSTRAINT "Contribution_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES auth."user"("id") ON DELETE CASCADE;
