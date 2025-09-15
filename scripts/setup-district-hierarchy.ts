import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// 다국어 이름 타입 정의
interface MultiLanguageName {
  ko_KR: string;
  th_TH: string;
  ja_JP: string;
  en_US: string;
  [key: string]: string; // Prisma JsonObject와 호환을 위한 index signature
}

// Type guard 함수
function isMultiLanguageName(value: Prisma.JsonValue): value is MultiLanguageName {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const obj = value as Record<string, unknown>;
  return (
    typeof obj.ko_KR === 'string' && typeof obj.th_TH === 'string' && typeof obj.ja_JP === 'string'
  );
}

// 상위 지역 정의 타입
interface ParentRegion {
  name: MultiLanguageName;
  displayName: string;
  code: string;
  order: number;
}

// 상위 지역 정의
const PARENT_REGIONS: ParentRegion[] = [
  {
    name: { ko_KR: '서울', th_TH: 'โซล', ja_JP: 'ソウル', en_US: 'Seoul' },
    displayName: '서울',
    code: 'SEOUL',
    order: 1,
  },
  {
    name: { ko_KR: '경기', th_TH: 'คย็องกี', ja_JP: '京畿', en_US: 'Gyeonggi' },
    displayName: '경기',
    code: 'GYEONGGI',
    order: 2,
  },
  {
    name: { ko_KR: '부산', th_TH: 'ปูซาน', ja_JP: '釜山', en_US: 'Busan' },
    displayName: '부산',
    code: 'BUSAN',
    order: 3,
  },
  {
    name: { ko_KR: '인천', th_TH: 'อินชอน', ja_JP: '仁川', en_US: 'Incheon' },
    displayName: '인천',
    code: 'INCHEON',
    order: 4,
  },
  {
    name: { ko_KR: '대구', th_TH: 'แทกู', ja_JP: '大邱', en_US: 'Daegu' },
    displayName: '대구',
    code: 'DAEGU',
    order: 5,
  },
  {
    name: { ko_KR: '대전', th_TH: 'แทจ็อง', ja_JP: '大田', en_US: 'Daejeon' },
    displayName: '대전',
    code: 'DAEJEON',
    order: 6,
  },
  {
    name: { ko_KR: '광주', th_TH: 'ควังจู', ja_JP: '光州', en_US: 'Gwangju' },
    displayName: '광주',
    code: 'GWANGJU',
    order: 7,
  },
  {
    name: { ko_KR: '울산', th_TH: 'อุลซาน', ja_JP: '蔚山', en_US: 'Ulsan' },
    displayName: '울산',
    code: 'ULSAN',
    order: 8,
  },
  {
    name: { ko_KR: '충북', th_TH: 'ชุงบุก', ja_JP: '忠北', en_US: 'Chungbuk' },
    displayName: '충북',
    code: 'CHUNGBUK',
    order: 9,
  },
  {
    name: { ko_KR: '충남', th_TH: 'ชุงนัม', ja_JP: '忠南', en_US: 'Chungnam' },
    displayName: '충남',
    code: 'CHUNGNAM',
    order: 10,
  },
  {
    name: { ko_KR: '전북', th_TH: 'จอนบุก', ja_JP: '全北', en_US: 'Jeonbuk' },
    displayName: '전북',
    code: 'JEONBUK',
    order: 11,
  },
  {
    name: { ko_KR: '전남', th_TH: 'จอนนัม', ja_JP: '全南', en_US: 'Jeonnam' },
    displayName: '전남',
    code: 'JEONNAM',
    order: 12,
  },
  {
    name: { ko_KR: '경북', th_TH: 'คย็องบุก', ja_JP: '慶北', en_US: 'Gyeongbuk' },
    displayName: '경북',
    code: 'GYEONGBUK',
    order: 13,
  },
  {
    name: { ko_KR: '경남', th_TH: 'คย็องนัม', ja_JP: '慶南', en_US: 'Gyeongnam' },
    displayName: '경남',
    code: 'GYEONGNAM',
    order: 14,
  },
  {
    name: { ko_KR: '강원', th_TH: 'กังวอน', ja_JP: '江原', en_US: 'Gangwon' },
    displayName: '강원',
    code: 'GANGWON',
    order: 15,
  },
  {
    name: { ko_KR: '제주', th_TH: 'เชจู', ja_JP: '濟州', en_US: 'Jeju' },
    displayName: '제주',
    code: 'JEJU',
    order: 16,
  },
  {
    name: { ko_KR: '기타', th_TH: 'อื่นๆ', ja_JP: 'その他', en_US: 'Others' },
    displayName: '기타',
    code: 'ETC',
    order: 17,
  },
];

