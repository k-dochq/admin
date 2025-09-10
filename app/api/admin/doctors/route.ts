import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  type GetDoctorsResponse,
  type CreateDoctorRequest,
  type CreateDoctorResponse,
  parseLocalizedText,
} from '@/features/doctor-management/api/entities/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || undefined;
    const hospitalId = searchParams.get('hospitalId') || undefined;
    const genderType = searchParams.get('genderType') as 'MALE' | 'FEMALE' | undefined;
    const approvalStatusType = searchParams.get('approvalStatusType') as
      | 'PENDING'
      | 'APPROVED'
      | 'REJECTED'
      | 'WAITING_APPROVAL'
      | undefined;
    const stop =
      searchParams.get('stop') === 'true'
        ? true
        : searchParams.get('stop') === 'false'
          ? false
          : undefined;

    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const where: Prisma.DoctorWhereInput = {};

    if (search) {
      where.OR = [
        {
          name: {
            path: ['ko_KR'],
            string_contains: search,
          },
        },
        {
          name: {
            path: ['en_US'],
            string_contains: search,
          },
        },
        {
          name: {
            path: ['th_TH'],
            string_contains: search,
          },
        },
        {
          licenseNumber: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (hospitalId) {
      where.hospitalId = hospitalId;
    }

    if (genderType) {
      where.genderType = genderType;
    }

    if (approvalStatusType) {
      where.approvalStatusType = approvalStatusType;
    }

    if (stop !== undefined) {
      where.stop = stop;
    }

    // 총 개수 조회
    const total = await prisma.doctor.count({ where });

    // 의사 목록 조회
    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
          },
        },
        doctorSpecialties: {
          select: {
            medicalSpecialtyId: true,
          },
        },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    const response: GetDoctorsResponse = {
      doctors: doctors.map((doctor) => ({
        id: doctor.id,
        name: parseLocalizedText(doctor.name),
        position: parseLocalizedText(doctor.position),
        licenseNumber: doctor.licenseNumber || undefined,
        licenseDate: doctor.licenseDate || undefined,
        description: doctor.description || undefined,
        genderType: doctor.genderType as 'MALE' | 'FEMALE',
        viewCount: doctor.viewCount,
        bookmarkCount: doctor.bookmarkCount,
        order: doctor.order || undefined,
        stop: doctor.stop,
        approvalStatusType: doctor.approvalStatusType as
          | 'PENDING'
          | 'APPROVED'
          | 'REJECTED'
          | 'WAITING_APPROVAL',
        hospitalId: doctor.hospitalId,
        hospital: {
          id: doctor.hospital.id,
          name: parseLocalizedText(doctor.hospital.name),
        },
        doctorSpecialties: doctor.doctorSpecialties,
        createdAt: doctor.createdAt,
        updatedAt: doctor.updatedAt,
      })),
      total,
      page,
      limit,
      totalPages,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('의사 목록 조회 실패:', error);
    return NextResponse.json(
      {
        success: false,
        error: '의사 목록을 불러오는 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateDoctorRequest;

    // 병원 존재 확인
    const hospital = await prisma.hospital.findUnique({
      where: { id: body.hospitalId },
      select: { id: true, name: true },
    });

    if (!hospital) {
      return NextResponse.json(
        {
          success: false,
          error: '존재하지 않는 병원입니다.',
        },
        { status: 400 },
      );
    }

    // 시술부위 존재 확인 (제공된 경우)
    if (body.medicalSpecialtyIds && body.medicalSpecialtyIds.length > 0) {
      const specialtyCount = await prisma.medicalSpecialty.count({
        where: {
          id: { in: body.medicalSpecialtyIds },
          isActive: true,
        },
      });

      if (specialtyCount !== body.medicalSpecialtyIds.length) {
        return NextResponse.json(
          {
            success: false,
            error: '존재하지 않거나 비활성화된 시술부위가 포함되어 있습니다.',
          },
          { status: 400 },
        );
      }
    }

    // 트랜잭션으로 의사 생성과 시술부위 관계 생성
    const result = await prisma.$transaction(async (tx) => {
      // 의사 생성
      const doctor = await tx.doctor.create({
        data: {
          name: body.name,
          position: body.position,
          licenseNumber: body.licenseNumber,
          licenseDate: body.licenseDate,
          description: body.description,
          genderType: body.genderType,
          hospitalId: body.hospitalId,
          order: body.order,
          // 기본값
          viewCount: 0,
          bookmarkCount: 0,
          stop: false,
          approvalStatusType: 'PENDING',
          hasClone: false,
        },
        include: {
          hospital: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // 시술부위 관계 생성 (제공된 경우)
      if (body.medicalSpecialtyIds && body.medicalSpecialtyIds.length > 0) {
        await tx.doctorMedicalSpecialty.createMany({
          data: body.medicalSpecialtyIds.map((specialtyId) => ({
            doctorId: doctor.id,
            medicalSpecialtyId: specialtyId,
          })),
        });
      }

      return doctor;
    });

    const doctor = result;

    const response: CreateDoctorResponse = {
      success: true,
      doctor: {
        id: doctor.id,
        name: parseLocalizedText(doctor.name),
        position: parseLocalizedText(doctor.position),
        licenseNumber: doctor.licenseNumber || undefined,
        licenseDate: doctor.licenseDate || undefined,
        description: doctor.description || undefined,
        genderType: doctor.genderType as 'MALE' | 'FEMALE',
        viewCount: doctor.viewCount,
        bookmarkCount: doctor.bookmarkCount,
        order: doctor.order || undefined,
        stop: doctor.stop,
        approvalStatusType: doctor.approvalStatusType as
          | 'PENDING'
          | 'APPROVED'
          | 'REJECTED'
          | 'WAITING_APPROVAL',
        hospitalId: doctor.hospitalId,
        hospital: {
          id: doctor.hospital.id,
          name: parseLocalizedText(doctor.hospital.name),
        },
        createdAt: doctor.createdAt,
        updatedAt: doctor.updatedAt,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('의사 생성 실패:', error);
    return NextResponse.json(
      {
        success: false,
        error: '의사 생성 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
