/**
 * District 지역명(name) 중 ru_RU(러시아어)만 매핑 정보로 업데이트
 *
 * - 기준: name.ko_KR(한국어 지역명)
 * - 매핑: scripts/district-name/district-mapping.ts 의 DISTRICT_MAPPING
 * - 대상: 활성화된 District (countryCode KR, isActive true 또는 null)
 * - 동작: ru_RU 값이 매핑과 다르면 ru_RU만 교체(다른 언어는 유지)
 *
 * 실행 예시:
 *  - DRY RUN:   npx tsx scripts/district-name/update-district-names-ru-ru.ts -- --dry-run
 *  - 제한 실행: npx tsx scripts/district-name/update-district-names-ru-ru.ts -- --limit 50 --batch 20
 *
 * 주의:
 * - 실제 DB 업데이트를 수행하므로 먼저 --dry-run으로 확인하세요.
 */

import { prisma } from '../../lib/prisma';
import type { Locale } from './types';
import { parseCliOptions } from './cli-options';
import { getLocalizedText, getKoreanText, mergeLocalizedText } from './utils';
import { getDistrictMapping, isMappedDistrict } from './district-mapping';

const TARGET_LOCALE: Locale = 'ru_RU';

type Options = {
  batchSize: number;
  limit: number | null;
  dryRun: boolean;
};

type DistrictRow = {
  id: string;
  name: unknown;
};

async function fetchActiveDistrictsBatch({
  cursorId,
  take,
}: {
  cursorId: string | null;
  take: number;
}): Promise<DistrictRow[]> {
  const districts = await prisma.district.findMany({
    where: {
      countryCode: 'KR',
      OR: [{ isActive: true }, { isActive: null }],
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: { id: 'asc' },
    take,
    ...(cursorId ? { cursor: { id: cursorId }, skip: 1 } : {}),
  });

  return districts;
}

async function updateDistrictRuRu({
  districtId,
  name,
  expectedRuRu,
  dryRun,
}: {
  districtId: string;
  name: unknown;
  expectedRuRu: string;
  dryRun: boolean;
}): Promise<{ updated: boolean }> {
  const currentRuRu = getLocalizedText(name, TARGET_LOCALE);
  if (currentRuRu === expectedRuRu) return { updated: false };

  if (dryRun) {
    console.log(
      `  [DRY RUN] ${TARGET_LOCALE}: "${currentRuRu || '(없음)'}" → "${expectedRuRu}"`,
    );
    return { updated: true };
  }

  const updatedName = mergeLocalizedText(name, TARGET_LOCALE, expectedRuRu);

  await prisma.district.update({
    where: { id: districtId },
    data: {
      name: updatedName,
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

  console.log('🔄 ru_RU(러시아어) District 지역명 매핑 업데이트 시작');
  console.log(JSON.stringify({ ...options, locale: TARGET_LOCALE }, null, 2));

  let cursorId: string | null = null;
  let processed = 0;
  let updated = 0;
  let skipped = 0;

  while (true) {
    const remaining = options.limit ? options.limit - processed : null;
    if (remaining !== null && remaining <= 0) break;

    const take = remaining ? Math.min(options.batchSize, remaining) : options.batchSize;
    const districts = await fetchActiveDistrictsBatch({ cursorId, take });
    if (districts.length === 0) break;

    for (const district of districts) {
      processed += 1;

      const ko = getKoreanText(district.name);
      if (!ko) {
        skipped += 1;
        continue;
      }

      if (!isMappedDistrict(ko)) {
        skipped += 1;
        continue;
      }

      const mapping = getDistrictMapping(ko);
      const expectedRuRu = mapping?.[TARGET_LOCALE] ?? '';
      if (!expectedRuRu) {
        skipped += 1;
        continue;
      }

      const result = await updateDistrictRuRu({
        districtId: district.id,
        name: district.name,
        expectedRuRu,
        dryRun: options.dryRun,
      });

      if (result.updated) updated += 1;
      cursorId = district.id;
    }

    if (districts.length === take) {
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

export { main as updateDistrictNamesRuRu };
