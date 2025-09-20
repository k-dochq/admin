import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  GetUsersRequest,
  GetUsersResponse,
  CreateUserRequest,
  UserStatusType,
  UserRoleType,
  UserGenderType,
  UserLocale,
} from '@/lib/types/user';

// 사용자 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || undefined;
    const userStatusType = (searchParams.get('userStatusType') as UserStatusType) || undefined;
    const drRoleType = (searchParams.get('drRoleType') as UserRoleType) || undefined;
    const genderType = (searchParams.get('genderType') as UserGenderType) || undefined;
    const locale = (searchParams.get('locale') as UserLocale) || undefined;
    const sortBy =
      (searchParams.get('sortBy') as
        | 'createdAt'
        | 'updatedAt'
        | 'last_sign_in_at'
        | 'name'
        | 'email') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { nickName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (userStatusType) {
      where.userStatusType = userStatusType;
    }

    if (drRoleType) {
      where.drRoleType = drRoleType;
    }

    if (genderType) {
      where.genderType = genderType;
    }

    if (locale) {
      where.locale = locale;
    }

    // 정렬 조건 구성
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // 사용자 목록 조회
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          UserRole: {
            include: {
              AdminRole: true,
            },
          },
          invitationCode: true,
          _count: {
            select: {
              reviews: true,
              comments: true,
              HospitalLike: true,
              ReviewLike: true,
              consultationMessages: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const response: GetUsersResponse = {
      users,
      total,
      page,
      limit,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: '사용자 목록을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

// 사용자 생성
export async function POST(request: NextRequest) {
  try {
    const data: CreateUserRequest = await request.json();

    // 이메일 중복 확인
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: { email: data.email },
      });

      if (existingUser) {
        return NextResponse.json({ error: '이미 사용 중인 이메일입니다.' }, { status: 400 });
      }
    }

    // 전화번호 중복 확인
    if (data.phoneNumber) {
      const existingUser = await prisma.user.findFirst({
        where: { phoneNumber: data.phoneNumber },
      });

      if (existingUser) {
        return NextResponse.json({ error: '이미 사용 중인 전화번호입니다.' }, { status: 400 });
      }
    }

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        displayName: data.displayName,
        name: data.name,
        nickName: data.nickName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        drRoleType: data.drRoleType,
        genderType: data.genderType,
        locale: data.locale || 'ko_KR',
        age: data.age,
        userStatusType: data.userStatusType || 'ACTIVE',
        advertPush: data.advertPush || false,
        communityAlarm: data.communityAlarm || false,
        postAlarm: data.postAlarm || false,
        collectPersonalInfo: data.collectPersonalInfo || false,
        profileImgUrl: data.profileImgUrl,
        invitationCodeId: data.invitationCodeId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        UserRole: {
          include: {
            AdminRole: true,
          },
        },
        invitationCode: true,
        _count: {
          select: {
            reviews: true,
            comments: true,
            HospitalLike: true,
            ReviewLike: true,
            consultationMessages: true,
          },
        },
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: '사용자 생성에 실패했습니다.' }, { status: 500 });
  }
}
