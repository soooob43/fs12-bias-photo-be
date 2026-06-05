-- DropForeignKey
ALTER TABLE "card_ownerships" DROP CONSTRAINT "card_ownerships_card_id_fkey";

-- DropForeignKey
ALTER TABLE "card_ownerships" DROP CONSTRAINT "card_ownerships_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "exchange_offers" DROP CONSTRAINT "exchange_offers_listing_id_fkey";

-- DropForeignKey
ALTER TABLE "exchange_offers" DROP CONSTRAINT "exchange_offers_offered_card_id_fkey";

-- DropForeignKey
ALTER TABLE "exchange_offers" DROP CONSTRAINT "exchange_offers_proposer_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "points_histories" DROP CONSTRAINT "points_histories_user_id_fkey";

-- DropForeignKey
ALTER TABLE "random_boxes" DROP CONSTRAINT "random_boxes_user_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_seller_id_fkey";

-- AddForeignKey
ALTER TABLE "card_ownerships" ADD CONSTRAINT "card_ownerships_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_ownerships" ADD CONSTRAINT "card_ownerships_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_offers" ADD CONSTRAINT "exchange_offers_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_offers" ADD CONSTRAINT "exchange_offers_proposer_id_fkey" FOREIGN KEY ("proposer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_offers" ADD CONSTRAINT "exchange_offers_offered_card_id_fkey" FOREIGN KEY ("offered_card_id") REFERENCES "card_ownerships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points_histories" ADD CONSTRAINT "points_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "random_boxes" ADD CONSTRAINT "random_boxes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
