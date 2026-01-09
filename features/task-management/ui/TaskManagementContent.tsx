'use client';

import { useMemo } from 'react';
import { GanttChart } from './GanttChart';
import { TaskList } from './TaskList';
import { TaskFilters } from './TaskFilters';
import type { Task, TaskCategory, GetTasksRequest } from '../api/entities/types';
import { TaskStatus } from '../api/entities/types';

interface TaskManagementContentProps {
  isListPanelOpen: boolean;
  filters: GetTasksRequest;
  categories: TaskCategory[];
  tasks: Task[];
  dateRange: { from: Date; to: Date };
  onFilterChange: (filters: GetTasksRequest) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskManagementContent({
  isListPanelOpen,
  filters,
  categories,
  tasks,
  dateRange,
  onFilterChange,
  onEditTask,
  onDeleteTask,
}: TaskManagementContentProps) {
  // 왼쪽 리스트에서는 완료된 항목 제외
  const listTasks = useMemo(() => {
    return tasks.filter((task) => task.status !== TaskStatus.COMPLETED);
  }, [tasks]);

  return (
    <div className='flex flex-1 overflow-hidden'>
      {/* 왼쪽: 필터 + 업무 리스트 (조건부 렌더링) */}
      {isListPanelOpen && (
        <div className='w-1/3 overflow-y-auto border-r'>
          <TaskFilters filters={filters} categories={categories} onFilterChange={onFilterChange} />
          <div className='p-4'>
            <TaskList
              tasks={listTasks}
              categories={categories}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          </div>
        </div>
      )}

      {/* 오른쪽: 간트차트 */}
      <div className='flex-1 overflow-hidden'>
        <GanttChart
          tasks={tasks}
          categories={categories}
          onTaskClick={onEditTask}
          dateRange={dateRange}
        />
      </div>
    </div>
  );
}
