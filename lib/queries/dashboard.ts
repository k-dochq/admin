import { prisma } from '@/lib/prisma';
import type {
  User,
  Hospital,
  Review,
  Doctor,
  ConsultationMessage,
  UserStatusType,
  HospitalApprovalStatusType,
  DoctorApprovalStatusType,
  MedicalSpecialtyType,
} from '@prisma/client';

// 대시보드 통계 타입 정의
export interface DashboardStats {
  totalUsers: number;
  totalHospitals: number;
  totalReviews: number;
  totalDoctors: number;
  totalConsultations: number;
  activeUsers: number;
  approvedHospitals: number;
  approvedDoctors: number;
  averageRating: number;
}

// 사용자 상태별 통계
export interface UserStatusStats {
  status: UserStatusType;
  count: number;
  percentage: number;
}

// 병원 승인 상태별 통계
export interface HospitalApprovalStats {
  status: HospitalApprovalStatusType;
  count: number;
  percentage: number;
}

// 의사 승인 상태별 통계
export interface DoctorApprovalStats {
  status: DoctorApprovalStatusType;
  count: number;
  percentage: number;
}

// 월별 가입자 통계
export interface MonthlyUserStats {
  month: string;
  count: number;
}

// 월별 리뷰 통계
export interface MonthlyReviewStats {
  month: string;
  count: number;
  averageRating: number;
}

// 의료 전문과별 리뷰 통계
export interface SpecialtyReviewStats {
  specialty: MedicalSpecialtyType;
  count: number;
  averageRating: number;
}

// 최근 활동 통계
export interface RecentActivity {
  id: string;
  type: 'user' | 'hospital' | 'review' | 'consultation';
  title: string;
  description: string;
  createdAt: Date;
}

// 대시보드 메인 통계 조회
export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    totalUsers,
    totalHospitals,
    totalReviews,
    totalDoctors,
    totalConsultations,
    activeUsers,
    approvedHospitals,
    approvedDoctors,
    averageRatingResult,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.hospital.count(),
    prisma.review.count(),
    prisma.doctor.count(),
    prisma.consultationMessage.count(),
    prisma.user.count({ where: { userStatusType: 'ACTIVE' } }),
    prisma.hospital.count({ where: { approvalStatusType: 'APPROVED' } }),
    prisma.doctor.count({ where: { approvalStatusType: 'APPROVED' } }),
    prisma.review.aggregate({
      _avg: { rating: true },
    }),
  ]);

  return {
    totalUsers,
    totalHospitals,
    totalReviews,
    totalDoctors,
    totalConsultations,
    activeUsers,
    approvedHospitals,
    approvedDoctors,
    averageRating: averageRatingResult._avg.rating || 0,
  };
}

// 사용자 상태별 통계 조회
export async function getUserStatusStats(): Promise<UserStatusStats[]> {
  const statusCounts = await prisma.user.groupBy({
    by: ['userStatusType'],
    _count: { userStatusType: true },
  });

  const totalUsers = statusCounts.reduce((sum, item) => sum + item._count.userStatusType, 0);

  return statusCounts.map((item) => ({
    status: item.userStatusType || 'ACTIVE',
    count: item._count.userStatusType,
    percentage: totalUsers > 0 ? (item._count.userStatusType / totalUsers) * 100 : 0,
  }));
}

// 병원 승인 상태별 통계 조회
export async function getHospitalApprovalStats(): Promise<HospitalApprovalStats[]> {
  const statusCounts = await prisma.hospital.groupBy({
    by: ['approvalStatusType'],
    _count: { approvalStatusType: true },
  });

  const totalHospitals = statusCounts.reduce(
    (sum, item) => sum + item._count.approvalStatusType,
    0,
  );

  return statusCounts.map((item) => ({
    status: item.approvalStatusType,
    count: item._count.approvalStatusType,
    percentage: totalHospitals > 0 ? (item._count.approvalStatusType / totalHospitals) * 100 : 0,
  }));
}

// 의사 승인 상태별 통계 조회
export async function getDoctorApprovalStats(): Promise<DoctorApprovalStats[]> {
  const statusCounts = await prisma.doctor.groupBy({
    by: ['approvalStatusType'],
    _count: { approvalStatusType: true },
  });

  const totalDoctors = statusCounts.reduce((sum, item) => sum + item._count.approvalStatusType, 0);

  return statusCounts.map((item) => ({
    status: item.approvalStatusType,
    count: item._count.approvalStatusType,
    percentage: totalDoctors > 0 ? (item._count.approvalStatusType / totalDoctors) * 100 : 0,
  }));
}