// 하위 지역 매핑 (기존 지역명의 한국어 키워드로 상위 지역 판별)
const DISTRICT_MAPPING: Record<string, string[]> = {
  SEOUL: [
    '서울',
    '강남역/신논현/양재',
    '강서/마곡',
    '선릉/역삼/삼성',
    '도곡/대치/한티',
    '신사/논현/반포',
    '홍대/공덕',
    '청담/압구정',
    '수서/개포/일원',
    '서울대/봉천/신림',
    '상암/응암/은평',
    '중랑/상봉/사가정',
    '천호/강동',
    '가산/금천',
    '동대문/대학로/성신여대',
    '왕십리/성수/건대',
    '목동/등촌',
    '교대/방배',
    '문정/장지',
    '신촌/서대문',
    '신도림/구로',
    '수유/미아/창동',
    '여의도/영등포',
    '노원/상계/중계/하계',
    '잠실/방이/석촌',
    '동작/사당',
    '종로/을지로/명동',
    '용산/이태원/한남',
    '서초',
    '옥수/금호/약수',
    '청량리/답십리',
  ],
  GYEONGGI: [
    '경기',
    '일산/고양',
    '광주/이천/여주',
    '광명/시흥',
    '가평/양평',
    '남양주/구리',
    '파주/운정',
    '부천/상동',
    '안산',
    '안양/과천',
    '수원/광교',
    '하남/미사',
    '화성/동탄',
    '오산/안성/평택',
    '모란/중원',
    '복정/태평/수정',
    '의정부/양주',
    '군포/금정/의왕',
    '판교/분당',
    '용인/수지',
    '김포',
  ],
  BUSAN: [
    '부산',
    '부산진구/서면',
    '중구/남포동/중앙동',
    '남구/부경대',
    '북구/사상',
    '동구/부산역',
    '수영구/광안리',
    '강서구/명지',
    '사하구/괴정/하단',
    '연산/동래/부산대',
    '금정구/연제구',
    '해운대/센텀',
    '송정/기장',
  ],
  INCHEON: [
    '인천',
    '남동구/구월/논현',
    '동구/미추홀',
    '계양/부평',
    '송도/연수',
    '서구/청라',
    '중구/강화/옹진',
  ],
  DAEGU: [
    '대구',
    '중구/동성로/서문시장',
    '북구/칠곡',
    '동구/동대구역',
    '수성구/범어',
    '달서구/죽전/계명대',
    '달성군',
  ],
  DAEJEON: ['대전', '서구/둔산동', '유성구', '대덕구'],
  GWANGJU: ['광주', '서구/상무지구', '북구/광주역', '동구/남광주역/충장로', '광산구/수완동'],
  ULSAN: ['울산', '울주군'],
  CHUNGBUK: ['충북', '충북 기타', '청주', '충주', '제천/단양', '증평/괴산', '진천/음성'],
  CHUNGNAM: ['충남', '충남 기타', '천안/아산', '공주', '태안/안면도/서산', '영동/옥천'],
  JEONBUK: [
    '전북',
    '전북 기타',
    '전주/완주',
    '군산/익산',
    '김제/부안',
    '고창/정읍',
    '남원/임실/순창',
    '무주',
  ],
  JEONNAM: [
    '전남',
    '전남 기타',
    '여수/순천/광양',
    '목포/영암/무안',
    '나주/담양/함평',
    '해남/완도/진도',
  ],
  GYEONGBUK: [
    '경북',
    '경북 기타',
    '포항',
    '경주/구미',
    '안동/의성',
    '경산/영천/청도',
    '김천/칠곡',
    '문경/상주/영주/예천',
    '울진/영덕/청송',
  ],
  GYEONGNAM: [
    '경남',
    '경남 기타',
    '창원/마산/진해',
    '김해',
    '양산/밀양',
    '거제/통영/고성',
    '진주/사천',
    '남해/하동',
  ],
  GANGWON: [
    '강원',
    '강원 기타',
    '춘천/홍천/인제',
    '원주/횡성/평창',
    '강릉',
    '속초/양양/고성',
    '동해/삼척',
    '동두천/포천/연천',
    '화천/철원',
  ],
  JEJU: ['제주', '제주시', '서귀포시'],
  ETC: [
    '기타',
    '세종',
    '중구',
    '중구/남구/삼산',
    '남구',
    '동구',
    '서구/평리',
    '동구/북구',
    '서구/영도',
  ],
};

