/*
  Warnings:

  - A unique constraint covering the columns `[invitationCodeId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."InvitationCodeKind" AS ENUM ('VIP', 'PAYMENT_REFERENCE');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "invitationCodeId" UUID;

-- CreateTable
CREATE TABLE "public"."InvitationCode" (
    "id" UUID NOT NULL,
    "code" VARCHAR(255) NOT NULL,
    "kind" "public"."InvitationCodeKind" NOT NULL,
    "expiresAt" TIMESTAMPTZ(6),
    "usedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvitationCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvitationCode_code_key" ON "public"."InvitationCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_invitationCodeId_key" ON "public"."User"("invitationCodeId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_invitationCodeId_fkey" FOREIGN KEY ("invitationCodeId") REFERENCES "public"."InvitationCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
