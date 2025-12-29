import { TaskRepository } from '../infrastructure/repositories/task-repository';
import type { GetTasksRequest, GetTasksResponse } from '../entities/types';

export async function getTasks(filters: GetTasksRequest): Promise<GetTasksResponse> {
  const repository = new TaskRepository();
  const tasks = await repository.getTasks(filters);

  return {
    tasks,
    total: tasks.length,
  };
}
