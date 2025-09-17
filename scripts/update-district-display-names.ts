import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Json 값에서 안전하게 문자열 추출하는 헬퍼 함수
function extractStringFromJson(jsonValue: Prisma.JsonValue, key: string): string | null {
  if (jsonValue && typeof jsonValue === 'object' && !Array.isArray(jsonValue)) {
    const value = (jsonValue as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : null;
  }
  return null;
}

// District name에서 깔끔한 displayName 생성
function generateDisplayName(koreanName: string, level: number, _parentName?: string): string {
  if (!koreanName) return '';

  // Level 0 (시/도 단위) - 그대로 사용
  if (level === 0) {
    return koreanName;
  }

  // Level 1 (구/군/동 단위) - 복합 지역명 간소화
  if (level === 1) {
    // 복합 지역명 처리 (예: "도곡/대치/한티" → "대치")
    if (koreanName.includes('/')) {
      const simplifiedName = simplifyComplexDistrictName(koreanName);
      return simplifiedName;
    }

    // 단일 지역명 처리
    const simplifiedName = simplifyDistrictName(koreanName);
    return simplifiedName;
  }

  return koreanName;
}

// 복합 지역명 간소화 (가장 대표적인 지역명 선택)
function simplifyComplexDistrictName(complexName: string): string {
  const districtPriorityMap: { [key: string]: string } = {
    // 서울 지역 (실제 데이터 순서 기반)
    '강남역/신논현/양재': '강남역',
    '강서/마곡': '강서',
    '선릉/역삼/삼성': '역삼',
    '도곡/대치/한티': '대치',
    '신사/논현/반포': '압구정',
    '홍대/공덕': '홍대',
    '청량리/답십리': '청량리',
    '교대/방배': '교대',
    '신촌/서대문': '신촌',
    '동작/사당': '사당',
    '잠실/방이/석촌': '잠실',
    '문정/장지': '문정',
    '상암/응암/은평': '상암',
    '천호/강동': '천호',
    '서울대/봉천/신림': '서울대',
    '여의도/영등포': '여의도',
    '종로/을지로/명동': '명동',
    '신도림/구로': '구로',
    '가산/금천': '가산',
    '수유/미아/창동': '수유',
    '목동/등촌': '목동',
    '용산/이태원/한남': '용산',
    '동대문/대학로/성신여대': '동대문',
    '옥수/금호/약수': '옥수',
    '노원/상계/중계/하계': '노원',
    '왕십리/성수/건대': '건대',
    '중랑/상봉/사가정': '중랑',
    '수서/개포/일원': '수서',

    // 경기 지역 (실제 데이터 순서 기반)
    '광주/이천/여주': '광주',
    '판교/분당': '분당',
    '모란/중원': '모란',
    '복정/태평/수정': '복정',
    '안양/과천': '안양',
    '군포/금정/의왕': '군포',
    '화성/동탄': '동탄',
    '오산/안성/평택': '평택',
    '용인/수지': '용인',
    '수원/광교': '수원',
    '부천/상동': '부천',
    '광명/시흥': '광명',
    '일산/고양': '일산',
    '파주/운정': '파주',
    '남양주/구리': '남양주',
    '하남/미사': '하남',
    '의정부/양주': '의정부',
    '동두천/포천/연천': '동두천',
    '가평/양평': '가평',

    // 부산 지역
    '동구/부산역': '부산역',
    '금정구/연제구': '금정구',
    '해운대/센텀': '해운대',
    '수영구/광안리': '광안리',
    '남구/부경대': '남구',
    '사하구/괴정/하단': '사하구',
    '연산/동래/부산대': '부산대',
    '부산진구/서면': '서면',
    '중구/남포동/중앙동': '남포동',
    '송정/기장': '송정',
    '강서구/명지': '강서구',
    '북구/사상': '북구',

    // 인천 지역
    '동구/미추홀': '동구',
    '중구/강화/옹진': '중구',
    '서구/청라': '청라',
    '계양/부평': '부평',
    '남동구/구월/논현': '구월',
    '송도/연수': '송도',

    // 대구 지역
    '중구/동성로/서문시장': '동성로',
    '동구/동대구역': '동대구역',
    '북구/칠곡': '북구',
    '수성구/범어': '수성구',
    '달서구/죽전/계명대': '달서구',

    // 대전 지역
    '서구/둔산동': '둔산',

    // 광주 지역
    '서구/상무지구': '상무',
    '북구/광주역': '북구',
    '동구/남광주역/충장로': '충장로',
    '광산구/수완동': '수완',

    // 충남 지역
    '태안/안면도/서산': '태안',
    '천안/아산': '천안',
    '영동/옥천': '영동',

    // 충북 지역
    '제천/단양': '제천',
    '진천/음성': '진천',
    '증평/괴산': '증평',

    // 전남 지역
    '해남/완도/진도': '해남',
    '목포/영암/무안': '목포',
    '나주/담양/함평': '나주',
    '여수/순천/광양': '여수',

    // 전북 지역
    '김제/부안': '김제',
    '군산/익산': '군산',
    '전주/완주': '전주',
    '고창/정읍': '고창',
    '남원/임실/순창': '남원',

    // 경남 지역
    '창원/마산/진해': '창원',
    '양산/밀양': '양산',
    '거제/통영/고성': '거제',
    '진주/사천': '진주',
    '남해/하동': '남해',

    // 경북 지역
    '경주/구미': '경주',
    '경산/영천/청도': '경산',
    '안동/의성': '안동',
    '김천/칠곡': '김천',
    '문경/상주/영주/예천': '문경',
    '울진/영덕/청송': '울진',

    // 강원 지역
    '속초/양양/고성': '속초',
    '동해/삼척': '동해',
    '춘천/홍천/인제': '춘천',
    '화천/철원': '화천',
    '원주/횡성/평창': '원주',

    // 기타 지역
    '서구/영도': '서구',
    '서구/평리': '서구',
    '동구/북구': '동구',
    '중구/남구/삼산': '중구',
  };

  // 정확한 매칭 먼저 시도
  if (districtPriorityMap[complexName]) {
    return districtPriorityMap[complexName];
  }

  // 부분 매칭 시도
  for (const [key, value] of Object.entries(districtPriorityMap)) {
    if (complexName.includes(key) || key.includes(complexName)) {
      return value;
    }
  }

  // 매칭되지 않으면 첫 번째 지역명 사용
  const firstDistrict = complexName.split('/')[0];
  return simplifyDistrictName(firstDistrict);
}

// 단일 지역명 간소화
function simplifyDistrictName(districtName: string): string {
  // 특수 케이스 먼저 처리 (실제 데이터 기반)
  const specialCases: { [key: string]: string } = {
    // "기타" 케이스들
    '충북 기타': '충북',
    '충남 기타': '충남',
    '전남 기타': '전남',
    '전북 기타': '전북',
    '경남 기타': '경남',
    '경북 기타': '경북',
    '강원 기타': '강원',

    // 특별한 지역명들
    제주시: '제주시',
    서귀포시: '서귀포시',
    울주군: '울주군',
    달성군: '달성군',

    // 단일 지역명들 (그대로 유지)
    안산: '안산',
    김포: '김포',
    김해: '김해',
    포항: '포항',
    강릉: '강릉',
    공주: '공주',
    유성구: '유성구',
    대덕구: '대덕구',
    세종: '세종',
    청주: '청주',
    충주: '충주',
    무주: '무주',
    서초: '서초',
  };

  if (specialCases[districtName]) {
    return specialCases[districtName];
  }

  // 일반적인 접미사 제거
  const simplified = districtName
    .replace(/구$/, '')
    .replace(/군$/, '')
    .replace(/시$/, '')
    .replace(/동$/, '')
    .replace(/읍$/, '')
    .replace(/면$/, '');

  return simplified || districtName;
}

// JSON displayName 생성
function generateDisplayNameJson(nameJson: Prisma.JsonValue, level: number): Prisma.JsonValue {
  if (!nameJson || typeof nameJson !== 'object' || Array.isArray(nameJson)) {
    return null;
  }

  const nameObj = nameJson as Record<string, unknown>;
  const koreanName = extractStringFromJson(nameJson, 'ko_KR');

  if (!koreanName) {
    return null;
  }

  // 간소화된 한국어 이름 생성
  const simplifiedKoreanName = generateDisplayName(koreanName, level);

  // displayName JSON 객체 생성
  const displayNameObj: Record<string, string> = {};

  // 모든 언어에 대해 처리
  for (const [lang, value] of Object.entries(nameObj)) {
    if (typeof value === 'string') {
      if (lang === 'ko_KR') {
        // 한국어는 간소화된 버전 사용
        displayNameObj[lang] = simplifiedKoreanName;
      } else {
        // 다른 언어는 원본 그대로 사용
        displayNameObj[lang] = value;
      }
    }
  }

  return displayNameObj;
}

async function updateDistrictDisplayNames() {
  try {
    console.log('🏛️ District displayName JSON 업데이트를 시작합니다...');

    // 모든 District 데이터 조회
    const districts = await prisma.district.findMany({
      select: {
        id: true,
        name: true,
        level: true,
      },
      orderBy: [{ level: 'asc' }, { order: 'asc' }],
    });

    console.log(`📊 총 ${districts.length}개의 District 데이터를 처리합니다.`);

    let updatedCount = 0;
    let errorCount = 0;

    // 각 District의 displayName 업데이트
    for (const district of districts) {
      try {
        const koreanName = extractStringFromJson(district.name, 'ko_KR');

        if (!koreanName) {
          console.log(`⚠️ District ID ${district.id}: 한국어 이름이 없습니다.`);
          continue;
        }

        const displayNameJson = generateDisplayNameJson(district.name, district.level);

        if (!displayNameJson) {
          console.log(`⚠️ District ID ${district.id}: displayName 생성에 실패했습니다.`);
          continue;
        }

        await prisma.district.update({
          where: { id: district.id },
          data: { displayName: displayNameJson },
        });

        const simplifiedKoreanName = generateDisplayName(koreanName, district.level);
        console.log(`✅ Level ${district.level}: ${koreanName} → ${simplifiedKoreanName}`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ District ID ${district.id} 업데이트 실패:`, error);
        errorCount++;
      }
    }

    console.log('\n📈 업데이트 완료!');
    console.log(`✅ 성공: ${updatedCount}개`);
    console.log(`❌ 실패: ${errorCount}개`);

    // 결과 샘플 확인
    console.log('\n🔍 업데이트된 결과 샘플:');
    const sampleResults = await prisma.district.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        level: true,
      },
      where: {
        displayName: {
          not: Prisma.JsonNull,
        },
      },
      orderBy: [{ level: 'asc' }, { order: 'asc' }],
      take: 15,
    });

    sampleResults.forEach((district) => {
      const koreanName = extractStringFromJson(district.name, 'ko_KR');
      const displayKoreanName = extractStringFromJson(district.displayName, 'ko_KR');
      console.log(`Level ${district.level}: ${koreanName} → ${displayKoreanName}`);
      console.log(`  전체 displayName:`, district.displayName);
    });
  } catch (error) {
    console.error('❌ 업데이트 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  updateDistrictDisplayNames();
}
export { updateDistrictDisplayNames };
