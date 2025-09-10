import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  type UpdateDoctorRequest,
  type UpdateDoctorResponse,
  type DeleteDoctorResponse,
  parseLocalizedText,
} from '@/features/doctor-management/api/entities/types';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          error: '의사를 찾을 수 없습니다.',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
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
      },
    });
  } catch (error) {
    console.error('의사 조회 실패:', error);
    return NextResponse.json(
      {
        success: false,
        error: '의사 정보를 불러오는 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as UpdateDoctorRequest;

    // 의사 존재 확인
    const existingDoctor = await prisma.doctor.findUnique({
      where: { id },
    });

    if (!existingDoctor) {
      return NextResponse.json(
        {
          success: false,
          error: '의사를 찾을 수 없습니다.',
        },
        { status: 404 },
      );
    }

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

    // 의사 정보 업데이트
    const doctor = await prisma.doctor.update({
      where: { id },
      data: {
        name: body.name,
        position: body.position,
        licenseNumber: body.licenseNumber,
        licenseDate: body.licenseDate,
        description: body.description,
        genderType: body.genderType,
        hospitalId: body.hospitalId,
        order: body.order,
        stop: body.stop,
        approvalStatusType: body.approvalStatusType,
        updatedAt: new Date(),
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

    const response: UpdateDoctorResponse = {
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
    console.error('의사 수정 실패:', error);
    return NextResponse.json(
      {
        success: false,
        error: '의사 정보 수정 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // 의사 존재 확인
    const existingDoctor = await prisma.doctor.findUnique({
      where: { id },
    });

    if (!existingDoctor) {
      return NextResponse.json(
        {
          success: false,
          error: '의사를 찾을 수 없습니다.',
        },
        { status: 404 },
      );
    }

    // 의사 삭제
    await prisma.doctor.delete({
      where: { id },
    });

    const response: DeleteDoctorResponse = {
      success: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('의사 삭제 실패:', error);
    return NextResponse.json(
      {
        success: false,
        error: '의사 삭제 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
