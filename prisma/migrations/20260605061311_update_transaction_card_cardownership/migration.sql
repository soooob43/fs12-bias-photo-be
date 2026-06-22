-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_card_id_fkey";

-- AlterTable
ALTER TABLE "card_ownerships" ADD COLUMN     "transaction_id" INTEGER;

-- AddForeignKey
ALTER TABLE "card_ownerships" ADD CONSTRAINT "card_ownerships_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
