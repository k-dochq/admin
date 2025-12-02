import { NextRequest, NextResponse } from 'next/server';
import {
  BannerRepository,
  BannerImageRepository,
  GetBannersUseCase,
  CreateBannerUseCase,
  type GetBannersRequest,
  type CreateBannerRequest,
} from '@/features/banner-management/api';

const bannerRepository = new BannerRepository();
const bannerImageRepository = new BannerImageRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const typeParam = searchParams.get('type');
    const params: GetBannersRequest = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      type: typeParam === 'MAIN' || typeParam === 'RIBBON' ? typeParam : undefined,
      orderBy: (searchParams.get('orderBy') as 'createdAt' | 'order' | 'startDate') || 'order',
      orderDirection: (searchParams.get('orderDirection') as 'asc' | 'desc') || 'asc',
    };

    const getBannersUseCase = new GetBannersUseCase(bannerRepository);
    const result = await getBannersUseCase.execute(params);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateBannerRequest = await request.json();

    const createBannerUseCase = new CreateBannerUseCase(bannerRepository);
    const result = await createBannerUseCase.execute(body);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create banner' },
      { status: 400 },
    );
  }
}
