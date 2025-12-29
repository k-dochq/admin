import { TaskRepository } from '../infrastructure/repositories/task-repository';
import type { UpdateCategoryRequest, TaskCategory } from '../entities/types';

export async function updateCategory(data: UpdateCategoryRequest): Promise<TaskCategory> {
  const repository = new TaskRepository();
  const category = await repository.updateCategory(data);
  return category;
}
