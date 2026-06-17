-- CreateIndex
CREATE INDEX "card_ownerships_owner_id_idx" ON "card_ownerships"("owner_id");

-- CreateIndex
CREATE INDEX "exchange_offers_listing_id_idx" ON "exchange_offers"("listing_id");

-- CreateIndex
CREATE INDEX "exchange_offers_proposer_id_idx" ON "exchange_offers"("proposer_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "points_histories_user_id_idx" ON "points_histories"("user_id");

-- CreateIndex
CREATE INDEX "random_boxes_user_id_idx" ON "random_boxes"("user_id");

-- CreateIndex
CREATE INDEX "transaction_histories_seller_id_idx" ON "transaction_histories"("seller_id");

-- CreateIndex
CREATE INDEX "transaction_histories_buyer_id_idx" ON "transaction_histories"("buyer_id");

-- CreateIndex
CREATE INDEX "transactions_seller_id_idx" ON "transactions"("seller_id");

-- CreateIndex
CREATE INDEX "transactions_price_idx" ON "transactions"("price" DESC);

-- CreateIndex
CREATE INDEX "transactions_created_at_idx" ON "transactions"("created_at" DESC);

-- CreateIndex
CREATE INDEX "transactions_price_id_idx" ON "transactions"("price" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "transactions_created_at_id_idx" ON "transactions"("created_at" DESC, "id" DESC);
