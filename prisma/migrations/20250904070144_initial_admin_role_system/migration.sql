-- CreateEnum
CREATE TYPE "public"."AdminGrade" AS ENUM ('STAFF', 'SUPER_ADMIN');

-- CreateTable
CREATE TABLE "public"."AdminRole" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "adminGrade" "public"."AdminGrade" NOT NULL DEFAULT 'STAFF',
    "level" INTEGER NOT NULL DEFAULT 0,
    "permissions" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" UUID NOT NULL,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "aud" VARCHAR(255),
    "banned_until" TIMESTAMPTZ(6),
    "confirmation_sent_at" TIMESTAMPTZ(6),
    "confirmation_token" VARCHAR(255),
    "confirmed_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "email" VARCHAR(255),
    "email_change" VARCHAR(255),
    "email_change_confirm_status" SMALLINT DEFAULT 0,
    "email_change_sent_at" TIMESTAMPTZ(6),
    "email_change_token_current" VARCHAR(255) DEFAULT '',
    "email_change_token_new" VARCHAR(255),
    "email_confirmed_at" TIMESTAMPTZ(6),
    "encrypted_password" VARCHAR(255),
    "instance_id" UUID,
    "invited_at" TIMESTAMPTZ(6),
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "is_sso_user" BOOLEAN NOT NULL DEFAULT false,
    "is_super_admin" BOOLEAN,
    "last_sign_in_at" TIMESTAMPTZ(6),
    "phone" TEXT,
    "phone_change" TEXT DEFAULT '',
    "phone_change_sent_at" TIMESTAMPTZ(6),
    "phone_change_token" VARCHAR(255) DEFAULT '',
    "phone_confirmed_at" TIMESTAMPTZ(6),
    "raw_app_meta_data" JSONB,
    "raw_user_meta_data" JSONB,
    "reauthentication_sent_at" TIMESTAMPTZ(6),
    "reauthentication_token" VARCHAR(255) DEFAULT '',
    "recovery_sent_at" TIMESTAMPTZ(6),
    "recovery_token" VARCHAR(255),
    "role" VARCHAR(255),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserRole" (
    "id" SERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "roleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminRole_name_key" ON "public"."AdminRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "public"."User"("phone");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "public"."UserRole"("roleId");

-- CreateIndex
CREATE INDEX "UserRole_userId_idx" ON "public"."UserRole"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "public"."UserRole"("userId", "roleId");

-- AddForeignKey
ALTER TABLE "public"."UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."AdminRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
