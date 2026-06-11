-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "cityId" INTEGER,
ADD COLUMN     "districtId" INTEGER,
ADD COLUMN     "kecamatan" TEXT,
ADD COLUMN     "provinceId" INTEGER,
ADD COLUMN     "provinsi" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "weight" INTEGER NOT NULL DEFAULT 500;
