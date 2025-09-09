/*
// ARCHIVED: drmiracle_analysis 데이터 마이그레이션 스크립트
// 이 파일은 더 이상 사용되지 않으며 아카이빙되었습니다.
// 필요시 주석을 해제하여 사용할 수 있습니다.

import {
  PrismaClient,
  UserRoleType,
  UserGenderType,
  UserStatusType,
  UserLocale,
  CategoryType,
  DistrictCountryCode,
  HospitalApprovalStatusType,
  DoctorApprovalStatusType,
  ProductApprovalStatusType,
  DoctorGenderType,
  Prisma,
} from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

const prisma = new PrismaClient();

interface CsvRow {
  [key: string]: string;
}

// CSV 파일을 읽어서 파싱하는 헬퍼 함수
async function readCsvFile(filename: string): Promise<CsvRow[]> {
  return new Promise((resolve, reject) => {
    const results: CsvRow[] = [];
    const filePath = path.join(__dirname, 'csv-data', filename);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  파일이 존재하지 않습니다: ${filename}`);
      resolve([]);
      return;
    }

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        console.log(`✅ ${filename} 읽기 완료: ${results.length}개 행`);
        resolve(results);
      })
      .on('error', reject);
  });
}

// JSON 문자열을 안전하게 파싱하는 헬퍼 함수 (undefined를 반환하여 Prisma 타입과 호환)
function safeJsonParse(str: string | null | undefined): Prisma.InputJsonValue | undefined {
  if (!str || str.trim() === '') return undefined;
  try {
    return JSON.parse(str) as Prisma.InputJsonValue;
  } catch {
    return str; // JSON이 아니면 원래 문자열 반환
  }
}

// 안전한 JSON 타입 체크 함수
function getSafeJsonValue(
  value: Prisma.InputJsonValue | undefined,
  key: string,
): string | undefined {
  if (
    !value ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return undefined;
  }
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return (value as Record<string, unknown>)[key] as string | undefined;
  }
  return undefined;
}

// 날짜 문자열을 Date 객체로 변환하는 헬퍼 함수
function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

// Boolean 문자열을 boolean으로 변환하는 헬퍼 함수
function parseBoolean(boolStr: string | null | undefined, defaultValue: boolean = false): boolean {
  if (!boolStr || boolStr.trim() === '') return defaultValue;
  return boolStr.toLowerCase() === 'true' || boolStr === '1';
}

// Integer 문자열을 number로 변환하는 헬퍼 함수
function parseInt(
  numStr: string | null | undefined,
  defaultValue: number | null = null,
): number | null {
  if (!numStr || numStr.trim() === '') return defaultValue;
  const parsed = Number(numStr);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Float 문자열을 number로 변환하는 헬퍼 함수
function parseFloat(
  numStr: string | null | undefined,
  defaultValue: number | null = null,
): number | null {
  if (!numStr || numStr.trim() === '') return defaultValue;
  const parsed = Number(numStr);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Enum 문자열을 안전하게 처리하는 헬퍼 함수들
function parseUserRoleType(roleStr: string | null | undefined): UserRoleType | null {
  if (!roleStr || roleStr.trim() === '') return null;
  return roleStr as UserRoleType;
}

function parseUserGenderType(genderStr: string | null | undefined): UserGenderType | null {
  if (!genderStr || genderStr.trim() === '') return null;
  return genderStr as UserGenderType;
}

function parseDoctorGenderType(genderStr: string | null | undefined): DoctorGenderType | null {
  if (!genderStr || genderStr.trim() === '') return null;
  return genderStr as DoctorGenderType;
}

function parseUserStatusType(statusStr: string | null | undefined): UserStatusType | null {
  if (!statusStr || statusStr.trim() === '') return null;
  return statusStr as UserStatusType;
}

function parseUserLocale(localeStr: string | null | undefined): UserLocale | null {
  if (!localeStr || localeStr.trim() === '') return null;
  return localeStr as UserLocale;
}

function parseCategoryType(categoryStr: string | null | undefined): CategoryType | null {
  if (!categoryStr || categoryStr.trim() === '') return null;
  return categoryStr as CategoryType;
}

function parseDistrictCountryCode(
  countryStr: string | null | undefined,
): DistrictCountryCode | null {
  if (!countryStr || countryStr.trim() === '') return null;
  return countryStr as DistrictCountryCode;
}

function parseHospitalApprovalStatusType(
  statusStr: string | null | undefined,
): HospitalApprovalStatusType | null {
  if (!statusStr || statusStr.trim() === '') return null;
  return statusStr as HospitalApprovalStatusType;
}

function parseDoctorApprovalStatusType(
  statusStr: string | null | undefined,
): DoctorApprovalStatusType | null {
  if (!statusStr || statusStr.trim() === '') return null;
  return statusStr as DoctorApprovalStatusType;
}

function parseProductApprovalStatusType(
  statusStr: string | null | undefined,
): ProductApprovalStatusType | null {
  if (!statusStr || statusStr.trim() === '') return null;
  return statusStr as ProductApprovalStatusType;
}

// 진행상황을 표시하는 헬퍼 함수
function logProgress(current: number, total: number, item: string) {
  const percentage = Math.round((current / total) * 100);
  const progressBar =
    '█'.repeat(Math.floor(percentage / 2)) + '░'.repeat(50 - Math.floor(percentage / 2));
  console.log(`[${progressBar}] ${percentage}% (${current}/${total}) ${item}`);
}

async function main() {
  console.log('🚀 drmiracle_analysis 데이터 마이그레이션 시작...');

  try {
    // 1단계: District 데이터 마이그레이션
    console.log('\n📍 1단계: District 데이터 마이그레이션');
    const districtData = await readCsvFile('district.csv');
    console.log(`   🔄 ${districtData.length}개의 지역 데이터 마이그레이션 시작...`);

    for (let i = 0; i < districtData.length; i++) {
      const row = districtData[i];
      if (i % 20 === 0 || i === districtData.length - 1) {
        const districtName =
          getSafeJsonValue(safeJsonParse(row.name), 'ko_KR') || row.id.substring(0, 8);
        logProgress(i + 1, districtData.length, `지역: ${districtName}`);
      }

      await prisma.district.upsert({
        where: { id: row.id },
        update: {},
        create: {
          id: row.id,
          name: safeJsonParse(row.name) || {},
          countryCode: parseDistrictCountryCode(row.countryCode) || 'KR',
        },
      });
    }
    console.log(`✅ District: ${districtData.length}개 완료`);

    // 2단계: Category 데이터 마이그레이션
    console.log('\n📂 2단계: Category 데이터 마이그레이션');
    const categoryData = await readCsvFile('category.csv');
    console.log(`   🔄 ${categoryData.length}개의 카테고리 데이터 마이그레이션 시작...`);

    for (let i = 0; i < categoryData.length; i++) {
      const row = categoryData[i];
      if (i % 50 === 0 || i === categoryData.length - 1) {
        const categoryName =
          getSafeJsonValue(safeJsonParse(row.name), 'ko_KR') || row.id.substring(0, 8);
        logProgress(i + 1, categoryData.length, `카테고리: ${categoryName}`);
      }

      await prisma.category.upsert({
        where: { id: row.id },
        update: {},
        create: {
          id: row.id,
          name: safeJsonParse(row.name) || {},
          categoryType: parseCategoryType(row.categoryType) || 'PART',
          description: row.description || null,
          order: parseInt(row.order),
          isActive: parseBoolean(row.show, true),
        },
      });
    }
    console.log(`✅ Category: ${categoryData.length}개 완료`);

    // 3단계: HospitalProperty 데이터 마이그레이션
    console.log('\n🏥 3단계: HospitalProperty 데이터 마이그레이션');
    const hospitalPropertyData = await readCsvFile('hospital_property.csv');
    for (const row of hospitalPropertyData) {
      await prisma.hospitalProperty.upsert({
        where: { id: row.id },
        update: {},
        create: {
          id: row.id,
          name: safeJsonParse(row.name) || {},
          description: row.iconUrl ? { iconUrl: row.iconUrl } : undefined,
          isActive: true,
          createdAt: parseDate(row.createdAt) || new Date(),
          updatedAt: parseDate(row.updatedAt) || new Date(),
        },
      });
    }
    console.log(`✅ HospitalProperty: ${hospitalPropertyData.length}개 완료`);

    // 4단계: User 데이터 통합 마이그레이션
    console.log('\n👤 4단계: User 데이터 통합 마이그레이션');
    const userData = await readCsvFile('user.csv');
    const userAuthData = await readCsvFile('user_auth.csv');

    // user_auth 데이터를 userId별로 그룹화
    console.log('   📊 user_auth 데이터 그룹화 중...');
    const userAuthMap = new Map<string, CsvRow[]>();
    userAuthData.forEach((auth) => {
      if (!userAuthMap.has(auth.userId)) {
        userAuthMap.set(auth.userId, []);
      }
      userAuthMap.get(auth.userId)?.push(auth);
    });
    console.log(`   ✅ ${userAuthMap.size}명의 사용자 auth 데이터 그룹화 완료`);

    console.log(`   🔄 ${userData.length}명의 사용자 데이터 마이그레이션 시작...`);
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < userData.length; i++) {
      const row = userData[i];
      // const userAuth = userAuthMap.get(row.id)?.[0]; // 첫 번째 auth 정보만 사용 (현재 미사용)

      try {
        if (i % 50 === 0 || i === userData.length - 1) {
          logProgress(
            i + 1,
            userData.length,
            `사용자: ${row.name || row.email || row.id.substring(0, 8)}`,
          );
        }

        await prisma.user.upsert({
          where: { id: row.id },
          update: {
            // drmiracle_analysis 필드들만 업데이트
            phoneNumber: row.phoneNumber || null,
            name: row.name || null,
            profileImgUrl: row.profileImgUrl || null,
            advertPush: parseBoolean(row.advertPush),
            postAlarm: parseBoolean(row.postAlarm),
            communityAlarm: parseBoolean(row.communityAlarm),
            drRoleType: parseUserRoleType(row.roleType),
            loggedInAt: parseDate(row.loggedInAt),
            deviceToken: row.deviceToken || null,
            deviceInfo: row.deviceInfo || null,
            userStatusType: parseUserStatusType(row.userStatusType),
            termsVersion: row.termsVersion || null,
            collectPersonalInfo: parseBoolean(row.collectPersonalInfo),
            locale: parseUserLocale(row.locale),
            genderType: parseUserGenderType(row.genderType),
            age: parseInt(row.age),
            nickName: row.nickName || null,
            updatedAt: parseDate(row.updatedAt) || new Date(),
          },
          create: {
            id: row.id,
            email: row.email || null,
            createdAt: parseDate(row.createdAt) || new Date(),
            updatedAt: parseDate(row.updatedAt) || new Date(),
            // drmiracle_analysis 필드들
            phoneNumber: row.phoneNumber || null,
            name: row.name || null,
            profileImgUrl: row.profileImgUrl || null,
            advertPush: parseBoolean(row.advertPush),
            postAlarm: parseBoolean(row.postAlarm),
            communityAlarm: parseBoolean(row.communityAlarm),
            drRoleType: parseUserRoleType(row.roleType),
            loggedInAt: parseDate(row.loggedInAt),
            deviceToken: row.deviceToken || null,
            deviceInfo: row.deviceInfo || null,
            userStatusType: parseUserStatusType(row.userStatusType),
            termsVersion: row.termsVersion || null,
            collectPersonalInfo: parseBoolean(row.collectPersonalInfo),
            locale: parseUserLocale(row.locale),
            genderType: parseUserGenderType(row.genderType),
            age: parseInt(row.age),
            nickName: row.nickName || null,
          },
        });
        successCount++;
      } catch (error) {
        errorCount++;
        console.log(`   ❌ User ${row.id} 마이그레이션 실패: ${(error as Error).message}`);
        if (errorCount > 10) {
          throw new Error(`너무 많은 오류 발생: ${errorCount}개`);
        }
      }
    }
    console.log(`✅ User: 성공 ${successCount}개, 실패 ${errorCount}개`);

    // 5단계: Hospital 데이터 마이그레이션
    console.log('\n🏥 5단계: Hospital 데이터 마이그레이션');
    const hospitalData = await readCsvFile('hospital.csv');
    console.log(`   🔄 ${hospitalData.length}개의 병원 데이터 마이그레이션 시작...`);

    let hospitalSuccessCount = 0;
    let hospitalErrorCount = 0;

    for (let i = 0; i < hospitalData.length; i++) {
      const row = hospitalData[i];
      try {
        if (i % 10 === 0 || i === hospitalData.length - 1) {
          const hospitalName =
            getSafeJsonValue(safeJsonParse(row.name), 'ko_KR') || row.id.substring(0, 8);
          logProgress(i + 1, hospitalData.length, `병원: ${hospitalName}`);
        }

        await prisma.hospital.upsert({
          where: { id: row.id },
          update: {},
          create: {
            id: row.id,
            name: safeJsonParse(row.name) || {},
            address: safeJsonParse(row.address) || {},
            directions: safeJsonParse(row.directions),
            phoneNumber: row.phoneNumber || null,
            description: safeJsonParse(row.description),
            openingHours: safeJsonParse(row.openingHours),
            reviewCount: parseInt(row.reviewCount, 0)!,
            productCount: parseInt(row.productCount, 0)!,
            bookmarkCount: parseInt(row.bookmarkCount, 0)!,
            viewCount: parseInt(row.viewCount, 0)!,
            rating: parseFloat(row.rating, 0)!,
            point: parseInt(row.point, 0)!,
            email: row.email || null,
            subPhoneNumbers: safeJsonParse(row.subPhoneNumbers) || [],
            lineId: row.lineId || null,
            memo: row.memo || null,
            reviewUrl: row.reviewUrl || null,
            settings: safeJsonParse(row.settings),
            enableJp: parseBoolean(row.enableJp),
            prices: safeJsonParse(row.prices),
            ranking: parseInt(row.ranking),
            discountRate: parseFloat(row.discountRate),
            approvalStatusType:
              parseHospitalApprovalStatusType(row.approvalStatusType) || 'APPROVED',
            rejectReason: row.rejectReason || null,
            baseId: row.baseId || null,
            hasClone: parseBoolean(row.hasClone),
            districtId: row.districtId || null,
            hospitalInfoId: row.hospitalInfoId || null,
            createdAt: parseDate(row.createdAt) || new Date(),
            updatedAt: parseDate(row.updatedAt) || new Date(),
          },
        });
        hospitalSuccessCount++;
      } catch (error) {
        hospitalErrorCount++;
        console.log(`   ❌ Hospital ${row.id} 마이그레이션 실패: ${(error as Error).message}`);
        if (hospitalErrorCount > 5) {
          throw new Error(`너무 많은 Hospital 오류 발생: ${hospitalErrorCount}개`);
        }
      }
    }
    console.log(`✅ Hospital: 성공 ${hospitalSuccessCount}개, 실패 ${hospitalErrorCount}개`);

    // 6단계: Doctor 데이터 마이그레이션
    console.log('\n👨‍⚕️ 6단계: Doctor 데이터 마이그레이션');
    const doctorData = await readCsvFile('doctor.csv');
    console.log(`   🔄 ${doctorData.length}개의 의사 데이터 마이그레이션 시작...`);

    for (let i = 0; i < doctorData.length; i++) {
      const row = doctorData[i];
      const doctorName =
        getSafeJsonValue(safeJsonParse(row.name), 'ko_KR') || row.id.substring(0, 8);
      logProgress(i + 1, doctorData.length, `의사: ${doctorName}`);

      await prisma.doctor.upsert({
        where: { id: row.id },
        update: {},
        create: {
          id: row.id,
          name: safeJsonParse(row.name) || {},
          position: safeJsonParse(row.position),
          licenseNumber: row.licenseNumber || null,
          licenseDate: parseDate(row.licenseDate),
          description: row.description || null,
          genderType: parseDoctorGenderType(row.genderType) || 'MALE',
          viewCount: parseInt(row.viewCount, 0)!,
          bookmarkCount: parseInt(row.bookmarkCount, 0)!,
          order: parseInt(row.order),
          stop: parseBoolean(row.stop),
          approvalStatusType: parseDoctorApprovalStatusType(row.approvalStatusType) || 'APPROVED',
          rejectReason: row.rejectReason || null,
          baseId: row.baseId || null,
          hasClone: parseBoolean(row.hasClone),
          hospitalId: row.hospitalId,
          createdAt: parseDate(row.createdAt) || new Date(),
          updatedAt: parseDate(row.updatedAt) || new Date(),
        },
      });
    }
    console.log(`✅ Doctor: ${doctorData.length}개 완료`);

    // 7단계: Product 데이터 마이그레이션
    console.log('\n🛍️ 7단계: Product 데이터 마이그레이션');
    const productData = await readCsvFile('product.csv');
    console.log(`   🔄 ${productData.length}개의 상품 데이터 마이그레이션 시작...`);

    for (let i = 0; i < productData.length; i++) {
      const row = productData[i];
      const productName =
        getSafeJsonValue(safeJsonParse(row.name), 'ko_KR') || row.id.substring(0, 8);
      logProgress(i + 1, productData.length, `상품: ${productName}`);

      await prisma.product.upsert({
        where: { id: row.id },
        update: {},
        create: {
          id: row.id,
          name: safeJsonParse(row.name) || {},
          description: safeJsonParse(row.description),
          price: parseInt(row.price),
          discountPrice: parseInt(row.discountPrice),
          isActive: parseBoolean(row.isActive, true),
          viewCount: parseInt(row.viewCount, 0)!,
          bookmarkCount: parseInt(row.bookmarkCount, 0)!,
          order: parseInt(row.order),
          approvalStatusType: parseProductApprovalStatusType(row.approvalStatusType) || 'APPROVED',
          rejectReason: row.rejectReason || null,
          baseId: row.baseId || null,
          hasClone: parseBoolean(row.hasClone),
          hospitalId: row.hospitalId,
          createdAt: parseDate(row.createdAt) || new Date(),
          updatedAt: parseDate(row.updatedAt) || new Date(),
        },
      });
    }
    console.log(`✅ Product: ${productData.length}개 완료`);

    // 8단계: Review 데이터 마이그레이션
    console.log('\n⭐ 8단계: Review 데이터 마이그레이션');
    const reviewData = await readCsvFile('review.csv');
    console.log(`   🔄 ${reviewData.length}개의 리뷰 데이터 마이그레이션 시작...`);

    let reviewSuccessCount = 0;
    let reviewErrorCount = 0;

    for (let i = 0; i < reviewData.length; i++) {
      const row = reviewData[i];
      try {
        if (i % 100 === 0 || i === reviewData.length - 1) {
          const reviewTitle =
            getSafeJsonValue(safeJsonParse(row.title), 'ko_KR') || row.id.substring(0, 8);
          logProgress(i + 1, reviewData.length, `리뷰: ${reviewTitle}`);
        }

        await prisma.review.upsert({
          where: { id: row.id },
          update: {},
          create: {
            id: row.id,
            rating: parseFloat(row.rating, 0)!,
            title: safeJsonParse(row.title),
            content: safeJsonParse(row.content),
            isRecommended: parseBoolean(row.isRecommended),
            viewCount: parseInt(row.viewCount, 0)!,
            likeCount: parseInt(row.likeCount, 0)!,
            userId: row.userId,
            hospitalId: row.hospitalId,
            createdAt: parseDate(row.createdAt) || new Date(),
            updatedAt: parseDate(row.updatedAt) || new Date(),
          },
        });
        reviewSuccessCount++;
      } catch (error) {
        reviewErrorCount++;
        console.log(`   ❌ Review ${row.id} 마이그레이션 실패: ${(error as Error).message}`);
        if (reviewErrorCount > 50) {
          throw new Error(`너무 많은 Review 오류 발생: ${reviewErrorCount}개`);
        }
      }
    }
    console.log(`✅ Review: 성공 ${reviewSuccessCount}개, 실패 ${reviewErrorCount}개`);

    console.log('\n🎉 drmiracle_analysis 데이터 마이그레이션 완료!');
  } catch (error) {
    console.error('❌ 마이그레이션 중 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
*/
