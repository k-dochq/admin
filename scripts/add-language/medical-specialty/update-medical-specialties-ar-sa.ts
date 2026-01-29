import { PrismaClient, type Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const TEST_MODE = false;
const TEST_MAX_ITEMS = 1;

const TRANSLATION_FILE = path.join(__dirname, 'output/translated-medical-specialties-ar-sa.json');
const UPDATE_PROGRESS_FILE = path.join(__dirname, 'output/update-progress-ar-sa.json');

type LocalizedText = {
  ko_KR?: string;
  en_US?: string;
  th_TH?: string;
  zh_TW?: string;
  ja_JP?: string;
  hi_IN?: string;
  tl_PH?: string;
  ar_SA?: string;
};

interface TranslatedMedicalSpecialty {
  id: string;
  name: {
    ko_KR: string;
    en_US: string;
    th_TH: string;
    zh_TW: string;
    ja_JP: string;
    hi_IN: string;
    tl_PH: string;
    ar_SA: string;
  };
  description?: {
    ko_KR: string;
    en_US: string;
    th_TH: string;
    zh_TW: string;
    ja_JP: string;
    hi_IN: string;
    tl_PH: string;
    ar_SA: string;
  };
}

interface UpdateProgress {
  processedCount: number;
  totalCount: number;
  successCount: number;
  failureCount: number;
  lastProcessedId: string | null;
  startTime: string;
  lastUpdateTime: string;
}

function mergeLocalizedTextWithArSA(existing: Prisma.JsonValue, arSAText: string): LocalizedText {
  let currentText: LocalizedText = {};
  if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
    currentText = existing as LocalizedText;
  } else if (typeof existing === 'string') {
    currentText = { ko_KR: existing };
  }
  return {
    ko_KR: currentText.ko_KR || '',
    en_US: currentText.en_US || '',
    th_TH: currentText.th_TH || '',
    zh_TW: currentText.zh_TW || '',
    ja_JP: currentText.ja_JP || '',
    hi_IN: currentText.hi_IN || '',
    tl_PH: currentText.tl_PH || '',
    ar_SA: arSAText,
  };
}

