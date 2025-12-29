import { TaskRepository } from '../infrastructure/repositories/task-repository';
import type { CreateCategoryRequest, TaskCategory } from '../entities/types';

export async function createCategory(data: CreateCategoryRequest): Promise<TaskCategory> {
  const repository = new TaskRepository();
  const category = await repository.createCategory(data);
  return category;
}