async function main() {
  console.log('🚀 District 계층 구조 설정을 시작합니다...');

  try {
    // 1. 상위 지역들 생성
    console.log('📍 상위 지역들을 생성합니다...');
    const parentRegions = new Map<string, string>();

    for (const region of PARENT_REGIONS) {
      const existingRegion = await prisma.district.findFirst({
        where: {
          name: {
            path: ['ko_KR'],
            equals: region.name.ko_KR,
          },
          level: 0,
        },
      });

      if (existingRegion) {
        console.log(`✅ 상위 지역 '${region.displayName}' 이미 존재합니다.`);
        parentRegions.set(region.code, existingRegion.id);
      } else {
        const newRegion = await prisma.district.create({
          data: {
            name: region.name,
            displayName: region.displayName,
            countryCode: 'KR',
            level: 0,
            order: region.order,
          },
        });
        console.log(`✨ 상위 지역 '${region.displayName}' 생성 완료`);
        parentRegions.set(region.code, newRegion.id);
      }
    }

    // 2. 기존 하위 지역들을 상위 지역과 연결
    console.log('🔗 기존 하위 지역들을 상위 지역과 연결합니다...');

    const existingDistricts = await prisma.district.findMany({
      where: {
        countryCode: 'KR',
        level: 0,
        parentId: null,
      },
    });

    let connectedCount = 0;
    let notFoundCount = 0;

    for (const district of existingDistricts) {
      // Type guard를 사용한 type-safe한 접근
      if (!isMultiLanguageName(district.name)) {
        console.log(`⚠️  잘못된 name 형식: ${district.id}`);
        continue;
      }

      const koName = district.name.ko_KR;

      // 이미 상위 지역인 경우 건너뛰기
      if (PARENT_REGIONS.some((region) => region.name.ko_KR === koName)) {
        continue;
      }

      // 매핑 찾기
      let parentCode: string | null = null;
      for (const [code, districts] of Object.entries(DISTRICT_MAPPING)) {
        if (districts.includes(koName)) {
          parentCode = code;
          break;
        }
      }

      if (parentCode && parentRegions.has(parentCode)) {
        const parentId = parentRegions.get(parentCode)!;

        await prisma.district.update({
          where: { id: district.id },
          data: {
            parentId: parentId,
            level: 1,
          },
        });

        console.log(
          `🔗 '${koName}' → '${PARENT_REGIONS.find((r) => r.code === parentCode)?.displayName}'`,
        );
        connectedCount++;
      } else {
        console.log(`⚠️  매핑을 찾을 수 없습니다: '${koName}'`);
        notFoundCount++;
      }
    }

    // 3. 결과 요약
    console.log('\n📊 작업 완료 요약:');
    console.log(`✅ 상위 지역 생성/확인: ${PARENT_REGIONS.length}개`);
    console.log(`🔗 하위 지역 연결: ${connectedCount}개`);
    console.log(`⚠️  매핑되지 않은 지역: ${notFoundCount}개`);

    // 4. 계층 구조 확인
    console.log('\n🌳 생성된 계층 구조:');
    const hierarchy = await prisma.district.findMany({
      where: {
        countryCode: 'KR',
        level: 0,
      },
      include: {
        children: {
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    for (const parent of hierarchy) {
      if (!isMultiLanguageName(parent.name)) continue;

      const parentName = parent.name.ko_KR;
      console.log(`📁 ${parentName} (${parent.children.length}개 하위 지역)`);

      for (const child of parent.children.slice(0, 3)) {
        if (!isMultiLanguageName(child.name)) continue;
        const childName = child.name.ko_KR;
        console.log(`   └── ${childName}`);
      }

      if (parent.children.length > 3) {
        console.log(`   └── ... 외 ${parent.children.length - 3}개`);
      }
    }
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
