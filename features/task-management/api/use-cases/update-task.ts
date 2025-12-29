import { TaskRepository } from '../infrastructure/repositories/task-repository';
import type { UpdateTaskRequest, Task } from '../entities/types';

export async function updateTask(data: UpdateTaskRequest): Promise<Task> {
  const repository = new TaskRepository();
  const task = await repository.updateTask(data);
  return task;
}
