import { TaskRepository } from '../infrastructure/repositories/task-repository';
import type { CreateTaskRequest, Task } from '../entities/types';

export async function createTask(data: CreateTaskRequest): Promise<Task> {
  const repository = new TaskRepository();
  const task = await repository.createTask(data);
  return task;
}
