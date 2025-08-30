-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "shippingCity" TEXT,
ADD COLUMN     "shippingPostalCode" TEXT,
ADD COLUMN     "shippingProvince" TEXT,
ADD COLUMN     "shippingStreet" TEXT;
