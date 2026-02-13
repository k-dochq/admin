/**
 * 시트 기준 병원명 다국어 일괄 수정
 * - Hospital.name (jsonb): ko_KR로 매칭 후 en_US, th_TH, hi_IN, tl_PH, ar_SA, ru_RU, zh_TW, ja_JP 갱신
 *
 * 실행 (dry run, DB 미반영):
 *   pnpm exec tsx scripts/hospital-names-from-sheet/update-hospital-names-from-mapping.ts --dry-run
 * 실제 반영:
 *   pnpm exec tsx scripts/hospital-names-from-sheet/update-hospital-names-from-mapping.ts
 */

import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { HOSPITAL_NAME_MAPPING } from './hospital-name-mapping';

type NameJson = Record<string, string>;

function getNameKo(name: Prisma.JsonValue): string {
  if (!name || typeof name !== 'object' || Array.isArray(name)) return '';
  const obj = name as Record<string, unknown>;
  const v = obj.ko_KR ?? obj.ko;
  return typeof v === 'string' ? v.trim() : '';
}

function toNameJson(existing: Prisma.JsonValue): NameJson {
  const out: NameJson = {};
  if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
    const obj = existing as Record<string, unknown>;
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'string') out[k] = v;
    }
  }
  return out;
}

/** 기존 name에 시트 값(en/zh/ja) 반영. en은 en_US, th_TH, hi_IN, tl_PH, ar_SA, ru_RU에 동일 적용 */
function mergeNameFromRow(existing: Prisma.JsonValue, en: string, zh: string, ja: string): NameJson {
  const out = toNameJson(existing);
  out.en_US = en;
  out.th_TH = en;
  out.hi_IN = en;
  out.tl_PH = en;
  out.ar_SA = en;
  out.ru_RU = en;
  out.zh_TW = zh;
  out.ja_JP = ja;
  return out;
}

const DRY_RUN = process.argv.includes('--dry-run') || process.argv.includes('-d');

async function main(): Promise<void> {
  console.log('📖 병원명 다국어 시트 매핑 반영');
  if (DRY_RUN) {
    console.log('⚠️  DRY RUN: DB에 반영하지 않습니다.\n');
  }

  const hospitals = await prisma.hospital.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });

  const byKoKr = new Map<string, { id: string; name: Prisma.JsonValue }>();
  for (const h of hospitals) {
    const ko = getNameKo(h.name);
    if (ko) byKoKr.set(ko, { id: h.id, name: h.name });
  }

  let updated = 0;
  let skipped = 0;
  const notFound: string[] = [];

  for (const row of HOSPITAL_NAME_MAPPING) {
    const kr = row.kr.trim();
    const hospital = byKoKr.get(kr);
    if (!hospital) {
      notFound.push(kr);
      continue;
    }

    const newName = mergeNameFromRow(hospital.name, row.en, row.zh.trim(), row.ja);
    const current = toNameJson(hospital.name);
    const same =
      current.en_US === newName.en_US &&
      current.zh_TW === newName.zh_TW &&
      current.ja_JP === newName.ja_JP;
    if (same) {
      skipped++;
      continue;
    }

    console.log(`✏️  [${hospital.id}] ${kr}`);
    if (current.en_US !== newName.en_US) console.log(`    en_US/th/…: "${current.en_US ?? ''}" → "${newName.en_US}"`);
    if (current.zh_TW !== newName.zh_TW) console.log(`    zh_TW:     "${current.zh_TW ?? ''}" → "${newName.zh_TW}"`);
    if (current.ja_JP !== newName.ja_JP) console.log(`    ja_JP:     "${current.ja_JP ?? ''}" → "${newName.ja_JP}"`);

    if (!DRY_RUN) {
      await prisma.hospital.update({
        where: { id: hospital.id },
        data: { name: newName },
      });
    }
    updated++;
  }

  console.log('\n📊 결과');
  console.log(`  - 매핑 행: ${HOSPITAL_NAME_MAPPING.length}건`);
  console.log(`  - 갱신(예정): ${updated}건`);
  console.log(`  - 변경 없음(스킵): ${skipped}건`);
  console.log(`  - DB에서 미발견(ko_KR 불일치): ${notFound.length}건`);
  if (notFound.length > 0) {
    console.log('  - 미발견 목록:', notFound.slice(0, 20).join(', ') + (notFound.length > 20 ? ` … 외 ${notFound.length - 20}건` : ''));
  }
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
