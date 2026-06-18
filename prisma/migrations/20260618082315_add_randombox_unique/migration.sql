/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `random_boxes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "random_boxes_user_id_idx";

-- CreateIndex
CREATE UNIQUE INDEX "random_boxes_user_id_key" ON "random_boxes"("user_id");
