import { PrismaClient, MedicalSpecialtyType } from '@prisma/client';

type LocalizedText = {
  ko_KR?: string;
  en_US?: string;
  th_TH?: string;
};

const prisma = new PrismaClient();

async function main() {
  console.log('Starting medical specialties seeding...');

  try {
    // 기존 데이터 삭제 (재실행 시를 위해)
    await prisma.hospitalMedicalSpecialty.deleteMany({});
    await prisma.medicalSpecialty.deleteMany({});
    console.log('Cleared existing medical specialty data');

    // 진료부위 데이터 정의
    const medicalSpecialties = [
      {
        specialtyType: MedicalSpecialtyType.EYES,
        name: {
          ko_KR: '눈',
          en_US: 'Eyes',
          th_TH: 'ดวงตา',
        },
        description: {
          ko_KR: '눈 성형, 쌍꺼풀, 앞트임, 뒤트임 등 눈 관련 시술',
          en_US: 'Eye surgery, double eyelid, epicanthoplasty, lateral canthoplasty',
          th_TH: 'ศัลยกรรมตา หนังตาสองชั้น ผ่าตาย่าง',
        },
        order: 1,
      },
      {
        specialtyType: MedicalSpecialtyType.NOSE,
        name: {
          ko_KR: '코',
          en_US: 'Nose',
          th_TH: 'จมูก',
        },
        description: {
          ko_KR: '코 성형, 코끝 성형, 콧대 성형 등 코 관련 시술',
          en_US: 'Nose surgery, rhinoplasty, nose tip surgery',
          th_TH: 'ศัลยกรรมจมูก เสริมจมูก แก้ไขรูปจมูก',
        },
        order: 2,
      },
      {
        specialtyType: MedicalSpecialtyType.FACIAL_CONTOURING,
        name: {
          ko_KR: '안면윤곽',
          en_US: 'Facial Contouring',
          th_TH: 'แก้ไขโครงหน้า',
        },
        description: {
          ko_KR: '광대 축소, 사각턱 수술, 턱끝 성형 등 얼굴 윤곽 교정',
          en_US: 'Cheekbone reduction, jaw surgery, chin contouring',
          th_TH: 'ศัลยกรรมแก้ไขโครงหน้า ลดกรามใหญ่ แก้ไขกราม',
        },
        order: 3,
      },
      {
        specialtyType: MedicalSpecialtyType.BREAST,
        name: {
          ko_KR: '가슴',
          en_US: 'Breast',
          th_TH: 'หน้าอก',
        },
        description: {
          ko_KR: '가슴 성형, 가슴 확대, 가슴 축소 등 가슴 관련 시술',
          en_US: 'Breast augmentation, breast reduction, breast surgery',
          th_TH: 'ศัลยกรรมเสริมหน้าอก ขยายหน้าอก ลดหน้าอก',
        },
        order: 4,
      },
      {
        specialtyType: MedicalSpecialtyType.STEM_CELL,
        name: {
          ko_KR: '줄기세포',
          en_US: 'Stem Cell',
          th_TH: 'เซลล์ต้นกำเนิด',
        },
        description: {
          ko_KR: '줄기세포 치료, 재생 의학, 안티에이징',
          en_US: 'Stem cell therapy, regenerative medicine, anti-aging',
          th_TH: 'การรักษาด้วยเซลล์ต้นกำเนิด การแพทย์เชิงฟื้นฟู',
        },
        order: 5,
      },
      {
        specialtyType: MedicalSpecialtyType.LIPOSUCTION,
        name: {
          ko_KR: '지방성형',
          en_US: 'Liposuction',
          th_TH: 'ศัลยกรรมดูดไขมัน',
        },
        description: {
          ko_KR: '지방 흡입, 지방 이식, 체형 교정',
          en_US: 'Liposuction, fat transfer, body contouring',
          th_TH: 'ดูดไขมัน ฉีดไขมัน แก้ไขรูปร่าง',
        },
        order: 6,
      },
      {
        specialtyType: MedicalSpecialtyType.LIFTING,
        name: {
          ko_KR: '리프팅',
          en_US: 'Lifting',
          th_TH: 'ยกกระชับ',
        },
        description: {
          ko_KR: '페이스 리프팅, 실 리프팅, 레이저 리프팅',
          en_US: 'Face lifting, thread lifting, laser lifting',
          th_TH: 'ยกกระชับใบหน้า เทรดลิฟต์ เลเซอร์ลิฟต์',
        },
        order: 7,
      },
      {
        specialtyType: MedicalSpecialtyType.HAIR_TRANSPLANT,
        name: {
          ko_KR: '모발이식',
          en_US: 'Hair Transplant',
          th_TH: 'ปลูกผม',
        },
        description: {
          ko_KR: '모발 이식, 탈모 치료, 헤어라인 교정',
          en_US: 'Hair transplantation, hair loss treatment, hairline correction',
          th_TH: 'ปลูกผม รักษาผมร่วง แก้ไขเส้นผม',
        },
        order: 8,
      },
    ];

    // MedicalSpecialty 데이터 생성
    const createdSpecialties = [];
    for (const specialty of medicalSpecialties) {
      const created = await prisma.medicalSpecialty.create({
        data: specialty,
      });
      createdSpecialties.push(created);
      console.log(`✅ Created specialty: ${(specialty.name as LocalizedText).ko_KR}`);
    }

    console.log(`🎉 Successfully created ${createdSpecialties.length} medical specialties`);

    // 확인용 데이터 출력
    console.log('\n📋 Created specialties:');
    createdSpecialties.forEach((specialty) => {
      const name = (specialty.name as LocalizedText).ko_KR;
      console.log(`- ${name} (${specialty.specialtyType})`);
    });
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
