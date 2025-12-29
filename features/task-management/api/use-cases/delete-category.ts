import { TaskRepository } from '../infrastructure/repositories/task-repository';
import type { DeleteCategoryRequest } from '../entities/types';

export async function deleteCategory(data: DeleteCategoryRequest): Promise<{ success: boolean }> {
  const repository = new TaskRepository();
  await repository.deleteCategory(data.id);
  return { success: true };
}
