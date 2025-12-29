'use client';

import { useState, useCallback, useMemo } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Plus, Tag, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { useTasks, useCategories } from '@/lib/queries/tasks';
import {
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/lib/mutations/tasks';
import { GanttChart } from './GanttChart';
import { TaskList } from './TaskList';
import { TaskFilters } from './TaskFilters';
import { TaskForm } from './TaskForm';
import { CategoryManagement } from './CategoryManagement';
import { LoadingSpinner } from '@/shared/ui';
import type {
  GetTasksRequest,
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
} from '../api/entities/types';
import { toast } from 'sonner';

export function TaskManagement() {
  const [filters, setFilters] = useState<GetTasksRequest>({});
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isListPanelOpen, setIsListPanelOpen] = useState(false); // 리스트 패널 상태

  // Queries - 날짜 범위 없이 모든 업무 조회
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

  // 업무 기반 날짜 범위 계산
  const dateRange = useMemo(() => {
    if (tasks.length === 0) {
      return {
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
      };
    }

    const dates = tasks.flatMap((task) => [new Date(task.startDate), new Date(task.endDate)]);
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    // 시작일 이전 7일, 종료일 이후 7일 여유 추가
    const from = new Date(minDate);
    from.setDate(from.getDate() - 7);
    const to = new Date(maxDate);
    to.setDate(to.getDate() + 7);

    return { from, to };
  }, [tasks]);

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

  if (isLoadingTasks || isLoadingCategories) {
    return <LoadingSpinner text='데이터를 불러오는 중...' />;
  }

  return (
    <div className='flex h-screen flex-col'>
      {/* 헤더 */}
      <div className='border-b bg-white p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <h1 className='text-2xl font-bold'>스케줄 관리</h1>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsListPanelOpen(!isListPanelOpen)}
            >
              {isListPanelOpen ? (
                <>
                  <PanelLeftClose className='mr-2 h-4 w-4' />
                  리스트 숨기기
                </>
              ) : (
                <>
                  <PanelLeftOpen className='mr-2 h-4 w-4' />
                  리스트 보기
                </>
              )}
            </Button>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={() => setCategoryFormOpen(true)}>
              <Tag className='mr-2 h-4 w-4' />
              카테고리 관리
            </Button>
            <Button onClick={handleCreateTask}>
              <Plus className='mr-2 h-4 w-4' />
              업무 추가
            </Button>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className='flex flex-1 overflow-hidden'>
        {/* 왼쪽: 필터 + 업무 리스트 (조건부 렌더링) */}
        {isListPanelOpen && (
          <div className='w-1/3 overflow-y-auto border-r'>
            <TaskFilters
              filters={filters}
              categories={categories}
              onFilterChange={handleFilterChange}
            />
            <div className='p-4'>
              <TaskList
                tasks={tasks}
                categories={categories}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            </div>
          </div>
        )}

        {/* 오른쪽: 간트차트 */}
        <div className='flex-1 overflow-hidden'>
          <GanttChart
            tasks={tasks}
            categories={categories}
            onTaskClick={handleEditTask}
            dateRange={dateRange}
          />
        </div>
      </div>

      {/* 업무 폼 다이얼로그 */}
      <TaskForm
        open={taskFormOpen}
        onOpenChange={setTaskFormOpen}
        task={editingTask}
        categories={categories}
        onSubmit={handleTaskSubmit}
        isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
      />

      {/* 카테고리 관리 다이얼로그 */}
      <CategoryManagement
        open={categoryFormOpen}
        onOpenChange={setCategoryFormOpen}
        categories={categories}
        onCreate={(data) => createCategoryMutation.mutate(data)}
        onUpdate={(data) => updateCategoryMutation.mutate(data)}
        onDelete={(id) => {
          if (confirm('정말 이 카테고리를 삭제하시겠습니까?')) {
            deleteCategoryMutation.mutate(id);
          }
        }}
        isLoading={
          createCategoryMutation.isPending ||
          updateCategoryMutation.isPending ||
          deleteCategoryMutation.isPending
        }
      />
    </div>
  );
}
