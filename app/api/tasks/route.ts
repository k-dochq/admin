import { NextRequest, NextResponse } from 'next/server';
import { getTasks } from '@/features/task-management/api/use-cases/get-tasks';
import { createTask } from '@/features/task-management/api/use-cases/create-task';
import type {
  GetTasksRequest,
  CreateTaskRequest,
} from '@/features/task-management/api/entities/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters: GetTasksRequest = {
      assignee: searchParams.get('assignee') || undefined,
      status: (searchParams.get('status') as any) || undefined,
      priority: (searchParams.get('priority') as any) || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    };

    const response = await getTasks(filters);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateTaskRequest = await request.json();
    const task = await createTask(body);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
