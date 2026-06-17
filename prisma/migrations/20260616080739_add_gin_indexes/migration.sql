/*
  Warnings:

  - A unique constraint covering the columns `[nickname]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateIndex
CREATE INDEX "cards_title_idx" ON "cards" USING GIN ("title" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "cards_description_idx" ON "cards" USING GIN ("description" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "transactions_exchange_description_idx" ON "transactions" USING GIN ("exchange_description" gin_trgm_ops);

-- CreateIndex
CREATE UNIQUE INDEX "users_nickname_key" ON "users"("nickname");

-- CreateIndex
CREATE INDEX "users_provider_id_idx" ON "users"("provider_id");

-- CreateIndex
CREATE INDEX "users_refresh_token_idx" ON "users"("refresh_token");

-- CreateIndex
CREATE INDEX "users_nickname_idx" ON "users" USING GIN ("nickname" gin_trgm_ops);
