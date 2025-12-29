import { NextRequest, NextResponse } from 'next/server';
import { getCategories } from '@/features/task-management/api/use-cases/get-categories';
import { createCategory } from '@/features/task-management/api/use-cases/create-category';
import type { CreateCategoryRequest } from '@/features/task-management/api/entities/types';

export async function GET() {
  try {
    const response = await getCategories();
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCategoryRequest = await request.json();
    const category = await createCategory(body);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
