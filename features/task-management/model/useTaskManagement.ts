'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { subDays, addDays } from 'date-fns';
import { useTasks, useCategories } from '@/lib/queries/tasks';
import {
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/lib/mutations/tasks';
import type {
  GetTasksRequest,
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
} from '../api/entities/types';
import { TaskStatus } from '../api/entities/types';
import { toast } from 'sonner';

export function useTaskManagement() {
  const [filters, setFilters] = useState<GetTasksRequest>({});
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isListPanelOpen, setIsListPanelOpen] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState<Set<string>>(new Set());
  const [showInProgressOnly, setShowInProgressOnly] = useState(false);

  // Queries
  const { data: tasksData, isLoading: isLoadingTasks } = useTasks(filters);
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();

  // Mutations
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const tasks = useMemo(() => tasksData?.tasks || [], [tasksData]);
  const categories = useMemo(() => categoriesData?.categories || [], [categoriesData]);

  // 간트차트에 표시되는 모든 담당자 목록 추출
  const allAssignees = useMemo(() => {
    const assignees = new Set(tasks.map((task) => task.assignee));
    return Array.from(assignees).sort((a, b) => a.localeCompare(b, 'ko'));
  }, [tasks]);

  // 담당자 필터 초기화 (모든 담당자 체크)
  useEffect(() => {
    if (allAssignees.length > 0 && selectedAssignees.size === 0) {
      setSelectedAssignees(new Set(allAssignees));
    }
  }, [allAssignees, selectedAssignees.size]);

  // 필터링된 tasks (선택된 담당자만 표시, 진행중 필터 적용)
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // 담당자 필터 적용
    if (selectedAssignees.size > 0) {
      result = result.filter((task) => selectedAssignees.has(task.assignee));
    }

    // 진행중 필터 적용
    if (showInProgressOnly) {
      result = result.filter((task) => task.status === TaskStatus.IN_PROGRESS);
    }

    return result;
  }, [tasks, selectedAssignees, showInProgressOnly]);

  // 오늘 기준 이전 7일, 이후 7일만 표시
  const dateRange = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      from: subDays(today, 7),
      to: addDays(today, 7),
    };
  }, []);

  // 담당자 필터 토글 핸들러
  const handleAssigneeToggle = useCallback((assignee: string, checked: boolean) => {
    setSelectedAssignees((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(assignee);
      } else {
        next.delete(assignee);
      }
      return next;
    });
  }, []);

  const handleCreateTask = useCallback(() => {
    setEditingTask(null);
    setTaskFormOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  }, []);

  const handleTaskSubmit = useCallback(
    async (data: CreateTaskRequest | UpdateTaskRequest) => {
      try {
        if ('id' in data) {
          await updateTaskMutation.mutateAsync(data as UpdateTaskRequest);
          toast.success('업무가 수정되었습니다.');
        } else {
          await createTaskMutation.mutateAsync(data as CreateTaskRequest);
          toast.success('업무가 생성되었습니다.');
        }
        setTaskFormOpen(false);
        setEditingTask(null);
      } catch (error) {
        toast.error('업무 저장에 실패했습니다.');
      }
    },
    [createTaskMutation, updateTaskMutation],
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      if (!confirm('정말 이 업무를 삭제하시겠습니까?')) return;

      try {
        await deleteTaskMutation.mutateAsync(taskId);
        toast.success('업무가 삭제되었습니다.');
      } catch (error) {
        toast.error('업무 삭제에 실패했습니다.');
      }
    },
    [deleteTaskMutation],
  );

  const handleFilterChange = useCallback((newFilters: GetTasksRequest) => {
    setFilters(newFilters);
  }, []);

  const handleCategoryCreate = useCallback(
    (data: Parameters<typeof createCategoryMutation.mutate>[0]) => {
      createCategoryMutation.mutate(data);
    },
    [createCategoryMutation],
  );

  const handleCategoryUpdate = useCallback(
    (data: Parameters<typeof updateCategoryMutation.mutate>[0]) => {
      updateCategoryMutation.mutate(data);
    },
    [updateCategoryMutation],
  );

  const handleCategoryDelete = useCallback(
    (id: string) => {
      if (confirm('정말 이 카테고리를 삭제하시겠습니까?')) {
        deleteCategoryMutation.mutate(id);
      }
    },
    [deleteCategoryMutation],
  );

  return {
    // State
    filters,
    taskFormOpen,
    categoryFormOpen,
    editingTask,
    isListPanelOpen,
    selectedAssignees,
    allAssignees,
    filteredTasks,
    dateRange,
    tasks,
    categories,
    isLoading: isLoadingTasks || isLoadingCategories,
    showInProgressOnly,

    // Actions
    setIsListPanelOpen,
    setTaskFormOpen,
    setCategoryFormOpen,
    setShowInProgressOnly,
    handleAssigneeToggle,
    handleCreateTask,
    handleEditTask,
    handleTaskSubmit,
    handleDeleteTask,
    handleFilterChange,
    handleCategoryCreate,
    handleCategoryUpdate,
    handleCategoryDelete,

    // Mutations
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
  };
}
