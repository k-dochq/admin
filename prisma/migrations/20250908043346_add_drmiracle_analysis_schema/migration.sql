-- CreateEnum
CREATE TYPE "public"."UserRoleType" AS ENUM ('PATIENT', 'DOCTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."UserGenderType" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."UserLocale" AS ENUM ('ko_KR', 'en_US', 'th_TH');

-- CreateEnum
CREATE TYPE "public"."UserStatusType" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "public"."DoctorApprovalStatusType" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."DoctorGenderType" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "public"."HospitalApprovalStatusType" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."DistrictCountryCode" AS ENUM ('KR', 'TH');

-- CreateEnum
CREATE TYPE "public"."CategoryType" AS ENUM ('HOSPITAL', 'DOCTOR', 'PRODUCT', 'REVIEW');

-- CreateEnum
CREATE TYPE "public"."BookmarkType" AS ENUM ('HOSPITAL', 'DOCTOR', 'PRODUCT', 'REVIEW');

-- CreateEnum
CREATE TYPE "public"."BookmarkEntityType" AS ENUM ('HOSPITAL', 'DOCTOR', 'PRODUCT', 'REVIEW');

-- CreateEnum
CREATE TYPE "public"."ContentType" AS ENUM ('IMAGE', 'VIDEO', 'TEXT', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "public"."HospitalContentType" AS ENUM ('MAIN_IMAGE', 'GALLERY', 'CERTIFICATE', 'FACILITY');

-- CreateEnum
CREATE TYPE "public"."DoctorContentType" AS ENUM ('PROFILE_IMAGE', 'CERTIFICATE', 'EXPERIENCE');

-- CreateEnum
CREATE TYPE "public"."ProductContentType" AS ENUM ('MAIN_IMAGE', 'DETAIL_IMAGE', 'BEFORE_AFTER');

-- CreateEnum
CREATE TYPE "public"."ReviewContentType" AS ENUM ('BEFORE_IMAGE', 'AFTER_IMAGE', 'REVIEW_IMAGE');

-- CreateEnum
CREATE TYPE "public"."AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."AppointmentGenderType" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ConsultingStatusType" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ConsultingTimeType" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING');

-- CreateEnum
CREATE TYPE "public"."ConsultingGenderType" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PaymentType" AS ENUM ('CREDIT_CARD', 'BANK_TRANSFER', 'POINT', 'CASH');

-- CreateEnum
CREATE TYPE "public"."PointChargeStatusType" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."PointUsageStatusType" AS ENUM ('COMPLETED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PointUsageEntityType" AS ENUM ('APPOINTMENT', 'PRODUCT', 'CONSULTING');

-- CreateEnum
CREATE TYPE "public"."ProductApprovalStatusType" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."AdvertisementApprovalStatusType" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."AdvertisementType" AS ENUM ('BANNER', 'POPUP', 'INLINE');

-- CreateEnum
CREATE TYPE "public"."CommunityType" AS ENUM ('GENERAL', 'QNA', 'REVIEW', 'EVENT');

-- CreateEnum
CREATE TYPE "public"."ChatUserType" AS ENUM ('USER', 'DOCTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."ChatRoomUserType" AS ENUM ('MEMBER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."UserLikeEntityType" AS ENUM ('HOSPITAL', 'DOCTOR', 'PRODUCT', 'REVIEW', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "public"."UserReportEntityType" AS ENUM ('USER', 'HOSPITAL', 'DOCTOR', 'PRODUCT', 'REVIEW', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "public"."UserReportStatusType" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "public"."District" (
    "id" UUID NOT NULL,
    "name" JSONB NOT NULL,
    "countryCode" "public"."DistrictCountryCode" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" UUID NOT NULL,
    "name" JSONB NOT NULL,
    "categoryType" "public"."CategoryType" NOT NULL,
    "description" TEXT,
    "order" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HospitalInfo" (
    "id" UUID NOT NULL,
    "info" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HospitalInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HospitalProperty" (
    "id" UUID NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HospitalProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Hospital" (
    "id" UUID NOT NULL,
    "name" JSONB NOT NULL,
    "address" JSONB NOT NULL,
    "directions" JSONB,
    "phoneNumber" VARCHAR(20),
    "description" JSONB,
    "openingHours" JSONB,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "productCount" INTEGER NOT NULL DEFAULT 0,
    "bookmarkCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "point" INTEGER NOT NULL DEFAULT 0,
    "email" VARCHAR(255),
    "subPhoneNumbers" JSONB NOT NULL DEFAULT '[]',
    "lineId" VARCHAR(255),
    "memo" TEXT,
    "reviewUrl" TEXT,
    "settings" JSONB,
    "enableJp" BOOLEAN NOT NULL DEFAULT false,
    "prices" JSONB,
    "ranking" INTEGER,
    "discountRate" DOUBLE PRECISION,
    "approvalStatusType" "public"."HospitalApprovalStatusType" NOT NULL DEFAULT 'APPROVED',
    "rejectReason" TEXT,
    "baseId" UUID,
    "hasClone" BOOLEAN NOT NULL DEFAULT false,
    "districtId" UUID,
    "hospitalInfoId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hospital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Doctor" (
    "id" UUID NOT NULL,
    "name" JSONB NOT NULL,
    "position" JSONB,
    "licenseNumber" VARCHAR(50),
    "licenseDate" TIMESTAMP(3),
    "description" VARCHAR(500),
    "genderType" "public"."DoctorGenderType" NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "bookmarkCount" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER,
    "stop" BOOLEAN NOT NULL DEFAULT false,
    "approvalStatusType" "public"."DoctorApprovalStatusType" NOT NULL DEFAULT 'APPROVED',
    "rejectReason" TEXT,
    "baseId" UUID,
    "hasClone" BOOLEAN NOT NULL DEFAULT false,
    "hospitalId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" UUID NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB,
    "price" INTEGER,
    "discountPrice" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "bookmarkCount" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER,
    "approvalStatusType" "public"."ProductApprovalStatusType" NOT NULL DEFAULT 'APPROVED',
    "rejectReason" TEXT,
    "baseId" UUID,
    "hasClone" BOOLEAN NOT NULL DEFAULT false,
    "hospitalId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Review" (
    "id" UUID NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "title" JSONB,
    "content" JSONB,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "userId" UUID NOT NULL,
    "hospitalId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Appointment" (
    "id" UUID NOT NULL,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "status" "public"."AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "genderType" "public"."AppointmentGenderType",
    "age" INTEGER,
    "phoneNumber" VARCHAR(20),
    "userId" UUID NOT NULL,
    "hospitalId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Consulting" (
    "id" UUID NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "status" "public"."ConsultingStatusType" NOT NULL DEFAULT 'PENDING',
    "timeType" "public"."ConsultingTimeType",
    "genderType" "public"."ConsultingGenderType",
    "age" INTEGER,
    "phoneNumber" VARCHAR(20),
    "consultingDate" TIMESTAMP(3),
    "locale" "public"."UserLocale" NOT NULL DEFAULT 'ko_KR',
    "userId" UUID NOT NULL,
    "hospitalId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consulting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "type" "public"."PaymentType" NOT NULL,
    "paymentKey" TEXT,
    "orderId" TEXT,
    "currency" TEXT DEFAULT 'KRW',
    "userId" UUID NOT NULL,
    "hospitalId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PointChargeHistory" (
    "id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "public"."PointChargeStatusType" NOT NULL DEFAULT 'PENDING',
    "paymentKey" TEXT,
    "orderId" TEXT,
    "hospitalId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PointChargeHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PointUsageHistory" (
    "id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "public"."PointUsageStatusType" NOT NULL DEFAULT 'COMPLETED',
    "entityType" "public"."PointUsageEntityType" NOT NULL,
    "entityId" UUID,
    "hospitalId" UUID NOT NULL,
    "productId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PointUsageHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Advertisement" (
    "id" UUID NOT NULL,
    "title" JSONB NOT NULL,
    "description" JSONB,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "approvalStatusType" "public"."AdvertisementApprovalStatusType" NOT NULL DEFAULT 'PENDING',
    "rejectReason" TEXT,
    "locale" "public"."UserLocale" NOT NULL DEFAULT 'ko_KR',
    "hospitalId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Advertisement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Community" (
    "id" UUID NOT NULL,
    "title" JSONB NOT NULL,
    "content" JSONB,
    "communityType" "public"."CommunityType" NOT NULL DEFAULT 'GENERAL',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "isNotice" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "locale" "public"."UserLocale" NOT NULL DEFAULT 'ko_KR',
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Community_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Chat" (
    "id" UUID NOT NULL,
    "title" TEXT,
    "userType" "public"."ChatUserType" NOT NULL DEFAULT 'USER',
    "locale" "public"."UserLocale" NOT NULL DEFAULT 'ko_KR',
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatRoom" (
    "id" UUID NOT NULL,
    "name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "chatId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CarService" (
    "id" UUID NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB,
    "price" INTEGER,
    "duration" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CarServiceSlot" (
    "id" UUID NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "carServiceId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarServiceSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CarServiceAppointment" (
    "id" UUID NOT NULL,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "status" "public"."AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "carServiceId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarServiceAppointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AiReport" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "score" DOUBLE PRECISION,
    "reportType" TEXT,
    "hospitalId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SearchHistory" (
    "id" UUID NOT NULL,
    "searchTerm" TEXT NOT NULL,
    "searchCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HospitalCategoryMap" (
    "hospitalId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HospitalCategoryMap_pkey" PRIMARY KEY ("hospitalId","categoryId")
);

-- CreateTable
CREATE TABLE "public"."DoctorCategoryMap" (
    "doctorId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoctorCategoryMap_pkey" PRIMARY KEY ("doctorId","categoryId")
);

-- CreateTable
CREATE TABLE "public"."ProductCategoryMap" (
    "productId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductCategoryMap_pkey" PRIMARY KEY ("productId","categoryId")
);

-- CreateTable
CREATE TABLE "public"."ReviewCategoryMap" (
    "reviewId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewCategoryMap_pkey" PRIMARY KEY ("reviewId","categoryId")
);

-- CreateTable
CREATE TABLE "public"."HospitalPropertyMap" (
    "hospitalId" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "value" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HospitalPropertyMap_pkey" PRIMARY KEY ("hospitalId","propertyId")
);

-- CreateTable
CREATE TABLE "public"."HospitalContent" (
    "id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "contentType" "public"."ContentType" NOT NULL,
    "hospitalContentType" "public"."HospitalContentType" NOT NULL,
    "locale" "public"."UserLocale" NOT NULL DEFAULT 'ko_KR',
    "title" TEXT,
    "description" TEXT,
    "order" INTEGER,
    "hospitalId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HospitalContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DoctorContent" (
    "id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "contentType" "public"."ContentType" NOT NULL,
    "doctorContentType" "public"."DoctorContentType" NOT NULL,
    "locale" "public"."UserLocale" NOT NULL DEFAULT 'ko_KR',
    "title" TEXT,
    "description" TEXT,
    "order" INTEGER,
    "doctorId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductContent" (
    "id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "contentType" "public"."ContentType" NOT NULL,
    "productContentType" "public"."ProductContentType" NOT NULL,
    "locale" "public"."UserLocale" NOT NULL DEFAULT 'ko_KR',
    "title" TEXT,
    "description" TEXT,
    "order" INTEGER,
    "productId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReviewContent" (
    "id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "contentType" "public"."ContentType" NOT NULL,
    "reviewContentType" "public"."ReviewContentType" NOT NULL,
    "locale" "public"."UserLocale" NOT NULL DEFAULT 'ko_KR',
    "title" TEXT,
    "description" TEXT,
    "order" INTEGER,
    "reviewId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunityContent" (
    "id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "contentType" "public"."ContentType" NOT NULL,
    "locale" "public"."UserLocale" NOT NULL DEFAULT 'ko_KR',
    "title" TEXT,
    "description" TEXT,
    "order" INTEGER,
    "communityId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdvertisementContent" (
    "id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "contentType" "public"."ContentType" NOT NULL,
    "locale" "public"."UserLocale" NOT NULL DEFAULT 'ko_KR',
    "title" TEXT,
    "description" TEXT,
    "order" INTEGER,
    "advertisementId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdvertisementContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdvertisementProduct" (
    "id" UUID NOT NULL,
    "advertisementType" "public"."AdvertisementType" NOT NULL DEFAULT 'BANNER',
    "locale" "public"."UserLocale" NOT NULL DEFAULT 'ko_KR',
    "order" INTEGER,
    "advertisementId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdvertisementProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatContent" (
    "id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "contentType" "public"."ContentType" NOT NULL DEFAULT 'TEXT',
    "locale" "public"."UserLocale" NOT NULL DEFAULT 'ko_KR',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "chatId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatRoomUser" (
    "id" UUID NOT NULL,
    "userType" "public"."ChatRoomUserType" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "chatRoomId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatRoomUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunityThread" (
    "id" UUID NOT NULL,
    "content" JSONB NOT NULL,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "communityId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReviewThread" (
    "id" UUID NOT NULL,
    "content" JSONB NOT NULL,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "reviewId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Bookmark" (
    "id" UUID NOT NULL,
    "entityType" "public"."BookmarkEntityType" NOT NULL,
    "entityId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserLike" (
    "id" UUID NOT NULL,
    "entityType" "public"."UserLikeEntityType" NOT NULL,
    "entityId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserReport" (
    "id" UUID NOT NULL,
    "entityType" "public"."UserReportEntityType" NOT NULL,
    "entityId" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "public"."UserReportStatusType" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hospital_email_key" ON "public"."Hospital"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Hospital_hospitalInfoId_key" ON "public"."Hospital"("hospitalInfoId");

-- CreateIndex
CREATE INDEX "Hospital_districtId_idx" ON "public"."Hospital"("districtId");

-- CreateIndex
CREATE INDEX "Hospital_baseId_idx" ON "public"."Hospital"("baseId");

-- CreateIndex
CREATE INDEX "Doctor_hospitalId_idx" ON "public"."Doctor"("hospitalId");

-- CreateIndex
CREATE INDEX "Doctor_baseId_idx" ON "public"."Doctor"("baseId");

-- CreateIndex
CREATE INDEX "Product_hospitalId_idx" ON "public"."Product"("hospitalId");

-- CreateIndex
CREATE INDEX "Product_baseId_idx" ON "public"."Product"("baseId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "public"."Review"("userId");

-- CreateIndex
CREATE INDEX "Review_hospitalId_idx" ON "public"."Review"("hospitalId");

-- CreateIndex
CREATE INDEX "Appointment_userId_idx" ON "public"."Appointment"("userId");

-- CreateIndex
CREATE INDEX "Appointment_hospitalId_idx" ON "public"."Appointment"("hospitalId");

-- CreateIndex
CREATE INDEX "Consulting_userId_idx" ON "public"."Consulting"("userId");

-- CreateIndex
CREATE INDEX "Consulting_hospitalId_idx" ON "public"."Consulting"("hospitalId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentKey_key" ON "public"."Payment"("paymentKey");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "public"."Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "public"."Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_hospitalId_idx" ON "public"."Payment"("hospitalId");

-- CreateIndex
CREATE UNIQUE INDEX "PointChargeHistory_orderId_key" ON "public"."PointChargeHistory"("orderId");

-- CreateIndex
CREATE INDEX "PointChargeHistory_hospitalId_idx" ON "public"."PointChargeHistory"("hospitalId");

-- CreateIndex
CREATE INDEX "PointUsageHistory_hospitalId_idx" ON "public"."PointUsageHistory"("hospitalId");

-- CreateIndex
CREATE INDEX "PointUsageHistory_productId_idx" ON "public"."PointUsageHistory"("productId");

-- CreateIndex
CREATE INDEX "Advertisement_hospitalId_idx" ON "public"."Advertisement"("hospitalId");

-- CreateIndex
CREATE INDEX "Community_userId_idx" ON "public"."Community"("userId");

-- CreateIndex
CREATE INDEX "ChatRoom_chatId_idx" ON "public"."ChatRoom"("chatId");

-- CreateIndex
CREATE INDEX "CarServiceSlot_carServiceId_idx" ON "public"."CarServiceSlot"("carServiceId");

-- CreateIndex
CREATE INDEX "CarServiceAppointment_carServiceId_idx" ON "public"."CarServiceAppointment"("carServiceId");

-- CreateIndex
CREATE INDEX "AiReport_hospitalId_idx" ON "public"."AiReport"("hospitalId");

-- CreateIndex
CREATE INDEX "HospitalCategoryMap_hospitalId_idx" ON "public"."HospitalCategoryMap"("hospitalId");

-- CreateIndex
CREATE INDEX "HospitalCategoryMap_categoryId_idx" ON "public"."HospitalCategoryMap"("categoryId");

-- CreateIndex
CREATE INDEX "DoctorCategoryMap_doctorId_idx" ON "public"."DoctorCategoryMap"("doctorId");

-- CreateIndex
CREATE INDEX "DoctorCategoryMap_categoryId_idx" ON "public"."DoctorCategoryMap"("categoryId");

-- CreateIndex
CREATE INDEX "ProductCategoryMap_productId_idx" ON "public"."ProductCategoryMap"("productId");

-- CreateIndex
CREATE INDEX "ProductCategoryMap_categoryId_idx" ON "public"."ProductCategoryMap"("categoryId");

-- CreateIndex
CREATE INDEX "ReviewCategoryMap_reviewId_idx" ON "public"."ReviewCategoryMap"("reviewId");

-- CreateIndex
CREATE INDEX "ReviewCategoryMap_categoryId_idx" ON "public"."ReviewCategoryMap"("categoryId");

-- CreateIndex
CREATE INDEX "HospitalPropertyMap_hospitalId_idx" ON "public"."HospitalPropertyMap"("hospitalId");

-- CreateIndex
CREATE INDEX "HospitalPropertyMap_propertyId_idx" ON "public"."HospitalPropertyMap"("propertyId");

-- CreateIndex
CREATE INDEX "HospitalContent_hospitalId_idx" ON "public"."HospitalContent"("hospitalId");

-- CreateIndex
CREATE INDEX "DoctorContent_doctorId_idx" ON "public"."DoctorContent"("doctorId");

-- CreateIndex
CREATE INDEX "ProductContent_productId_idx" ON "public"."ProductContent"("productId");

-- CreateIndex
CREATE INDEX "ReviewContent_reviewId_idx" ON "public"."ReviewContent"("reviewId");

-- CreateIndex
CREATE INDEX "CommunityContent_communityId_idx" ON "public"."CommunityContent"("communityId");

-- CreateIndex
CREATE INDEX "AdvertisementContent_advertisementId_idx" ON "public"."AdvertisementContent"("advertisementId");

-- CreateIndex
CREATE INDEX "AdvertisementProduct_advertisementId_idx" ON "public"."AdvertisementProduct"("advertisementId");

-- CreateIndex
CREATE INDEX "AdvertisementProduct_productId_idx" ON "public"."AdvertisementProduct"("productId");

-- CreateIndex
CREATE INDEX "ChatContent_chatId_idx" ON "public"."ChatContent"("chatId");

-- CreateIndex
CREATE INDEX "ChatRoomUser_chatRoomId_idx" ON "public"."ChatRoomUser"("chatRoomId");

-- CreateIndex
CREATE INDEX "ChatRoomUser_userId_idx" ON "public"."ChatRoomUser"("userId");

-- CreateIndex
CREATE INDEX "CommunityThread_communityId_idx" ON "public"."CommunityThread"("communityId");

-- CreateIndex
CREATE INDEX "CommunityThread_userId_idx" ON "public"."CommunityThread"("userId");

-- CreateIndex
CREATE INDEX "ReviewThread_reviewId_idx" ON "public"."ReviewThread"("reviewId");

-- CreateIndex
CREATE INDEX "ReviewThread_userId_idx" ON "public"."ReviewThread"("userId");

-- CreateIndex
CREATE INDEX "Bookmark_userId_idx" ON "public"."Bookmark"("userId");

-- CreateIndex
CREATE INDEX "Bookmark_entityId_idx" ON "public"."Bookmark"("entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_entityType_entityId_key" ON "public"."Bookmark"("userId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "UserLike_userId_idx" ON "public"."UserLike"("userId");

-- CreateIndex
CREATE INDEX "UserLike_entityId_idx" ON "public"."UserLike"("entityId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLike_userId_entityType_entityId_key" ON "public"."UserLike"("userId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "UserReport_userId_idx" ON "public"."UserReport"("userId");

-- CreateIndex
CREATE INDEX "UserReport_entityId_idx" ON "public"."UserReport"("entityId");

-- CreateIndex
CREATE INDEX "UserReport_status_idx" ON "public"."UserReport"("status");

-- AddForeignKey
ALTER TABLE "public"."Hospital" ADD CONSTRAINT "Hospital_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "public"."District"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Hospital" ADD CONSTRAINT "Hospital_hospitalInfoId_fkey" FOREIGN KEY ("hospitalInfoId") REFERENCES "public"."HospitalInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Doctor" ADD CONSTRAINT "Doctor_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "public"."Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "public"."Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "public"."Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "public"."Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Consulting" ADD CONSTRAINT "Consulting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Consulting" ADD CONSTRAINT "Consulting_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "public"."Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "public"."Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PointChargeHistory" ADD CONSTRAINT "PointChargeHistory_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "public"."Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PointUsageHistory" ADD CONSTRAINT "PointUsageHistory_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "public"."Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PointUsageHistory" ADD CONSTRAINT "PointUsageHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Advertisement" ADD CONSTRAINT "Advertisement_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "public"."Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Community" ADD CONSTRAINT "Community_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatRoom" ADD CONSTRAINT "ChatRoom_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CarServiceSlot" ADD CONSTRAINT "CarServiceSlot_carServiceId_fkey" FOREIGN KEY ("carServiceId") REFERENCES "public"."CarService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CarServiceAppointment" ADD CONSTRAINT "CarServiceAppointment_carServiceId_fkey" FOREIGN KEY ("carServiceId") REFERENCES "public"."CarService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AiReport" ADD CONSTRAINT "AiReport_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "public"."Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HospitalCategoryMap" ADD CONSTRAINT "HospitalCategoryMap_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "public"."Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HospitalCategoryMap" ADD CONSTRAINT "HospitalCategoryMap_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DoctorCategoryMap" ADD CONSTRAINT "DoctorCategoryMap_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DoctorCategoryMap" ADD CONSTRAINT "DoctorCategoryMap_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductCategoryMap" ADD CONSTRAINT "ProductCategoryMap_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductCategoryMap" ADD CONSTRAINT "ProductCategoryMap_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReviewCategoryMap" ADD CONSTRAINT "ReviewCategoryMap_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "public"."Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReviewCategoryMap" ADD CONSTRAINT "ReviewCategoryMap_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HospitalPropertyMap" ADD CONSTRAINT "HospitalPropertyMap_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "public"."Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HospitalPropertyMap" ADD CONSTRAINT "HospitalPropertyMap_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."HospitalProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HospitalContent" ADD CONSTRAINT "HospitalContent_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "public"."Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DoctorContent" ADD CONSTRAINT "DoctorContent_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductContent" ADD CONSTRAINT "ProductContent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReviewContent" ADD CONSTRAINT "ReviewContent_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "public"."Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityContent" ADD CONSTRAINT "CommunityContent_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "public"."Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdvertisementContent" ADD CONSTRAINT "AdvertisementContent_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "public"."Advertisement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdvertisementProduct" ADD CONSTRAINT "AdvertisementProduct_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "public"."Advertisement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdvertisementProduct" ADD CONSTRAINT "AdvertisementProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatContent" ADD CONSTRAINT "ChatContent_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatRoomUser" ADD CONSTRAINT "ChatRoomUser_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "public"."ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatRoomUser" ADD CONSTRAINT "ChatRoomUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityThread" ADD CONSTRAINT "CommunityThread_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "public"."Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityThread" ADD CONSTRAINT "CommunityThread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReviewThread" ADD CONSTRAINT "ReviewThread_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "public"."Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReviewThread" ADD CONSTRAINT "ReviewThread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserLike" ADD CONSTRAINT "UserLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserReport" ADD CONSTRAINT "UserReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
