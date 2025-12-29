'use client';

import { useMemo, useState } from 'react';
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarDays, CalendarRange } from 'lucide-react';
import type { Task, TaskCategory } from '../api/entities/types';

interface GanttChartProps {
  tasks: Task[];
  categories: TaskCategory[];
  onTaskClick?: (task: Task) => void;
  dateRange: { from: Date; to: Date };
}

export function GanttChart({ tasks, categories, onTaskClick, dateRange }: GanttChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);

  const getCategoryColor = (categoryId: string | null) => {
    if (!categoryId) return '#9ca3af';
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || '#9ca3af';
  };

  const getStatusProgress = (status: string) => {
    const progressMap: Record<string, number> = {
      PENDING: 0,
      IN_PROGRESS: 50,
      COMPLETED: 100,
    };
    return progressMap[status] || 0;
  };

  const ganttTasks: GanttTask[] = useMemo(() => {
    return tasks.map((task) => ({
      id: task.id,
      name: task.title,
      start: new Date(task.startDate),
      end: new Date(task.endDate),
      progress: getStatusProgress(task.status),
      type: 'task' as const,
      styles: {
        backgroundColor: getCategoryColor(task.categoryId),
        backgroundSelectedColor: getCategoryColor(task.categoryId),
        progressColor: '#10b981',
        progressSelectedColor: '#059669',
      },
      project: task.assignee,
    }));
  }, [tasks, categories]);

  const handleTaskChange = (task: GanttTask) => {
    // 날짜 변경 시 처리
    const originalTask = tasks.find((t) => t.id === task.id);
    if (originalTask && onTaskClick) {
      onTaskClick(originalTask);
    }
  };

  const handleTaskClick = (task: GanttTask) => {
    const originalTask = tasks.find((t) => t.id === task.id);
    if (originalTask && onTaskClick) {
      onTaskClick(originalTask);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className='flex h-full items-center justify-center bg-white text-gray-500'>
        업무가 없습니다.
      </div>
    );
  }

  return (
    <div className='flex h-full flex-col bg-white'>
      {/* 뷰 모드 선택 */}
      <div className='border-b p-4'>
        <div className='flex gap-2'>
          <Button
            variant={viewMode === ViewMode.Day ? 'default' : 'outline'}
            size='sm'
            onClick={() => setViewMode(ViewMode.Day)}
          >
            <Calendar className='mr-2 h-4 w-4' />
            일별
          </Button>
          <Button
            variant={viewMode === ViewMode.Week ? 'default' : 'outline'}
            size='sm'
            onClick={() => setViewMode(ViewMode.Week)}
          >
            <CalendarDays className='mr-2 h-4 w-4' />
            주별
          </Button>
          <Button
            variant={viewMode === ViewMode.Month ? 'default' : 'outline'}
            size='sm'
            onClick={() => setViewMode(ViewMode.Month)}
          >
            <CalendarRange className='mr-2 h-4 w-4' />
            월별
          </Button>
        </div>
      </div>

      {/* 간트차트 */}
      <div className='flex-1 overflow-auto p-4'>
        <Gantt
          tasks={ganttTasks}
          viewMode={viewMode}
          onDateChange={handleTaskChange}
          onClick={handleTaskClick}
          locale='ko'
          listCellWidth='200px'
          columnWidth={viewMode === ViewMode.Day ? 60 : viewMode === ViewMode.Week ? 100 : 120}
        />
      </div>
    </div>
  );
}
