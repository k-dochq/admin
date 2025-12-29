import { NextRequest, NextResponse } from 'next/server';
import { updateTask } from '@/features/task-management/api/use-cases/update-task';
import { deleteTask } from '@/features/task-management/api/use-cases/delete-task';
import type { UpdateTaskRequest } from '@/features/task-management/api/entities/types';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: UpdateTaskRequest = {
      id,
      ...body,
    };

    const task = await updateTask(updateData);
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await deleteTask({ id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
