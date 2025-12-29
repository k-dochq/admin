import { TaskRepository } from '../infrastructure/repositories/task-repository';
import type { GetCategoriesResponse } from '../entities/types';

export async function getCategories(): Promise<GetCategoriesResponse> {
  const repository = new TaskRepository();
  const categories = await repository.getCategories();

  return {
    categories,
  };
}
