import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// 다국어 이름 타입 정의
interface MultiLanguageName {
  ko_KR: string;
  th_TH: string;
  ja_JP: string;
  en_US?: string;
  [key: string]: string | undefined; // Prisma JsonObject와 호환을 위한 index signature
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

// 한국어 → 영어 번역 매핑
const KOREAN_TO_ENGLISH: Record<string, string> = {
  // 서울 지역
  서울: 'Seoul',
  '강남역/신논현/양재': 'Gangnam Station/Sinnonhyeon/Yangjae',
  '강서/마곡': 'Gangseo/Magok',
  '선릉/역삼/삼성': 'Seolleung/Yeoksam/Samsung',
  '도곡/대치/한티': 'Dogok/Daechi/Hanti',
  '신사/논현/반포': 'Sinsa/Nonhyeon/Banpo',
  '홍대/공덕': 'Hongdae/Gongdeok',
  '청담/압구정': 'Cheongdam/Apgujeong',
  '수서/개포/일원': 'Suseo/Gaepo/Ilwon',
  '서울대/봉천/신림': 'Seoul National University/Bongcheon/Sillim',
  '상암/응암/은평': 'Sangam/Eungam/Eunpyeong',
  '중랑/상봉/사가정': 'Jungnang/Sangbong/Sagajeong',
  '천호/강동': 'Cheonho/Gangdong',
  '가산/금천': 'Gasan/Geumcheon',
  '동대문/대학로/성신여대': "Dongdaemun/Daehangno/Sungshin Women's University",
  '왕십리/성수/건대': 'Wangsimni/Seongsu/Konkuk University',
  '목동/등촌': 'Mok-dong/Deungchon',
  '교대/방배': 'Seoul National University of Education/Bangbae',
  '문정/장지': 'Munjeong/Jangji',
  '신촌/서대문': 'Sinchon/Seodaemun',
  '신도림/구로': 'Sindorim/Guro',
  '수유/미아/창동': 'Suyu/Mia/Changdong',
  '여의도/영등포': 'Yeouido/Yeongdeungpo',
  '노원/상계/중계/하계': 'Nowon/Sanggye/Junggye/Hagye',
  '잠실/방이/석촌': 'Jamsil/Bangi/Seokchon',
  '동작/사당': 'Dongjak/Sadang',
  '종로/을지로/명동': 'Jongno/Euljiro/Myeongdong',
  '용산/이태원/한남': 'Yongsan/Itaewon/Hannam',
  서초: 'Seocho',
  '옥수/금호/약수': 'Oksu/Geumho/Yaksu',
  '청량리/답십리': 'Cheongnyangni/Dapsimni',

  // 경기 지역
  경기: 'Gyeonggi',
  '일산/고양': 'Ilsan/Goyang',
  '광주/이천/여주': 'Gwangju/Icheon/Yeoju',
  '광명/시흥': 'Gwangmyeong/Siheung',
  '가평/양평': 'Gapyeong/Yangpyeong',
  '남양주/구리': 'Namyangju/Guri',
  '파주/운정': 'Paju/Unjeong',
  '부천/상동': 'Bucheon/Sangdong',
  안산: 'Ansan',
  '안양/과천': 'Anyang/Gwacheon',
  '수원/광교': 'Suwon/Gwanggyo',
  '하남/미사': 'Hanam/Misa',
  '화성/동탄': 'Hwaseong/Dongtan',
  '오산/안성/평택': 'Osan/Anseong/Pyeongtaek',
  '모란/중원': 'Moran/Jungwon',
  '복정/태평/수정': 'Bokjeong/Taepyeong/Sujeong',
  '의정부/양주': 'Uijeongbu/Yangju',
  '군포/금정/의왕': 'Gunpo/Geumjeong/Uiwang',
  '판교/분당': 'Pangyo/Bundang',
  '용인/수지': 'Yongin/Suji',
  김포: 'Gimpo',

  // 부산 지역
  부산: 'Busan',
  '부산진구/서면': 'Busanjin-gu/Seomyeon',
  '중구/남포동/중앙동': 'Jung-gu/Nampo-dong/Jungang-dong',
  '남구/부경대': 'Nam-gu/Pukyong National University',
  '북구/사상': 'Buk-gu/Sasang',
  '동구/부산역': 'Dong-gu/Busan Station',
  '수영구/광안리': 'Suyeong-gu/Gwangalli',
  '강서구/명지': 'Gangseo-gu/Myeongji',
  '사하구/괴정/하단': 'Saha-gu/Goejeong/Hadan',
  '연산/동래/부산대': 'Yeonsan/Dongnae/Pusan National University',
  '금정구/연제구': 'Geumjeong-gu/Yeonje-gu',
  '해운대/센텀': 'Haeundae/Centum',
  '송정/기장': 'Songjeong/Gijang',

  // 인천 지역
  인천: 'Incheon',
  '남동구/구월/논현': 'Namdong-gu/Guwol/Nonhyeon',
  '동구/미추홀': 'Dong-gu/Michuhol',
  '계양/부평': 'Gyeyang/Bupyeong',
  '송도/연수': 'Songdo/Yeonsu',
  '서구/청라': 'Seo-gu/Cheongna',
  '중구/강화/옹진': 'Jung-gu/Ganghwa/Ongjin',

  // 대구 지역
  대구: 'Daegu',
  '중구/동성로/서문시장': 'Jung-gu/Dongseongno/Seomun Market',
  '북구/칠곡': 'Buk-gu/Chilgok',
  '동구/동대구역': 'Dong-gu/Dongdaegu Station',
  '수성구/범어': 'Suseong-gu/Beomeo',
  '달서구/죽전/계명대': 'Dalseo-gu/Jukjeon/Keimyung University',
  달성군: 'Dalseong County',

  // 대전 지역
  대전: 'Daejeon',
  '서구/둔산동': 'Seo-gu/Dunsan-dong',
  유성구: 'Yuseong-gu',
  대덕구: 'Daedeok-gu',

  // 광주 지역
  광주: 'Gwangju',
  '서구/상무지구': 'Seo-gu/Sangmu District',
  '북구/광주역': 'Buk-gu/Gwangju Station',
  '동구/남광주역/충장로': 'Dong-gu/Namgwangju Station/Chungjangno',
  '광산구/수완동': 'Gwangsan-gu/Suwan-dong',

  // 울산 지역
  울산: 'Ulsan',
  울주군: 'Ulju County',

  // 충북 지역
  충북: 'Chungbuk',
  '충북 기타': 'Chungbuk Others',
  청주: 'Cheongju',
  충주: 'Chungju',
  '제천/단양': 'Jecheon/Danyang',
  '증평/괴산': 'Jeungpyeong/Goesan',
  '진천/음성': 'Jincheon/Eumseong',

  // 충남 지역
  충남: 'Chungnam',
  '충남 기타': 'Chungnam Others',
  '천안/아산': 'Cheonan/Asan',
  공주: 'Gongju',
  '태안/안면도/서산': 'Taean/Anmyeondo/Seosan',
  '영동/옥천': 'Yeongdong/Okcheon',

  // 전북 지역
  전북: 'Jeonbuk',
  '전북 기타': 'Jeonbuk Others',
  '전주/완주': 'Jeonju/Wanju',
  '군산/익산': 'Gunsan/Iksan',
  '김제/부안': 'Gimje/Buan',
  '고창/정읍': 'Gochang/Jeongeup',
  '남원/임실/순창': 'Namwon/Imsil/Sunchang',
  무주: 'Muju',

  // 전남 지역
  전남: 'Jeonnam',
  '전남 기타': 'Jeonnam Others',
  '여수/순천/광양': 'Yeosu/Suncheon/Gwangyang',
  '목포/영암/무안': 'Mokpo/Yeongam/Muan',
  '나주/담양/함평': 'Naju/Damyang/Hampyeong',
  '해남/완도/진도': 'Haenam/Wando/Jindo',

  // 경북 지역
  경북: 'Gyeongbuk',
  '경북 기타': 'Gyeongbuk Others',
  포항: 'Pohang',
  '경주/구미': 'Gyeongju/Gumi',
  '안동/의성': 'Andong/Uiseong',
  '경산/영천/청도': 'Gyeongsan/Yeongcheon/Cheongdo',
  '김천/칠곡': 'Gimcheon/Chilgok',
  '문경/상주/영주/예천': 'Mungyeong/Sangju/Yeongju/Yecheon',
  '울진/영덕/청송': 'Uljin/Yeongdeok/Cheongsong',

  // 경남 지역
  경남: 'Gyeongnam',
  '경남 기타': 'Gyeongnam Others',
  '창원/마산/진해': 'Changwon/Masan/Jinhae',
  김해: 'Gimhae',
  '양산/밀양': 'Yangsan/Miryang',
  '거제/통영/고성': 'Geoje/Tongyeong/Goseong',
  '진주/사천': 'Jinju/Sacheon',
  '남해/하동': 'Namhae/Hadong',

  // 강원 지역
  강원: 'Gangwon',
  '강원 기타': 'Gangwon Others',
  '춘천/홍천/인제': 'Chuncheon/Hongcheon/Inje',
  '원주/횡성/평창': 'Wonju/Hoengseong/Pyeongchang',
  강릉: 'Gangneung',
  '속초/양양/고성': 'Sokcho/Yangyang/Goseong',
  '동해/삼척': 'Donghae/Samcheok',
  '동두천/포천/연천': 'Dongducheon/Pocheon/Yeoncheon',
  '화천/철원': 'Hwacheon/Cheorwon',

  // 제주 지역
  제주: 'Jeju',
  제주시: 'Jeju City',
  서귀포시: 'Seogwipo City',

  // 기타 지역
  기타: 'Others',
  세종: 'Sejong',
  중구: 'Jung-gu',
  '중구/남구/삼산': 'Jung-gu/Nam-gu/Samsan',
  남구: 'Nam-gu',
  동구: 'Dong-gu',
  '서구/평리': 'Seo-gu/Pyeongni',
  '동구/북구': 'Dong-gu/Buk-gu',
  '서구/영도': 'Seo-gu/Yeongdo',
};

async function main() {
  console.log('🌍 기존 District 데이터에 영어(en_US) 번역을 추가합니다...');

  try {
    // 모든 District 데이터 조회
    const districts = await prisma.district.findMany({
      where: {
        countryCode: 'KR',
      },
    });

    console.log(`📊 총 ${districts.length}개의 지역 데이터를 처리합니다.`);

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const district of districts) {
      // Type guard를 사용한 type-safe한 접근
      if (!isMultiLanguageName(district.name)) {
        console.log(`⚠️  잘못된 name 형식: ${district.id}`);
        continue;
      }

      const koName = district.name.ko_KR;

      // 이미 en_US가 있는 경우 건너뛰기
      if (district.name.en_US) {
        console.log(`✅ '${koName}' - 이미 영어 번역이 있습니다.`);
        continue;
      }

      // 영어 번역 찾기
      const englishName = KOREAN_TO_ENGLISH[koName];

      if (englishName) {
        // 영어 번역 추가
        const updatedName: MultiLanguageName = {
          ...district.name,
          en_US: englishName,
        };

        await prisma.district.update({
          where: { id: district.id },
          data: {
            name: updatedName,
          },
        });

        console.log(`🔄 '${koName}' → '${englishName}' 추가 완료`);
        updatedCount++;
      } else {
        console.log(`⚠️  영어 번역을 찾을 수 없습니다: '${koName}'`);
        notFoundCount++;
      }
    }

    // 결과 요약
    console.log('\n📊 작업 완료 요약:');
    console.log(`✅ 영어 번역 추가: ${updatedCount}개`);
    console.log(`⚠️  번역되지 않은 지역: ${notFoundCount}개`);

    // 업데이트된 데이터 확인
    if (updatedCount > 0) {
      console.log('\n🔍 업데이트된 데이터 샘플:');
      const sampleDistricts = await prisma.district.findMany({
        where: {
          countryCode: 'KR',
        },
        take: 5,
      });

      for (const district of sampleDistricts) {
        if (!isMultiLanguageName(district.name)) continue;
        console.log(`📍 ${district.name.ko_KR} (${district.name.en_US || 'No English'})`);
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
