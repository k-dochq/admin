import { useQuery } from '@tanstack/react-query';
import type {
  GetTasksRequest,
  GetTasksResponse,
  GetCategoriesResponse,
} from '@/features/task-management/api/entities/types';

export function useTasks(filters: GetTasksRequest = {}) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.assignee) params.append('assignee', filters.assignee);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/tasks?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json() as Promise<GetTasksResponse>;
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['task-categories'],
    queryFn: async () => {
      const response = await fetch('/api/tasks/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json() as Promise<GetCategoriesResponse>;
    },
  });
}