function saveUpdateProgress(progress: UpdateProgress): void {
  const outputDir = path.dirname(UPDATE_PROGRESS_FILE);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(UPDATE_PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function loadUpdateProgress(): UpdateProgress | null {
  try {
    if (fs.existsSync(UPDATE_PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(UPDATE_PROGRESS_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('Error loading update progress:', error);
  }
  return null;
}

function loadTranslationResults(): TranslatedMedicalSpecialty[] {
  if (!fs.existsSync(TRANSLATION_FILE)) {
    throw new Error(`번역 결과 파일을 찾을 수 없습니다: ${TRANSLATION_FILE}`);
  }
  const data = fs.readFileSync(TRANSLATION_FILE, 'utf-8');
  const results = JSON.parse(data);
  if (!Array.isArray(results)) {
    throw new Error('번역 결과 파일 형식이 올바르지 않습니다.');
  }
  return results;
}

async function updateMedicalSpecialtiesArSA() {
  try {
    console.log('🔄 시술부위(MedicalSpecialty) 아랍어(ar-SA) 업데이트 작업 시작...');

    const allTranslationResults = loadTranslationResults();
    console.log(`📁 번역 결과 로드 완료: ${allTranslationResults.length}개`);

    const translationResults = TEST_MODE
      ? allTranslationResults.slice(0, TEST_MAX_ITEMS)
      : allTranslationResults;

    if (TEST_MODE) {
      console.log(`🧪 테스트 모드: ${TEST_MAX_ITEMS}개 항목만 처리합니다.`);
    }

    let progress = loadUpdateProgress();
    if (progress) {
      console.log(
        `🔄 이전 작업 재개: ${progress.processedCount}/${progress.totalCount} 완료 (성공: ${progress.successCount}, 실패: ${progress.failureCount})`,
      );
    } else {
      progress = {
        processedCount: 0,
        totalCount: translationResults.length,
        successCount: 0,
        failureCount: 0,
        lastProcessedId: null,
        startTime: new Date().toISOString(),
        lastUpdateTime: new Date().toISOString(),
      };
    }

    const BATCH_SIZE = 20;
    let startIndex = progress.processedCount;

    while (startIndex < translationResults.length) {
      const endIndex = Math.min(startIndex + BATCH_SIZE, translationResults.length);
      const batch = translationResults.slice(startIndex, endIndex);

      console.log(`\n📝 처리 중: ${startIndex + 1}-${endIndex}/${translationResults.length}`);

      const updatePromises = batch.map(async (translatedMedicalSpecialty) => {
        try {
          const currentMedicalSpecialty = await prisma.medicalSpecialty.findUnique({
            where: { id: translatedMedicalSpecialty.id },
            select: { id: true, name: true, description: true },
          });

          if (!currentMedicalSpecialty) {
            console.warn(`⚠️  시술부위를 찾을 수 없습니다: ${translatedMedicalSpecialty.id}`);
            return {
              success: false,
              id: translatedMedicalSpecialty.id,
              error: 'MedicalSpecialty not found',
            };
          }

          const updateData: { name?: LocalizedText; description?: LocalizedText } = {};

          if (translatedMedicalSpecialty.name.ar_SA) {
            updateData.name = mergeLocalizedTextWithArSA(
              currentMedicalSpecialty.name,
              translatedMedicalSpecialty.name.ar_SA,
            );
          }
          if (
            translatedMedicalSpecialty.description &&
            translatedMedicalSpecialty.description.ar_SA
          ) {
            updateData.description = mergeLocalizedTextWithArSA(
              currentMedicalSpecialty.description,
              translatedMedicalSpecialty.description.ar_SA,
            );
          }

          if (Object.keys(updateData).length > 0) {
            await prisma.medicalSpecialty.update({
              where: { id: translatedMedicalSpecialty.id },
              data: updateData,
            });
          }

          return { success: true, id: translatedMedicalSpecialty.id };
        } catch (error) {
          console.error(`❌ 업데이트 실패 (${translatedMedicalSpecialty.id}):`, error);
          return {
            success: false,
            id: translatedMedicalSpecialty.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      });

      const results = await Promise.all(updatePromises);
      const batchSuccessCount = results.filter((r) => r.success).length;
      const batchFailureCount = results.filter((r) => !r.success).length;

      progress.processedCount = endIndex;
      progress.successCount += batchSuccessCount;
      progress.failureCount += batchFailureCount;
      progress.lastProcessedId = batch[batch.length - 1].id;
      progress.lastUpdateTime = new Date().toISOString();
      saveUpdateProgress(progress);

      console.log(`✅ 배치 완료: 성공 ${batchSuccessCount}개, 실패 ${batchFailureCount}개`);
      console.log(
        `📊 전체 진행률: ${progress.processedCount}/${progress.totalCount} (${Math.round((progress.processedCount / progress.totalCount) * 100)}%)`,
      );

      const failures = results.filter((r) => !r.success);
      if (failures.length > 0) {
        console.log('❌ 실패한 항목들:');
        failures.forEach((f) => console.log(`  - ${f.id}: ${f.error}`));
      }

      startIndex = endIndex;
      if (startIndex < translationResults.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log('\n🎉 모든 시술부위 아랍어(ar-SA) 업데이트 완료!');
    console.log(`📊 최종 결과:`);
    console.log(`  - 총 처리: ${progress.processedCount}개`);
    console.log(`  - 성공: ${progress.successCount}개`);
    console.log(`  - 실패: ${progress.failureCount}개`);
    console.log(
      `  - 성공률: ${Math.round((progress.successCount / progress.processedCount) * 100)}%`,
    );

    if (fs.existsSync(UPDATE_PROGRESS_FILE)) fs.unlinkSync(UPDATE_PROGRESS_FILE);
  } catch (error) {
    console.error('❌ 업데이트 작업 실패:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  updateMedicalSpecialtiesArSA()
    .then(() => {
      console.log('✅ 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { updateMedicalSpecialtiesArSA };
