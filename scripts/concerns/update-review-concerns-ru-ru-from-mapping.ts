/**
 * 지정 병원 리뷰의 고민부위(concerns) 러시아어(ru_RU)를
 * concerns-mapping-unified 매핑 정보로 갱신하는 스크립트.
 *
 * - 대상: TARGET_HOSPITALS에 해당하는 병원의 리뷰
 * - 동작: 각 리뷰의 concerns(한국어) 또는 concernsMultilingual.ko_KR를 파싱해
 *   매핑으로 ru_RU 문자열을 생성하고, concernsMultilingual에 ru_RU를 설정/덮어씀
 *
 * 실행: npx tsx scripts/concerns/update-review-concerns-ru-ru-from-mapping.ts
 * Dry run: npx tsx scripts/concerns/update-review-concerns-ru-ru-from-mapping.ts -- --dry-run
 */

import { prisma } from '../../lib/prisma';
import { CONCERN_KO_TO_RU_RU } from './concerns-mapping-unified';

/** #으로 시작하는 해시태그들을 추출 */
function parseConcernTags(koText: string): string[] {
  if (!koText || typeof koText !== 'string') return [];
  const tags = koText.match(/#[^\s#]+/g) || [];
  return tags.map((tag) => tag.trim()).filter((tag) => tag.length > 1);
}

const DRY_RUN = process.argv.includes('--dry-run') || process.argv.includes('-d');

const TARGET_HOSPITALS = [
  '압구정미라클의원',
  '스마일러치과의원',
  '청담비포앤애프터클리닉',
  '닥터송포유의원',
  '봉봉성형외과의원',
  'V&MJ피부과의원',
  '땡큐성형외과의원',
  '연세다인성형외과의원',
  '허쉬성형외과의원',
  '플랜에스의원',
  '일퍼센트성형외과의원',
  '슈가성형외과의원',
  '피그마리온의원',
  '마인드성형외과의원',
  '클래스원의원',
  '247클리닉',
  '디캐럿의원',
  '제로원성형외과의원',
  'RU성형외과의원',
  '에이블룸성형외과의원',
  '셀린의원 강남역',
  '르에이치의원',
  '다미의원',
  '이즈의원',
  '서래선치과의원',
  '서울페이스21치과병원',
  '미니쉬치과병원',
  '모앤라인성형외과의원',
  '지우개의원',
  '멜론성형외과의원',
  '아이루미성형외과의원',
  '스노우의원',
  '셀이즈의원',
  '청담쥬넥스의원',
] as const;

type HospitalNameJson = Record<string, string> | null;

function getKoreanText(name: HospitalNameJson): string {
  if (!name || typeof name !== 'object') return '';
  const v = name.ko_KR ?? name.ko;
  return typeof v === 'string' ? v.trim() : '';
}

type ConcernsMultilingualJson = Record<string, string> | null;

/**
 * 한국어 고민부위 텍스트를 매핑으로 ru_RU 문자열로 변환
 */
function translateConcernsToRuRu(koText: string): string {
  if (!koText || typeof koText !== 'string') return '';
  const tags = parseConcernTags(koText.trim());
  if (tags.length === 0) return '';
  const translated: string[] = [];
  for (const tag of tags) {
    const ru = CONCERN_KO_TO_RU_RU.get(tag);
    translated.push(ru ?? tag);
  }
  return translated.join(' ');
}

/**
 * 기존 concernsMultilingual에 ru_RU만 설정/덮어쓰기
 */
function mergeRuRuIntoConcernsMultilingual(
  existing: unknown,
  ruRu: string,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
    const obj = existing as Record<string, unknown>;
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'string') out[k] = v;
    }
  }
  if (ruRu) out.ru_RU = ruRu;
  return out;
}

async function main(): Promise<void> {
  console.log('📖 지정 병원 리뷰 고민부위 러시아어(ru_RU) 매핑 갱신 스크립트');
  console.log(`대상 병원 수: ${TARGET_HOSPITALS.length}`);
  if (DRY_RUN) {
    console.log('⚠️  DRY RUN 모드: DB에 반영하지 않습니다.\n');
  }

  const hospitals = await prisma.hospital.findMany({
    select: { id: true, name: true },
  });

  const targetHospitalIds = hospitals
    .filter((h) =>
      TARGET_HOSPITALS.includes(getKoreanText(h.name as HospitalNameJson) as (typeof TARGET_HOSPITALS)[number]),
    )
    .map((h) => h.id);

  if (targetHospitalIds.length === 0) {
    console.log('❌ 대상 병원이 없습니다. 병원명(ko_KR)을 확인하세요.');
    return;
  }
  console.log(`✅ 대상 병원 ID ${targetHospitalIds.length}개`);

  const reviews = await prisma.review.findMany({
    where: {
      hospitalId: { in: targetHospitalIds },
      OR: [{ concerns: { not: null } }, { concernsMultilingual: { not: null } }],
    },
    select: { id: true, concerns: true, concernsMultilingual: true },
  });

  console.log(`📝 처리할 리뷰 수: ${reviews.length}\n`);

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  const BATCH_SIZE = 20;
  for (let i = 0; i < reviews.length; i += BATCH_SIZE) {
    const batch = reviews.slice(i, i + BATCH_SIZE);
    for (const review of batch) {
      const koText =
        (review.concerns && review.concerns.trim()) ||
        (typeof (review.concernsMultilingual as ConcernsMultilingualJson)?.ko_KR === 'string' &&
          (review.concernsMultilingual as ConcernsMultilingualJson)!.ko_KR!.trim()) ||
        '';
      if (!koText) {
        skipCount++;
        continue;
      }
      const ruRu = translateConcernsToRuRu(koText);
      if (!ruRu) {
        skipCount++;
        continue;
      }
      const updated = mergeRuRuIntoConcernsMultilingual(review.concernsMultilingual, ruRu);
      try {
        if (DRY_RUN) {
          const currentRu =
            (typeof (review.concernsMultilingual as ConcernsMultilingualJson)?.ru_RU === 'string' &&
              (review.concernsMultilingual as ConcernsMultilingualJson)!.ru_RU) ||
            '(없음)';
          console.log(`[DRY RUN] Review ${review.id}`);
          console.log(`  한국어 고민부위: ${koText}`);
          console.log(`  현재 ru_RU: ${currentRu}`);
          console.log(`  갱신될 ru_RU: ${ruRu}`);
          console.log('');
        } else {
          await prisma.review.update({
            where: { id: review.id },
            data: { concernsMultilingual: updated },
          });
        }
        successCount++;
      } catch (e) {
        failCount++;
        console.error(`❌ Review ${review.id}:`, e);
      }
    }
    if ((i + BATCH_SIZE) % 100 === 0 || i + BATCH_SIZE >= reviews.length) {
      console.log(`  진행: ${Math.min(i + BATCH_SIZE, reviews.length)}/${reviews.length}`);
    }
  }

  console.log('\n📊 결과');
  console.log(`  성공(갱신): ${successCount}`);
  console.log(`  스킵(고민부위 없음/매핑 없음): ${skipCount}`);
  console.log(`  실패: ${failCount}`);
  if (DRY_RUN && successCount > 0) {
    console.log('\n실제 반영을 하려면 --dry-run 없이 다시 실행하세요.');
  }
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((err: unknown) => {
      console.error('💥 스크립트 실행 실패:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

export { main as updateReviewConcernsRuRuFromMapping };