// 최근 6개월 월별 가입자 통계
export async function getMonthlyUserStats(): Promise<MonthlyUserStats[]> {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyData = await prisma.user.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: {
        gte: sixMonthsAgo,
      },
    },
    _count: { createdAt: true },
  });

  // 월별로 그룹화
  const monthlyStats: { [key: string]: number } = {};

  monthlyData.forEach((item) => {
    const month = item.createdAt.toISOString().substring(0, 7); // YYYY-MM 형식
    monthlyStats[month] = (monthlyStats[month] || 0) + item._count.createdAt;
  });

  return Object.entries(monthlyStats)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

// 최근 6개월 월별 리뷰 통계
export async function getMonthlyReviewStats(): Promise<MonthlyReviewStats[]> {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyData = await prisma.review.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: {
        gte: sixMonthsAgo,
      },
    },
    _count: { createdAt: true },
    _avg: { rating: true },
  });

  // 월별로 그룹화
  const monthlyStats: {
    [key: string]: { count: number; totalRating: number; reviewCount: number };
  } = {};

  monthlyData.forEach((item) => {
    const month = item.createdAt.toISOString().substring(0, 7);
    if (!monthlyStats[month]) {
      monthlyStats[month] = { count: 0, totalRating: 0, reviewCount: 0 };
    }
    monthlyStats[month].count += item._count.createdAt;
    monthlyStats[month].totalRating += (item._avg.rating || 0) * item._count.createdAt;
    monthlyStats[month].reviewCount += item._count.createdAt;
  });

  return Object.entries(monthlyStats)
    .map(([month, data]) => ({
      month,
      count: data.count,
      averageRating: data.reviewCount > 0 ? data.totalRating / data.reviewCount : 0,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

// 의료 전문과별 리뷰 통계
export async function getSpecialtyReviewStats(): Promise<SpecialtyReviewStats[]> {
  const specialtyData = await prisma.review.groupBy({
    by: ['medicalSpecialtyId'],
    _count: { medicalSpecialtyId: true },
    _avg: { rating: true },
  });

  // 의료 전문과 정보 조회
  const specialties = await prisma.medicalSpecialty.findMany({
    where: {
      id: { in: specialtyData.map((item) => item.medicalSpecialtyId) },
    },
  });

  const specialtyMap = new Map(specialties.map((s) => [s.id, s.specialtyType]));

  return specialtyData.map((item) => ({
    specialty: specialtyMap.get(item.medicalSpecialtyId) || 'EYES',
    count: item._count.medicalSpecialtyId,
    averageRating: item._avg.rating || 0,
  }));
}

// 최근 활동 조회
export async function getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
  const activities: RecentActivity[] = [];

  // 최근 가입한 사용자
  const recentUsers = await prisma.user.findMany({
    take: Math.ceil(limit / 4),
    orderBy: { createdAt: 'desc' },
    select: { id: true, displayName: true, createdAt: true },
  });

  activities.push(
    ...recentUsers.map((user) => ({
      id: user.id,
      type: 'user' as const,
      title: '새 사용자 가입',
      description: user.displayName || '익명 사용자',
      createdAt: user.createdAt,
    })),
  );

  // 최근 등록된 병원
  const recentHospitals = await prisma.hospital.findMany({
    take: Math.ceil(limit / 4),
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, createdAt: true },
  });

  activities.push(
    ...recentHospitals.map((hospital) => ({
      id: hospital.id,
      type: 'hospital' as const,
      title: '새 병원 등록',
      description:
        typeof hospital.name === 'string'
          ? hospital.name
          : hospital.name && typeof hospital.name === 'object' && 'ko' in hospital.name
            ? (hospital.name as any).ko
            : '병원',
      createdAt: hospital.createdAt,
    })),
  );

  // 최근 리뷰
  const recentReviews = await prisma.review.findMany({
    take: Math.ceil(limit / 4),
    orderBy: { createdAt: 'desc' },
    select: { id: true, rating: true, createdAt: true },
  });

  activities.push(
    ...recentReviews.map((review) => ({
      id: review.id,
      type: 'review' as const,
      title: '새 리뷰 작성',
      description: `${review.rating}점 리뷰`,
      createdAt: review.createdAt,
    })),
  );

  // 최근 상담 메시지
  const recentConsultations = await prisma.consultationMessage.findMany({
    take: Math.ceil(limit / 4),
    orderBy: { createdAt: 'desc' },
    select: { id: true, content: true, createdAt: true },
  });

  activities.push(
    ...recentConsultations.map((consultation) => ({
      id: consultation.id,
      type: 'consultation' as const,
      title: '새 상담 메시지',
      description:
        consultation.content.substring(0, 50) + (consultation.content.length > 50 ? '...' : ''),
      createdAt: consultation.createdAt,
    })),
  );

  return activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
}
