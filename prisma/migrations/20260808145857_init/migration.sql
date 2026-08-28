/*
  Warnings:

  - A unique constraint covering the columns `[sku]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "RestockType" AS ENUM ('MASUK', 'KELUAR');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'DIKEMBALIKAN';

-- DropForeignKey
ALTER TABLE "CashierShift" DROP CONSTRAINT "CashierShift_kasirId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productVariantId_fkey";

-- AlterTable
ALTER TABLE "CashierShift" ALTER COLUMN "kasirId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "dikemasAt" TIMESTAMP(3),
ADD COLUMN     "dikirimAt" TIMESTAMP(3),
ADD COLUMN     "selesaiAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "productVariantId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "midtrans_payment_type" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "colorTags" TEXT,
ADD COLUMN     "descriptionImageUrl" TEXT,
ADD COLUMN     "promoPrice" INTEGER,
ADD COLUMN     "sku" TEXT;

-- AlterTable
ALTER TABLE "Restock" ADD COLUMN     "catatan" TEXT,
ADD COLUMN     "tipe" "RestockType" NOT NULL DEFAULT 'MASUK';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "no_telepon" TEXT NOT NULL DEFAULT '-';

-- CreateTable
CREATE TABLE "ReturnRequest" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "alasan" TEXT NOT NULL,
    "keterangan" TEXT,
    "bukti_url" TEXT,
    "resi" TEXT,
    "status" TEXT NOT NULL DEFAULT 'MENUNGGU',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReturnRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "returnRequestId" INTEGER NOT NULL,

    CONSTRAINT "ReturnImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" SERIAL NOT NULL,
    "cartId" INTEGER NOT NULL,
    "productVariantId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReturnRequest_orderId_key" ON "ReturnRequest"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_key" ON "Cart"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productVariantId_key" ON "CartItem"("cartId", "productVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnImage" ADD CONSTRAINT "ReturnImage_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES "ReturnRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashierShift" ADD CONSTRAINT "CashierShift_kasirId_fkey" FOREIGN KEY ("kasirId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
