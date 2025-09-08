/*
  Warnings:

  - The values [HOSPITAL,DOCTOR,PRODUCT,REVIEW] on the enum `CategoryType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."CategoryType_new" AS ENUM ('PART', 'PROCEDURE');
ALTER TABLE "public"."Category" ALTER COLUMN "categoryType" TYPE "public"."CategoryType_new" USING ("categoryType"::text::"public"."CategoryType_new");
ALTER TYPE "public"."CategoryType" RENAME TO "CategoryType_old";
ALTER TYPE "public"."CategoryType_new" RENAME TO "CategoryType";
DROP TYPE "public"."CategoryType_old";
COMMIT;
