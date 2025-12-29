import { TaskRepository } from '../infrastructure/repositories/task-repository';
import type { DeleteTaskRequest } from '../entities/types';

export async function deleteTask(data: DeleteTaskRequest): Promise<{ success: boolean }> {
  const repository = new TaskRepository();
  await repository.deleteTask(data.id);
  return { success: true };
}
