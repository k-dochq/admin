/**
 * 병원 표시지역명(displayLocationName) 중 ru_RU(러시아어)만 매핑 정보로 업데이트
 *
 * - 기준: displayLocationName.ko_KR(한국어 지역명)
 * - 매핑: scripts/district-name/location-mapping.ts 의 LOCATION_NAME_MAPPING
 * - 동작: ru_RU 값이 매핑과 다르면 ru_RU만 교체(다른 언어는 유지)
 *
 * 실행 예시:
 *  - DRY RUN:   pnpm db:update-hospital-location-names-ru-ru -- --dry-run
 *  - 제한 실행: pnpm db:update-hospital-location-names-ru-ru -- --limit 50 --batch 20
 *
 * 주의:
 * - 실제 DB 업데이트를 수행하므로 먼저 --dry-run으로 확인하세요.
 */

import { prisma } from '../../lib/prisma';
import type { HospitalLocationData, Locale } from './types';
import { parseCliOptions } from './cli-options';
import { getLocalizedText, getKoreanText, mergeLocalizedText } from './utils';
import { getLocationMapping, isMappedLocation } from './location-mapping';

const TARGET_LOCALE: Locale = 'ru_RU';

type Options = {
  batchSize: number;
  limit: number | null;
  dryRun: boolean;
};

async function fetchHospitalsBatch({
  cursorId,
  take,
}: {
  cursorId: string | null;
  take: number;
}): Promise<HospitalLocationData[]> {
  const hospitals = await prisma.hospital.findMany({
    select: {
      id: true,
      name: true,
      displayLocationName: true,
    },
    orderBy: { id: 'asc' },
    take,
    ...(cursorId ? { cursor: { id: cursorId }, skip: 1 } : {}),
  });

  return hospitals
    .filter((h) => h.displayLocationName !== null && h.displayLocationName !== undefined)
    .map((h) => ({
      id: h.id,
      name: h.name,
      displayLocationName: h.displayLocationName,
    }));
}

async function updateHospitalRuRu({
  hospitalId,
  displayLocationName,
  expectedRuRu,
  dryRun,
}: {
  hospitalId: string;
  displayLocationName: unknown;
  expectedRuRu: string;
  dryRun: boolean;
}): Promise<{ updated: boolean }> {
  const currentRuRu = getLocalizedText(displayLocationName, TARGET_LOCALE);
  if (currentRuRu === expectedRuRu) return { updated: false };

  if (dryRun) {
    console.log(
      `  [DRY RUN] ${TARGET_LOCALE}: "${currentRuRu || '(없음)'}" → "${expectedRuRu}"`,
    );
    return { updated: true };
  }

  const updatedDisplayLocationName = mergeLocalizedText(
    displayLocationName,
    TARGET_LOCALE,
    expectedRuRu,
  );

  await prisma.hospital.update({
    where: { id: hospitalId },
    data: {
      displayLocationName: updatedDisplayLocationName,
    },
  });

  return { updated: true };
}

async function main(): Promise<void> {
  const cli = parseCliOptions();
  const options: Options = {
    batchSize: cli.batchSize ?? 20,
    limit: cli.limit ?? null,
    dryRun: cli.dryRun ?? false,
  };

  console.log('🔄 ru_RU(러시아어) 표시지역명 매핑 업데이트 시작');
  console.log(JSON.stringify({ ...options, locale: TARGET_LOCALE }, null, 2));

  let cursorId: string | null = null;
  let processed = 0;
  let updated = 0;
  let skipped = 0;

  while (true) {
    const remaining = options.limit ? options.limit - processed : null;
    if (remaining !== null && remaining <= 0) break;

    const take = remaining ? Math.min(options.batchSize, remaining) : options.batchSize;
    const hospitals = await fetchHospitalsBatch({ cursorId, take });
    if (hospitals.length === 0) break;

    for (const hospital of hospitals) {
      processed += 1;

      const ko = getKoreanText(hospital.displayLocationName);
      if (!ko) {
        skipped += 1;
        continue;
      }

      if (!isMappedLocation(ko)) {
        skipped += 1;
        continue;
      }

      const mapping = getLocationMapping(ko);
      const expectedRuRu = mapping?.[TARGET_LOCALE] ?? '';
      if (!expectedRuRu) {
        skipped += 1;
        continue;
      }

      const result = await updateHospitalRuRu({
        hospitalId: hospital.id,
        displayLocationName: hospital.displayLocationName,
        expectedRuRu,
        dryRun: options.dryRun,
      });

      if (result.updated) updated += 1;
      cursorId = hospital.id;
    }

    // DB 부하 방지
    if (hospitals.length === take) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  console.log('✅ 완료');
  console.log(
    JSON.stringify(
      {
        locale: TARGET_LOCALE,
        processed,
        updated,
        skipped,
        dryRun: options.dryRun,
      },
      null,
      2,
    ),
  );
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      console.error('💥 실행 실패:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { main as updateHospitalLocationNamesRuRu };
