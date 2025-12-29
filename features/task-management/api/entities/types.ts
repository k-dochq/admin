export interface Task {
  id: string;
  title: string;
  description: string | null;
  assignee: string;
  status: TaskStatus;
  priority: TaskPriority;
  categoryId: string | null;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  category?: TaskCategory | null;
}

export interface TaskCategory {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  order: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface GetTasksRequest {
  assignee?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  categoryId?: string;
  startDate?: string; // ISO string
  endDate?: string; // ISO string
}

export interface GetTasksResponse {
  tasks: Task[];
  total: number;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  assignee: string;
  status: TaskStatus;
  priority: TaskPriority;
  categoryId?: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
}

export interface UpdateTaskRequest {
  id: string;
  title?: string;
  description?: string;
  assignee?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  categoryId?: string;
  startDate?: string; // ISO string
  endDate?: string; // ISO string
}

export interface DeleteTaskRequest {
  id: string;
}

export interface GetCategoriesResponse {
  categories: TaskCategory[];
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  color?: string;
  order?: number;
}

export interface UpdateCategoryRequest {
  id: string;
  name?: string;
  description?: string;
  color?: string;
  order?: number;
  isActive?: boolean;
}

export interface DeleteCategoryRequest {
  id: string;
}

// 한글 라벨
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: '대기중',
  [TaskStatus.IN_PROGRESS]: '진행중',
  [TaskStatus.COMPLETED]: '완료',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: '낮음',
  [TaskPriority.MEDIUM]: '보통',
  [TaskPriority.HIGH]: '높음',
  [TaskPriority.URGENT]: '긴급',
};

// 우선순위별 색상
export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: '#10b981', // green
  [TaskPriority.MEDIUM]: '#3b82f6', // blue
  [TaskPriority.HIGH]: '#f59e0b', // amber
  [TaskPriority.URGENT]: '#ef4444', // red
};

// 상태별 색상
export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: '#9ca3af', // gray
  [TaskStatus.IN_PROGRESS]: '#3b82f6', // blue
  [TaskStatus.COMPLETED]: '#10b981', // green
};
