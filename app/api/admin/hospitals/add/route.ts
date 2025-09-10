import { NextRequest, NextResponse } from 'next/server';
import { createHospital } from '@/features/hospital-edit/api/use-cases/create-hospital';
import { type CreateHospitalRequest } from '@/features/hospital-edit/api';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateHospitalRequest;

    const result = await createHospital(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('병원 생성 실패:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '병원 생성에 실패했습니다.',
      },
      { status: 500 },
    );
  }
}
