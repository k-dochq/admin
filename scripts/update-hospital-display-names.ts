import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Prisma Json 타입을 위한 타입 정의 (사용하지 않으므로 제거)
// interface HospitalData는 직접 쿼리에서 타입을 사용하므로 제거

// Json 값에서 안전하게 문자열 추출하는 헬퍼 함수
function extractStringFromJson(jsonValue: Prisma.JsonValue, key: string): string | null {
  if (jsonValue && typeof jsonValue === 'object' && !Array.isArray(jsonValue)) {
    const value = (jsonValue as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : null;
  }
  return null;
}

// 지역명 매핑 함수
function generateDisplayName(koreanName: string, koreanAddress: string | null): string {
  if (!koreanName) return '';

  // 기본적으로 병원명을 사용
  let displayName = koreanName;

  // 주소가 있는 경우 지역 정보 추출 및 정리
  if (koreanAddress) {
    const cleanedAddress = cleanAddress(koreanAddress);
    if (cleanedAddress) {
      // 병원명에서 지역 정보 제거 (중복 방지)
      const nameWithoutLocation = removeLocationFromName(koreanName);
      displayName = `${cleanedAddress} ${nameWithoutLocation}`;
    }
  } else {
    // 주소가 없는 경우 병원명에서 지역 정보 추출
    displayName = extractLocationFromName(koreanName);
  }

  return displayName.trim();
}

// District 데이터 기반 지역 매핑 객체
const DISTRICT_MAPPING = {
  // 서울 지역 매핑 (District 데이터 기반)
  seoul: {
    '강남역/신논현/양재': '강남역',
    '강서/마곡': '강서',
    '선릉/역삼/삼성': '역삼',
    '도곡/대치/한티': '대치',
    '신사/논현/반포': '압구정',
    '홍대/공덕': '홍대',
    '청담/압구정': '압구정',
    '수서/개포/일원': '수서',
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
    서초: '서초',
  },
  // 경기 지역 매핑
  gyeonggi: {
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
    안산: '안산',
    김포: '김포',
    '일산/고양': '일산',
    '파주/운정': '파주',
    '남양주/구리': '남양주',
    '하남/미사': '하남',
    '의정부/양주': '의정부',
    '동두천/포천/연천': '동두천',
    '가평/양평': '가평',
  },
  // 부산 지역 매핑
  busan: {
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
  },
  // 인천 지역 매핑
  incheon: {
    '동구/미추홀': '동구',
    '중구/강화/옹진': '중구',
    '서구/청라': '청라',
    '계양/부평': '부평',
    '남동구/구월/논현': '구월',
    '송도/연수': '송도',
  },
  // 대구 지역 매핑
  daegu: {
    '중구/동성로/서문시장': '동성로',
    '동구/동대구역': '동대구역',
    '북구/칠곡': '북구',
    '수성구/범어': '수성구',
    '달서구/죽전/계명대': '달서구',
    달성군: '달성군',
  },
};

// 주소에서 깔끔한 지역명 추출 (District 데이터 기반)
function cleanAddress(address: string): string {
  if (!address) return '';

  // 서울 지역 처리
  if (address.includes('서울')) {
    // 구체적인 동명 매칭
    for (const [districtKey, simpleName] of Object.entries(DISTRICT_MAPPING.seoul)) {
      const districts = districtKey.split('/');
      for (const district of districts) {
        if (address.includes(district)) {
          return `서울 ${simpleName}`;
        }
      }
    }

    // 구 단위 매칭
    const seoulGuMatch = address.match(
      /서울.*?(강남구|서초구|종로구|중구|용산구|성동구|광진구|동대문구|중랑구|성북구|강북구|도봉구|노원구|은평구|서대문구|마포구|양천구|강서구|구로구|금천구|영등포구|동작구|관악구|송파구|강동구)/,
    );
    if (seoulGuMatch) {
      const gu = seoulGuMatch[1].replace('구', '');
      return `서울 ${gu}`;
    }

    // 동명 매칭
    const seoulDongMatch = address.match(/서울.*?([가-힣]+동)/);
    if (seoulDongMatch) {
      const dong = simplifyDongName(seoulDongMatch[1]);
      return `서울 ${dong}`;
    }

    return '서울';
  }

  // 경기 지역 처리
  if (address.includes('경기') || isGyeonggiCity(address)) {
    for (const [districtKey, simpleName] of Object.entries(DISTRICT_MAPPING.gyeonggi)) {
      const districts = districtKey.split('/');
      for (const district of districts) {
        if (address.includes(district)) {
          return `경기 ${simpleName}`;
        }
      }
    }

    // 경기도 시 단위 매칭
    const gyeonggiCityMatch = address.match(
      /(수원|성남|안양|부천|광명|평택|동탄|안산|고양|과천|구리|남양주|오산|시흥|군포|의왕|하남|용인|파주|이천|안성|김포|화성|광주|양주|포천|여주|연천|가평|양평)/,
    );
    if (gyeonggiCityMatch) {
      return `경기 ${gyeonggiCityMatch[1]}`;
    }

    return '경기';
  }

  // 부산 지역 처리
  if (address.includes('부산')) {
    for (const [districtKey, simpleName] of Object.entries(DISTRICT_MAPPING.busan)) {
      const districts = districtKey.split('/');
      for (const district of districts) {
        if (address.includes(district)) {
          return `부산 ${simpleName}`;
        }
      }
    }

    // 부산 구 단위 매칭
    const busanGuMatch = address.match(
      /부산.*?(중구|서구|동구|영도구|부산진구|동래구|남구|북구|해운대구|사하구|금정구|강서구|연제구|수영구|사상구|기장군)/,
    );
    if (busanGuMatch) {
      const gu = busanGuMatch[1].replace('구', '').replace('군', '');
      return `부산 ${gu}`;
    }

    return '부산';
  }

  // 인천 지역 처리
  if (address.includes('인천')) {
    for (const [districtKey, simpleName] of Object.entries(DISTRICT_MAPPING.incheon)) {
      const districts = districtKey.split('/');
      for (const district of districts) {
        if (address.includes(district)) {
          return `인천 ${simpleName}`;
        }
      }
    }

    const incheonGuMatch = address.match(
      /인천.*?(중구|동구|미추홀구|연수구|남동구|부평구|계양구|서구)/,
    );
    if (incheonGuMatch) {
      const gu = incheonGuMatch[1].replace('구', '');
      return `인천 ${gu}`;
    }

    return '인천';
  }

  // 대구 지역 처리
  if (address.includes('대구')) {
    for (const [districtKey, simpleName] of Object.entries(DISTRICT_MAPPING.daegu)) {
      const districts = districtKey.split('/');
      for (const district of districts) {
        if (address.includes(district)) {
          return `대구 ${simpleName}`;
        }
      }
    }

    const daeguGuMatch = address.match(/대구.*?(중구|동구|서구|남구|북구|수성구|달서구|달성군)/);
    if (daeguGuMatch) {
      const gu = daeguGuMatch[1].replace('구', '').replace('군', '');
      return `대구 ${gu}`;
    }

    return '대구';
  }

  // 기타 광역시 처리
  const majorCityMatch = address.match(/(대전|광주|울산|세종).*?([가-힣]+구|[가-힣]+군)/);
  if (majorCityMatch) {
    const city = majorCityMatch[1];
    const gu = majorCityMatch[2].replace('구', '').replace('군', '');
    return `${city} ${gu}`;
  }

  // 도 단위 처리
  const provinceMatch = address.match(
    /(강원|충북|충남|전북|전남|경북|경남|제주).*?([가-힣]+시|[가-힣]+군)/,
  );
  if (provinceMatch) {
    const province = provinceMatch[1];
    const city = provinceMatch[2].replace('시', '').replace('군', '');
    return `${province} ${city}`;
  }

  return '';
}

// 경기도 도시인지 확인하는 헬퍼 함수
function isGyeonggiCity(address: string): boolean {
  const gyeonggiCities = [
    '수원',
    '성남',
    '안양',
    '부천',
    '광명',
    '평택',
    '동탄',
    '안산',
    '고양',
    '과천',
    '구리',
    '남양주',
    '오산',
    '시흥',
    '군포',
    '의왕',
    '하남',
    '용인',
    '파주',
    '이천',
    '안성',
    '김포',
    '화성',
    '광주',
    '양주',
    '포천',
    '여주',
    '연천',
    '가평',
    '양평',
  ];

  return gyeonggiCities.some((city) => address.includes(city));
}

// 동명 간소화
function simplifyDongName(dong: string): string {
  const dongMap: { [key: string]: string } = {
    신사동: '압구정',
    청담동: '청담',
    논현동: '논현',
    역삼동: '역삼',
    서초동: '서초',
    반포동: '반포',
    잠원동: '잠원',
    부전동: '서면',
    가야동: '가야',
  };

  return dongMap[dong] || dong.replace('동', '');
}

// 병원명에서 지역 정보 제거
function removeLocationFromName(name: string): string {
  // 지역명이 포함된 패턴들 제거
  return name
    .replace(/^서울\s*/, '')
    .replace(/\s*(강남|서초|압구정|청담|논현|역삼|서초|반포|잠원|도곡|대치|한티)\s*/, '')
    .replace(/\s*(점|지점|분원)\s*$/, '')
    .trim();
}

// 병원명에서 지역 정보 추출 (주소가 없는 경우)
function extractLocationFromName(name: string): string {
  // 서울 지역명이 포함된 경우
  const seoulLocations = [
    '압구정',
    '청담',
    '강남',
    '서초',
    '신사',
    '논현',
    '역삼',
    '선릉',
    '삼성',
    '도곡',
    '대치',
    '한티',
    '반포',
    '잠원',
    '교대',
    '방배',
    '홍대',
    '신촌',
    '명동',
    '종로',
    '을지로',
    '용산',
    '이태원',
    '한남',
    '잠실',
    '석촌',
    '건대',
    '성수',
    '왕십리',
    '동대문',
    '대학로',
    '노원',
    '상계',
    '중계',
    '수유',
    '미아',
    '창동',
    '목동',
    '등촌',
    '구로',
    '신도림',
    '가산',
    '금천',
    '여의도',
    '영등포',
    '상암',
    '마곡',
    '강서',
    '천호',
    '강동',
    '서울대',
    '봉천',
    '신림',
    '사당',
    '동작',
    '문정',
    '장지',
    '수서',
    '개포',
    '일원',
    '청량리',
    '답십리',
    '옥수',
    '금호',
    '약수',
    '중랑',
    '상봉',
    '사가정',
  ];

  for (const location of seoulLocations) {
    if (name.includes(location)) {
      const mappedLocation = mapSeoulLocation(location);
      return `서울 ${mappedLocation} ${removeLocationFromName(name)}`;
    }
  }

  // 경기 지역명이 포함된 경우
  const gyeonggiLocations = [
    '분당',
    '판교',
    '수원',
    '성남',
    '안양',
    '부천',
    '광명',
    '평택',
    '동탄',
    '안산',
    '고양',
    '일산',
    '파주',
    '김포',
    '하남',
    '미사',
    '용인',
    '수지',
    '의정부',
    '남양주',
    '구리',
    '광주',
    '이천',
    '여주',
  ];

  for (const location of gyeonggiLocations) {
    if (name.includes(location)) {
      return `경기 ${location} ${removeLocationFromName(name)}`;
    }
  }

  // 부산 지역명이 포함된 경우
  const busanLocations = [
    '서면',
    '해운대',
    '센텀',
    '광안리',
    '남포동',
    '중앙동',
    '부산역',
    '송정',
    '기장',
    '사상',
    '부산대',
    '동래',
    '연산',
  ];

  for (const location of busanLocations) {
    if (name.includes(location)) {
      return `부산 ${location} ${removeLocationFromName(name)}`;
    }
  }

  // 기타 주요 도시명이 포함된 경우
  const majorCities = ['대구', '인천', '대전', '광주', '울산', '세종'];
  for (const city of majorCities) {
    if (name.includes(city)) {
      return `${city} ${removeLocationFromName(name)}`;
    }
  }

  // 복합 지역명 처리 (예: "도곡/대치/한티")
  if (name.includes('/')) {
    const locationMatch = name.match(/([가-힣]+)\/([가-힣]+)/);
    if (locationMatch) {
      const firstLocation = locationMatch[1];

      // 서울 지역인 경우
      if (seoulLocations.includes(firstLocation)) {
        const mappedLocation = mapSeoulLocation(firstLocation);
        return `서울 ${mappedLocation} ${removeLocationFromName(name)}`;
      }

      // 경기 지역인 경우
      if (gyeonggiLocations.includes(firstLocation)) {
        return `경기 ${firstLocation} ${removeLocationFromName(name)}`;
      }

      // 부산 지역인 경우
      if (busanLocations.includes(firstLocation)) {
        return `부산 ${firstLocation} ${removeLocationFromName(name)}`;
      }
    }
  }

  return name;
}

// 서울 지역명 매핑 헬퍼 함수
function mapSeoulLocation(location: string): string {
  const locationMap: { [key: string]: string } = {
    도곡: '대치',
    대치: '대치',
    한티: '대치',
    신사: '압구정',
    논현: '압구정',
    청담: '압구정',
    압구정: '압구정',
    역삼: '역삼',
    선릉: '역삼',
    삼성: '역삼',
    강남: '강남역',
    서초: '서초',
    반포: '압구정',
    잠원: '압구정',
    교대: '교대',
    방배: '교대',
    홍대: '홍대',
    신촌: '신촌',
    명동: '명동',
    종로: '명동',
    을지로: '명동',
    용산: '용산',
    이태원: '용산',
    한남: '용산',
    잠실: '잠실',
    석촌: '잠실',
    건대: '건대',
    성수: '건대',
    왕십리: '건대',
  };

  return locationMap[location] || location;
}

async function updateHospitalDisplayNames() {
  try {
    console.log('🏥 병원 displayName 업데이트를 시작합니다...');

    // 먼저 displayName 컬럼이 있는지 확인하고 없으면 추가
    try {
      await prisma.$executeRaw`ALTER TABLE "Hospital" ADD COLUMN IF NOT EXISTS "displayName" VARCHAR(255);`;
      console.log('✅ displayName 컬럼이 추가되었습니다.');
    } catch (_error) {
      console.log('ℹ️ displayName 컬럼이 이미 존재하거나 추가할 수 없습니다.');
    }

    // 모든 병원 데이터 조회
    const hospitals = await prisma.hospital.findMany({
      select: {
        id: true,
        name: true,
        address: true,
      },
    });

    console.log(`📊 총 ${hospitals.length}개의 병원 데이터를 처리합니다.`);

    let updatedCount = 0;
    let errorCount = 0;

    // 각 병원의 displayName 업데이트
    for (const hospital of hospitals) {
      try {
        const koreanName = extractStringFromJson(hospital.name, 'ko_KR');
        const koreanAddress = extractStringFromJson(hospital.address, 'ko_KR');

        if (!koreanName) {
          console.log(`⚠️ 병원 ID ${hospital.id}: 한국어 이름이 없습니다.`);
          continue;
        }

        const displayName = generateDisplayName(koreanName, koreanAddress);

        // displayName 업데이트 (Raw SQL 사용)
        await prisma.$executeRaw`
          UPDATE "Hospital" 
          SET "displayName" = ${displayName}
          WHERE id = ${hospital.id}::uuid
        `;

        console.log(`✅ ${koreanName} → ${displayName}`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ 병원 ID ${hospital.id} 업데이트 실패:`, error);
        errorCount++;
      }
    }

    console.log('\n📈 업데이트 완료!');
    console.log(`✅ 성공: ${updatedCount}개`);
    console.log(`❌ 실패: ${errorCount}개`);

    // 결과 샘플 확인 (Raw SQL 사용)
    console.log('\n🔍 업데이트된 결과 샘플:');
    const sampleResults = await prisma.$queryRaw<
      Array<{
        id: string;
        name: Prisma.JsonValue;
        address: Prisma.JsonValue;
        displayName: string | null;
      }>
    >`
      SELECT id, name, address, "displayName"
      FROM "Hospital"
      WHERE "displayName" IS NOT NULL
      LIMIT 10
    `;

    sampleResults.forEach((hospital) => {
      const koreanName = extractStringFromJson(hospital.name, 'ko_KR');
      console.log(`${koreanName} → ${hospital.displayName}`);
    });
  } catch (error) {
    console.error('❌ 업데이트 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  updateHospitalDisplayNames();
}

export { updateHospitalDisplayNames };
