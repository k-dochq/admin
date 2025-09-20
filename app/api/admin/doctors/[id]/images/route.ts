import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DoctorImageType } from '@/lib/types/doctor';

// 의사 이미지 목록 조회
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: doctorId } = await params;

    if (!doctorId) {
      return NextResponse.json({ success: false, error: '의사 ID가 필요합니다.' }, { status: 400 });
    }

    // 의사 존재 확인
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: '의사를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    // 의사 이미지 목록 조회
    const images = await prisma.doctorImage.findMany({
      where: { doctorId },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('의사 이미지 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '의사 이미지를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

// 의사 이미지 생성
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: doctorId } = await params;
    const body = await request.json();
    const { imageType, imageUrl, path, alt, order } = body;

    if (!doctorId) {
      return NextResponse.json({ success: false, error: '의사 ID가 필요합니다.' }, { status: 400 });
    }

    if (!imageType || !imageUrl || !path) {
      return NextResponse.json(
        { success: false, error: '필수 필드가 누락되었습니다.' },
        { status: 400 },
      );
    }

    // 유효한 이미지 타입인지 확인
    if (!Object.values(DoctorImageType).includes(imageType)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 이미지 타입입니다.' },
        { status: 400 },
      );
    }

    // 의사 존재 확인
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: '의사를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    // 이미지 생성
    const image = await prisma.doctorImage.create({
      data: {
        doctorId,
        imageType,
        imageUrl,
        alt: alt || null,
        order: order || null,
        isActive: true,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error('의사 이미지 생성 오류:', error);
    return NextResponse.json(
      { success: false, error: '의사 이미지를 생성하는 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
