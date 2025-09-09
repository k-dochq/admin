import { PrismaClient, MedicalSpecialtyType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting hospital medical specialties seeding...');

  try {
    // 모든 병원 조회
    const hospitals = await prisma.hospital.findMany({
      select: { id: true, name: true },
    });

    // 모든 진료부위 조회
    const medicalSpecialties = await prisma.medicalSpecialty.findMany({
      select: { id: true, specialtyType: true, name: true },
      orderBy: { order: 'asc' },
    });

    console.log(
      `Found ${hospitals.length} hospitals and ${medicalSpecialties.length} medical specialties`,
    );

    // 기존 HospitalMedicalSpecialty 데이터 삭제 (재실행 시를 위해)
    await prisma.hospitalMedicalSpecialty.deleteMany({});
    console.log('Cleared existing hospital medical specialty relationships');

    // 병원별 전문 분야 할당 규칙 (병원 이름 기반)
    const specialtyRules = [
      {
        // 성형외과는 눈, 코, 안면윤곽, 가슴에 집중
        keywords: ['성형외과', '뷰티', '미라클', '성형'],
        preferredSpecialties: [
          MedicalSpecialtyType.EYES,
          MedicalSpecialtyType.NOSE,
          MedicalSpecialtyType.FACIAL_CONTOURING,
          MedicalSpecialtyType.BREAST,
        ],
      },
      {
        // 피부과/미용은 리프팅, 줄기세포에 집중
        keywords: ['피부', '미용', '스킨', '더마'],
        preferredSpecialties: [
          MedicalSpecialtyType.LIFTING,
          MedicalSpecialtyType.STEM_CELL,
          MedicalSpecialtyType.LIPOSUCTION,
        ],
      },
      {
        // 모발/헤어 클리닉
        keywords: ['모발', '헤어', '탈모'],
        preferredSpecialties: [MedicalSpecialtyType.HAIR_TRANSPLANT],
      },
      {
        // 성형외과 중에서도 특정 부위에 특화된 곳들
        keywords: ['눈', '아이'],
        preferredSpecialties: [MedicalSpecialtyType.EYES],
      },
      {
        keywords: ['코'],
        preferredSpecialties: [MedicalSpecialtyType.NOSE],
      },
      {
        keywords: ['가슴', '브레스트'],
        preferredSpecialties: [MedicalSpecialtyType.BREAST],
      },
    ];

    const hospitalSpecialties = [];

    for (const hospital of hospitals) {
      const hospitalName = (hospital.name as any)?.ko_KR || '';
      const assignedSpecialtyTypes = new Set<MedicalSpecialtyType>();

      // 병원 이름에 따른 전문 분야 할당
      for (const rule of specialtyRules) {
        const matchesKeyword = rule.keywords.some((keyword) =>
          hospitalName.toLowerCase().includes(keyword.toLowerCase()),
        );

        if (matchesKeyword) {
          // 해당 분야의 진료부위들을 우선 할당
          const numToSelect = Math.min(
            rule.preferredSpecialties.length,
            Math.floor(Math.random() * 2) + 2, // 2-3개
          );

          const shuffled = [...rule.preferredSpecialties].sort(() => 0.5 - Math.random());
          shuffled
            .slice(0, numToSelect)
            .forEach((specialtyType) => assignedSpecialtyTypes.add(specialtyType));
          break;
        }
      }

      // 전문 분야가 없거나 진료부위가 부족한 경우 랜덤 추가
      if (assignedSpecialtyTypes.size === 0) {
        const numToSelect = Math.floor(Math.random() * 3) + 2; // 2-4개
        const allSpecialtyTypes = medicalSpecialties.map((s) => s.specialtyType);
        const shuffled = [...allSpecialtyTypes].sort(() => 0.5 - Math.random());
        shuffled
          .slice(0, numToSelect)
          .forEach((specialtyType) => assignedSpecialtyTypes.add(specialtyType));
      } else if (assignedSpecialtyTypes.size < 2) {
        // 최소 2개는 되도록
        const allSpecialtyTypes = medicalSpecialties.map((s) => s.specialtyType);
        const remaining = allSpecialtyTypes.filter((type) => !assignedSpecialtyTypes.has(type));
        const additional = remaining
          .sort(() => 0.5 - Math.random())
          .slice(0, 2 - assignedSpecialtyTypes.size);
        additional.forEach((specialtyType) => assignedSpecialtyTypes.add(specialtyType));
      }

      // HospitalMedicalSpecialty 레코드 생성
      for (const specialtyType of assignedSpecialtyTypes) {
        const medicalSpecialty = medicalSpecialties.find((s) => s.specialtyType === specialtyType);
        if (medicalSpecialty) {
          hospitalSpecialties.push({
            hospitalId: hospital.id,
            medicalSpecialtyId: medicalSpecialty.id,
          });
        }
      }
    }

    // 대량 삽입
    const result = await prisma.hospitalMedicalSpecialty.createMany({
      data: hospitalSpecialties,
      skipDuplicates: true,
    });

    console.log(`✅ Created ${result.count} hospital-medical specialty relationships`);

    // 결과 확인
    const summary = await prisma.hospitalMedicalSpecialty.groupBy({
      by: ['hospitalId'],
      _count: {
        medicalSpecialtyId: true,
      },
    });

    console.log(`📊 Summary:`);
    console.log(`- Total hospitals with specialties: ${summary.length}`);
    console.log(
      `- Average specialties per hospital: ${(result.count / summary.length).toFixed(1)}`,
    );

    // 각 진료부위별 병원 수 확인
    const specialtyStats = await prisma.hospitalMedicalSpecialty.groupBy({
      by: ['medicalSpecialtyId'],
      _count: {
        hospitalId: true,
      },
    });

    console.log(`📈 Specialty distribution:`);
    for (const stat of specialtyStats) {
      const specialty = medicalSpecialties.find((s) => s.id === stat.medicalSpecialtyId);
      const specialtyName = (specialty?.name as any)?.ko_KR || 'Unknown';
      console.log(`- ${specialtyName}: ${stat._count.hospitalId} hospitals`);
    }

    // 랜덤 병원 몇 개의 진료부위 확인
    console.log(`\n🏥 Sample hospital specialties:`);
    const sampleHospitals = hospitals.slice(0, 5);
    for (const hospital of sampleHospitals) {
      const hospitalSpecialtyData = await prisma.hospitalMedicalSpecialty.findMany({
        where: { hospitalId: hospital.id },
        include: {
          medicalSpecialty: {
            select: { name: true, specialtyType: true },
          },
        },
      });

      const hospitalName = (hospital.name as any)?.ko_KR || 'Unknown';
      const specialtyNames = hospitalSpecialtyData
        .map((hs) => (hs.medicalSpecialty.name as any)?.ko_KR)
        .join(', ');

      console.log(`- ${hospitalName}: ${specialtyNames}`);
    }
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
