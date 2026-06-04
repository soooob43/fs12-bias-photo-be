-- DropIndex
DROP INDEX "users_nickname_key";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;
