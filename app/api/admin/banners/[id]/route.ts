import { NextRequest, NextResponse } from 'next/server';
import {
  BannerRepository,
  BannerImageRepository,
  GetBannerByIdUseCase,
  UpdateBannerUseCase,
  DeleteBannerUseCase,
  type UpdateBannerRequest,
} from '@/features/banner-management/api';

const bannerRepository = new BannerRepository();
const bannerImageRepository = new BannerImageRepository();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const getBannerByIdUseCase = new GetBannerByIdUseCase(bannerRepository);
    const result = await getBannerByIdUseCase.execute(id);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching banner:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch banner' },
      { status: 404 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body: Omit<UpdateBannerRequest, 'id'> = await request.json();

    const updateBannerUseCase = new UpdateBannerUseCase(bannerRepository);
    const result = await updateBannerUseCase.execute({ id, ...body });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update banner' },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const deleteBannerUseCase = new DeleteBannerUseCase(bannerRepository, bannerImageRepository);
    await deleteBannerUseCase.execute(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete banner' },
      { status: 400 },
    );
  }
}
