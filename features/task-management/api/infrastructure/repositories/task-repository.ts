import { Prisma } from '@prisma/client';
import type {
  TaskStatus as PrismaTaskStatus,
  TaskPriority as PrismaTaskPriority,
} from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type {
  Task,
  TaskCategory,
  TaskStatus,
  TaskPriority,
  GetTasksRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../../entities/types';

// Prisma 타입을 애플리케이션 타입으로 변환하는 헬퍼 함수
type PrismaTaskWithCategory = Prisma.TaskGetPayload<{
  include: { category: true };
}>;

function mapPrismaTaskToTask(prismaTask: PrismaTaskWithCategory): Task {
  return {
    id: prismaTask.id,
    title: prismaTask.title,
    description: prismaTask.description,
    assignee: prismaTask.assignee,
    status: prismaTask.status as TaskStatus,
    priority: prismaTask.priority as TaskPriority,
    categoryId: prismaTask.categoryId,
    startDate: prismaTask.startDate,
    endDate: prismaTask.endDate,
    createdAt: prismaTask.createdAt,
    updatedAt: prismaTask.updatedAt,
    createdBy: prismaTask.createdBy,
    updatedBy: prismaTask.updatedBy,
    category: prismaTask.category
      ? {
          id: prismaTask.category.id,
          name: prismaTask.category.name,
          description: prismaTask.category.description,
          color: prismaTask.category.color,
          order: prismaTask.category.order,
          isActive: prismaTask.category.isActive,
          createdAt: prismaTask.category.createdAt,
          updatedAt: prismaTask.category.updatedAt,
        }
      : null,
  };
}

type PrismaTaskCategory = Prisma.TaskCategoryGetPayload<Prisma.TaskCategoryDefaultArgs>;

function mapPrismaCategoryToCategory(prismaCategory: PrismaTaskCategory): TaskCategory {
  return {
    id: prismaCategory.id,
    name: prismaCategory.name,
    description: prismaCategory.description,
    color: prismaCategory.color,
    order: prismaCategory.order,
    isActive: prismaCategory.isActive,
    createdAt: prismaCategory.createdAt,
    updatedAt: prismaCategory.updatedAt,
  };
}

export interface ITaskRepository {
  getTasks(filters: GetTasksRequest): Promise<Task[]>;
  getTaskById(id: string): Promise<Task | null>;
  createTask(data: CreateTaskRequest): Promise<Task>;
  updateTask(data: UpdateTaskRequest): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  getCategories(): Promise<TaskCategory[]>;
  getCategoryById(id: string): Promise<TaskCategory | null>;
  createCategory(data: CreateCategoryRequest): Promise<TaskCategory>;
  updateCategory(data: UpdateCategoryRequest): Promise<TaskCategory>;
  deleteCategory(id: string): Promise<void>;
}

export class TaskRepository implements ITaskRepository {
  async getTasks(filters: GetTasksRequest): Promise<Task[]> {
    const where: Prisma.TaskWhereInput = {};

    if (filters.assignee) {
      where.assignee = {
        contains: filters.assignee,
        mode: 'insensitive',
      };
    }

    if (filters.status) {
      where.status = filters.status as PrismaTaskStatus;
    }

    if (filters.priority) {
      where.priority = filters.priority as PrismaTaskPriority;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.startDate || filters.endDate) {
      const dateConditions: Prisma.TaskWhereInput[] = [];

      if (filters.startDate && filters.endDate) {
        dateConditions.push({
          startDate: { gte: new Date(filters.startDate), lte: new Date(filters.endDate) },
        });
        dateConditions.push({
          endDate: { gte: new Date(filters.startDate), lte: new Date(filters.endDate) },
        });
        dateConditions.push({
          AND: [
            { startDate: { lte: new Date(filters.startDate) } },
            { endDate: { gte: new Date(filters.endDate) } },
          ],
        });
      } else if (filters.startDate) {
        dateConditions.push({ startDate: { gte: new Date(filters.startDate) } });
        dateConditions.push({ endDate: { gte: new Date(filters.startDate) } });
      } else if (filters.endDate) {
        dateConditions.push({ startDate: { lte: new Date(filters.endDate) } });
        dateConditions.push({ endDate: { lte: new Date(filters.endDate) } });
      }

      if (dateConditions.length > 0) {
        where.OR = dateConditions;
      }
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: [{ startDate: 'asc' }, { createdAt: 'desc' }],
    });

    return tasks.map(mapPrismaTaskToTask);
  }

  async getTaskById(id: string): Promise<Task | null> {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    return task ? mapPrismaTaskToTask(task) : null;
  }

  async createTask(data: CreateTaskRequest): Promise<Task> {
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description || null,
        assignee: data.assignee,
        status: data.status as PrismaTaskStatus,
        priority: data.priority as PrismaTaskPriority,
        categoryId: data.categoryId || null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
      include: {
        category: true,
      },
    });

    return mapPrismaTaskToTask(task);
  }

  async updateTask(data: UpdateTaskRequest): Promise<Task> {
    const updateData: Prisma.TaskUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.assignee !== undefined) updateData.assignee = data.assignee;
    if (data.status !== undefined) updateData.status = data.status as PrismaTaskStatus;
    if (data.priority !== undefined) updateData.priority = data.priority as PrismaTaskPriority;
    if (data.categoryId !== undefined) {
      updateData.category = data.categoryId
        ? { connect: { id: data.categoryId } }
        : { disconnect: true };
    }
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);

    const task = await prisma.task.update({
      where: { id: data.id },
      data: updateData,
      include: {
        category: true,
      },
    });

    return mapPrismaTaskToTask(task);
  }

  async deleteTask(id: string): Promise<void> {
    await prisma.task.delete({
      where: { id },
    });
  }

  async getCategories(): Promise<TaskCategory[]> {
    const categories = await prisma.taskCategory.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });

    return categories.map(mapPrismaCategoryToCategory);
  }

  async getCategoryById(id: string): Promise<TaskCategory | null> {
    const category = await prisma.taskCategory.findUnique({
      where: { id },
    });

    return category ? mapPrismaCategoryToCategory(category) : null;
  }

  async createCategory(data: CreateCategoryRequest): Promise<TaskCategory> {
    const category = await prisma.taskCategory.create({
      data: {
        name: data.name,
        description: data.description || null,
        color: data.color || null,
        order: data.order || null,
      },
    });

    return mapPrismaCategoryToCategory(category);
  }

  async updateCategory(data: UpdateCategoryRequest): Promise<TaskCategory> {
    const updateData: Prisma.TaskCategoryUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.color !== undefined) updateData.color = data.color || null;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const category = await prisma.taskCategory.update({
      where: { id: data.id },
      data: updateData,
    });

    return mapPrismaCategoryToCategory(category);
  }

  async deleteCategory(id: string): Promise<void> {
    await prisma.taskCategory.delete({
      where: { id },
    });
  }
}
