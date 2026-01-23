/**
 * District 매핑 정보 분석 스크립트
 *
 * DB에 있는 District 데이터와 매핑 정보를 비교하여 분석합니다.
 */

import { prisma } from '../../lib/prisma';
import { getAllMappedDistrictNames, isMappedDistrict, DISTRICT_MAPPING } from './district-mapping';
import { getKoreanText } from './utils';

async function analyzeDistrictMapping(): Promise<void> {
  try {
    console.log('🔄 District 매핑 정보 분석 시작...\n');

    // 매핑 정보에 있는 모든 지역명 목록
    const mappedNames = getAllMappedDistrictNames();
    console.log(`📋 매핑 정보에 정의된 지역명: ${mappedNames.length}개`);
    console.log('매핑된 지역명 목록:');
    mappedNames.forEach((name, index) => {
      console.log(`  ${index + 1}. ${name}`);
    });
    console.log('');

    // DB에서 모든 District 조회
    const districts = await prisma.district.findMany({
      where: {
        countryCode: 'KR',
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        level: true,
      },
    });

    console.log(`📊 DB에 있는 전체 District 수: ${districts.length}개\n`);

    // 한국어 이름 추출
    const districtKoreanNames = districts.map((d) => ({
      id: d.id,
      koreanName: getKoreanText(d.name),
      level: d.level,
    }));

    // 매핑 정보에 있는 지역명
    const mappedDistricts = districtKoreanNames.filter((d) =>
      isMappedDistrict(d.koreanName),
    );

    // 매핑 정보에 없는 지역명
    const unmappedDistricts = districtKoreanNames.filter(
      (d) => !isMappedDistrict(d.koreanName),
    );

    console.log('='.repeat(80));
    console.log('📈 분석 결과');
    console.log('='.repeat(80));
    console.log(`✅ 매핑 정보에 해당하는 데이터: ${mappedDistricts.length}개`);
    console.log(`❌ 매핑 정보에 없는 데이터: ${unmappedDistricts.length}개\n`);

    console.log('✅ 매핑 정보에 해당하는 지역명:');
    mappedDistricts.forEach((d, index) => {
      console.log(`  ${index + 1}. ${d.koreanName} (ID: ${d.id}, Level: ${d.level})`);
    });
    console.log('');

    console.log('❌ 매핑 정보에 없는 지역명:');
    console.log(`총 ${unmappedDistricts.length}개\n`);
    
    // Level별로 그룹화
    const unmappedByLevel = unmappedDistricts.reduce((acc, d) => {
      if (!acc[d.level]) {
        acc[d.level] = [];
      }
      acc[d.level].push(d);
      return acc;
    }, {} as Record<number, typeof unmappedDistricts>);

    // Level별로 출력
    const sortedLevels = Object.keys(unmappedByLevel)
      .map(Number)
      .sort((a, b) => a - b);

    for (const level of sortedLevels) {
      const districts = unmappedByLevel[level];
      console.log(`\n[Level ${level}] ${districts.length}개:`);
      districts.forEach((d, index) => {
        console.log(`  ${index + 1}. ${d.koreanName} (ID: ${d.id})`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📋 매핑 정보에 없는 지역명 전체 목록 (정렬):');
    console.log('='.repeat(80));
    unmappedDistricts
      .sort((a, b) => a.koreanName.localeCompare(b.koreanName))
      .forEach((d, index) => {
        console.log(`${String(index + 1).padStart(3, ' ')}. ${d.koreanName} (Level: ${d.level})`);
      });
    console.log('');

    // 대분류별 통계
    console.log('='.repeat(80));
    console.log('📊 대분류별 매핑 통계');
    console.log('='.repeat(80));

    const categories: Array<'서울' | '경기' | '부산' | '인천' | '제주'> = [
      '서울',
      '경기',
      '부산',
      '인천',
      '제주',
    ];

    for (const category of categories) {
      const categoryDistricts = DISTRICT_MAPPING[category];
      const categoryNames = Object.keys(categoryDistricts);
      const foundInDb = districtKoreanNames.filter((d) =>
        categoryNames.includes(d.koreanName),
      );

      console.log(`\n${category}:`);
      console.log(`  매핑 정보: ${categoryNames.length}개`);
      console.log(`  DB에서 발견: ${foundInDb.length}개`);
      console.log(`  지역명:`);
      categoryNames.forEach((name) => {
        const found = foundInDb.some((d) => d.koreanName === name);
        console.log(`    ${found ? '✅' : '❌'} ${name}`);
      });
    }

    console.log('\n🎉 분석 완료!');
  } catch (error) {
    console.error('❌ 분석 실패:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  analyzeDistrictMapping()
    .then(() => {
      console.log('\n✅ 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { analyzeDistrictMapping };
