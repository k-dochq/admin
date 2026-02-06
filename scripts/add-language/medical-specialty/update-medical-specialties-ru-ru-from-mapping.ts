/**
 * 시술부위(MedicalSpecialty) name의 러시아어(ru_RU)만
 * medical-specialty-name-mapping.ts 매핑표 기준으로 갱신하는 스크립트.
 *
 * - 매칭: DB의 name.ko_KR로 매핑표 조회 후 name.ru_RU만 업데이트
 * - description은 변경하지 않음 (매핑표에 없음)
 *
 * 실행: npx tsx scripts/add-language/medical-specialty/update-medical-specialties-ru-ru-from-mapping.ts
 * Dry run: npx tsx scripts/add-language/medical-specialty/update-medical-specialties-ru-ru-from-mapping.ts -- --dry-run
 */

import { type Prisma } from '@prisma/client';
import { prisma } from '../../../lib/prisma';
import { getRuRuByNameKo } from './medical-specialty-name-mapping';

type LocalizedText = Record<string, string>;

function getNameKo(name: Prisma.JsonValue): string {
  if (!name || typeof name !== 'object' || Array.isArray(name)) return '';
  const obj = name as Record<string, unknown>;
  const v = obj.ko_KR ?? obj.ko;
  return typeof v === 'string' ? v.trim() : '';
}

function getRuRuFromName(name: Prisma.JsonValue): string | undefined {
  if (!name || typeof name !== 'object' || Array.isArray(name)) return undefined;
  const obj = name as Record<string, unknown>;
  const v = obj.ru_RU;
  return typeof v === 'string' ? v : undefined;
}

/** 기존 name JSON에 ru_RU만 설정/덮어쓰기 */
function mergeNameWithRuRu(existing: Prisma.JsonValue, ruRu: string): LocalizedText {
  const out: LocalizedText = {};
  if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
    const obj = existing as Record<string, unknown>;
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'string') out[k] = v;
    }
  }
  out.ru_RU = ruRu;
  return out;
}

const DRY_RUN = process.argv.includes('--dry-run') || process.argv.includes('-d');

async function main(): Promise<void> {
  console.log('📖 시술부위(MedicalSpecialty) name 러시아어(ru_RU) 매핑 갱신');
  if (DRY_RUN) {
    console.log('⚠️  DRY RUN: DB에 반영하지 않습니다.\n');
  }

  const specialties = await prisma.medicalSpecialty.findMany({
    select: { id: true, specialtyType: true, name: true },
    orderBy: [{ order: 'asc' }, { id: 'asc' }],
  });

  let updated = 0;
  let skipped = 0;
  let noMapping = 0;

  for (const row of specialties) {
    const koName = getNameKo(row.name);
    const ruFromMapping = koName ? getRuRuByNameKo(koName) : undefined;
    const currentRu = getRuRuFromName(row.name);

    if (ruFromMapping === undefined) {
      noMapping++;
      console.log(`⏭️  매핑 없음 (ko_KR="${koName}"): ${row.specialtyType}`);
      continue;
    }

    if (currentRu === ruFromMapping) {
      skipped++;
      continue;
    }

    const newName = mergeNameWithRuRu(row.name, ruFromMapping);
    console.log(`✏️  ${koName} (${row.specialtyType}): "${currentRu ?? ''}" → "${ruFromMapping}"`);

    if (!DRY_RUN) {
      await prisma.medicalSpecialty.update({
        where: { id: row.id },
        data: { name: newName },
      });
    }
    updated++;
  }

  console.log('\n📊 결과');
  console.log(`  - 전체: ${specialties.length}건`);
  console.log(`  - 갱신: ${updated}건`);
  console.log(`  - 변경 없음(스킵): ${skipped}건`);
  console.log(`  - 매핑 없음: ${noMapping}건`);
  if (DRY_RUN && updated > 0) {
    console.log('\n실제 반영하려면 --dry-run 없이 실행하세요.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
