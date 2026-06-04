-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('local', 'google');

-- CreateEnum
CREATE TYPE "CardGrade" AS ENUM ('COMMON', 'RARE', 'SUPER_RARE', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "CardGenre" AS ENUM ('앨범', '특전', '팬싸', '시즌그리팅', '팬미팅', '콘서트', 'MD', '콜라보', '팬클럽', '기타');

-- CreateEnum
CREATE TYPE "OwnershipStatus" AS ENUM ('IN_GALLERY', 'ON_SALE', 'ON_EXCHANGE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('EXCHANGE_OFFER', 'EXCHANGE_ACCEPTED', 'EXCHANGE_REJECTED', 'PURCHASE_COMPLETED', 'SALE_COMPLETED', 'SOLD_OUT');

-- CreateEnum
CREATE TYPE "PointHistoryType" AS ENUM ('RANDOM_BOX', 'PURCHASE', 'SALE');

-- CreateEnum
CREATE TYPE "TransactionHistoryType" AS ENUM ('EXCHANGE', 'TRADE');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "provider" "Provider" NOT NULL DEFAULT 'local',
    "provider_id" TEXT,
    "refresh_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" SERIAL NOT NULL,
    "creator_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "description" TEXT,
    "grade" "CardGrade" NOT NULL,
    "genre" "CardGenre" NOT NULL,
    "minimum_price" INTEGER NOT NULL,
    "total_quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_ownerships" (
    "id" SERIAL NOT NULL,
    "card_id" INTEGER NOT NULL,
    "owner_id" UUID NOT NULL,
    "purchase_price" INTEGER NOT NULL,
    "status" "OwnershipStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_ownerships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "seller_id" UUID NOT NULL,
    "card_id" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "total_quantity" INTEGER NOT NULL,
    "remaining_quantity" INTEGER NOT NULL,
    "exchange_grade" "CardGrade" NOT NULL,
    "exchange_genre" "CardGenre" NOT NULL,
    "exchange_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_offers" (
    "id" SERIAL NOT NULL,
    "listing_id" INTEGER NOT NULL,
    "proposer_id" UUID NOT NULL,
    "offered_card_id" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "exchange_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_points" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points_histories" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "PointHistoryType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "points_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "random_boxes" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "earned_points" INTEGER NOT NULL,
    "last_opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "random_boxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_histories" (
    "id" SERIAL NOT NULL,
    "seller_id" UUID NOT NULL,
    "buyer_id" UUID NOT NULL,
    "card_id" INTEGER NOT NULL,
    "type" "TransactionHistoryType" NOT NULL,
    "price" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_nickname_key" ON "users"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "user_points_user_id_key" ON "user_points"("user_id");

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_ownerships" ADD CONSTRAINT "card_ownerships_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_ownerships" ADD CONSTRAINT "card_ownerships_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "card_ownerships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_offers" ADD CONSTRAINT "exchange_offers_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_offers" ADD CONSTRAINT "exchange_offers_proposer_id_fkey" FOREIGN KEY ("proposer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_offers" ADD CONSTRAINT "exchange_offers_offered_card_id_fkey" FOREIGN KEY ("offered_card_id") REFERENCES "card_ownerships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_points" ADD CONSTRAINT "user_points_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points_histories" ADD CONSTRAINT "points_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "random_boxes" ADD CONSTRAINT "random_boxes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_histories" ADD CONSTRAINT "transaction_histories_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_histories" ADD CONSTRAINT "transaction_histories_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_histories" ADD CONSTRAINT "transaction_histories_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "card_ownerships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
