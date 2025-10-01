import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserStats } from '@/lib/types/user';

// 사용자 통계 조회
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    // example.com과 dummy.com으로 끝나는 이메일을 가진 사용자 제외하는 기본 조건
    const excludeExampleEmails = {
      AND: [
        {
          email: {
            not: {
              endsWith: '@example.com',
            },
          },
        },
        {
          email: {
            not: {
              endsWith: '@dummy.com',
            },
          },
        },
      ],
    };

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      deletedUsers,
      newUsersThisMonth,
      newUsersThisWeek,
    ] = await Promise.all([
      prisma.user.count({
        where: excludeExampleEmails,
      }),
      prisma.user.count({
        where: {
          ...excludeExampleEmails,
          userStatusType: 'ACTIVE',
        },
      }),
      prisma.user.count({
        where: {
          ...excludeExampleEmails,
          userStatusType: 'INACTIVE',
        },
      }),
      prisma.user.count({
        where: {
          ...excludeExampleEmails,
          userStatusType: 'SUSPENDED',
        },
      }),
      prisma.user.count({
        where: {
          ...excludeExampleEmails,
          userStatusType: 'DELETED',
        },
      }),
      prisma.user.count({
        where: {
          ...excludeExampleEmails,
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),
      prisma.user.count({
        where: {
          ...excludeExampleEmails,
          createdAt: {
            gte: startOfWeek,
          },
        },
      }),
    ]);

    const stats: UserStats = {
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      deletedUsers,
      newUsersThisMonth,
      newUsersThisWeek,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: '사용자 통계를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
