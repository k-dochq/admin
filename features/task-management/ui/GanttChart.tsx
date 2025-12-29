'use client';

import { useMemo } from 'react';
import {
  format,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isSameDay,
  differenceInDays,
} from 'date-fns';
import { Badge } from '@/components/ui/badge';
import type { Task, TaskCategory } from '../api/entities/types';
import { TASK_STATUS_LABELS } from '../api/entities/types';

interface GanttChartProps {
  tasks: Task[];
  categories: TaskCategory[];
  onTaskClick?: (task: Task) => void;
  dateRange: { from: Date; to: Date };
}

export function GanttChart({ tasks, categories, onTaskClick, dateRange }: GanttChartProps) {
  const days = useMemo(() => {
    return eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
  }, [dateRange]);

  // 월별로 그룹화
  const monthGroups = useMemo(() => {
    const groups: { month: string; startIndex: number; count: number }[] = [];
    let currentMonth = '';
    let startIndex = 0;
    let count = 0;

    days.forEach((day, index) => {
      const monthKey = format(day, 'yyyy-MM');
      if (monthKey !== currentMonth) {
        if (currentMonth) {
          groups.push({ month: currentMonth, startIndex, count });
        }
        currentMonth = monthKey;
        startIndex = index;
        count = 1;
      } else {
        count++;
      }
    });

    if (currentMonth) {
      groups.push({ month: currentMonth, startIndex, count });
    }

    return groups;
  }, [days]);

  const getCategoryColor = (categoryId: string | null) => {
    if (!categoryId) return '#9ca3af';
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || '#9ca3af';
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return '미분류';
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || '미분류';
  };

  const getTaskPosition = (task: Task) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);

    // 시작일이 범위보다 이전이면 0으로, 범위 내에 있으면 해당 인덱스 찾기
    let startDay = days.findIndex((day) => {
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const taskStartDay = new Date(taskStart);
      taskStartDay.setHours(0, 0, 0, 0);
      return dayStart.getTime() === taskStartDay.getTime();
    });

    // 시작일이 범위보다 이전이면 첫날부터 시작
    if (startDay === -1) {
      if (taskStart < days[0]) {
        startDay = 0;
      } else {
        return null; // 시작일이 범위 이후면 표시 안함
      }
    }

    // 종료일 찾기
    let endDay = days.findIndex((day) => {
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const taskEndDay = new Date(taskEnd);
      taskEndDay.setHours(0, 0, 0, 0);
      return dayStart.getTime() === taskEndDay.getTime();
    });

    // 종료일이 범위보다 이후면 마지막날까지
    if (endDay === -1) {
      if (taskEnd > days[days.length - 1]) {
        endDay = days.length - 1;
      } else {
        return null; // 종료일이 범위 이전이면 표시 안함
      }
    }

    const duration = endDay - startDay + 1;

    return {
      left: `${(startDay / days.length) * 100}%`,
      width: `${(duration / days.length) * 100}%`,
    };
  };

  if (tasks.length === 0) {
    return (
      <div className='flex h-full items-center justify-center bg-white text-gray-500'>
        업무가 없습니다.
      </div>
    );
  }

  return (
    <div className='h-full overflow-auto bg-white'>
      {/* 헤더: 날짜 */}
      <div className='sticky top-0 z-10 bg-gray-50'>
        {/* 월 헤더 */}
        <div className='flex border-b'>
          <div className='w-64 shrink-0 border-r'></div>
          <div className='w-32 shrink-0 border-r'></div>
          <div className='w-32 shrink-0 border-r'></div>
          <div className='flex flex-1'>
            {monthGroups.map((group, index) => (
              <div
                key={index}
                className='border-r bg-blue-50 p-2 text-center text-sm font-semibold text-blue-900'
                style={{ width: `${(group.count / days.length) * 100}%` }}
              >
                {format(new Date(group.month), 'yyyy년 M월')}
              </div>
            ))}
          </div>
        </div>

        {/* 일 헤더 */}
        <div className='flex border-b'>
          <div className='w-64 shrink-0 border-r p-2'>
            <div className='text-sm font-semibold'>업무명</div>
          </div>
          <div className='w-32 shrink-0 border-r p-2'>
            <div className='text-sm font-semibold'>담당자</div>
          </div>
          <div className='w-32 shrink-0 border-r p-2'>
            <div className='text-sm font-semibold'>카테고리</div>
          </div>
          <div className='flex flex-1'>
            {days.map((day, index) => (
              <div
                key={index}
                className='flex-1 border-r p-2 text-center text-xs'
                style={{ minWidth: '40px' }}
              >
                <div className='font-medium'>{format(day, 'd')}</div>
                <div className='text-gray-500'>{format(day, 'EEE')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 업무 행 */}
      <div className='relative'>
        {tasks.map((task) => {
          const position = getTaskPosition(task);
          if (!position) return null;

          return (
            <div key={task.id} className='flex border-b hover:bg-gray-50'>
              <div className='w-64 shrink-0 border-r p-2'>
                <div className='truncate text-sm font-medium'>{task.title}</div>
                <div className='text-xs text-gray-500'>{TASK_STATUS_LABELS[task.status]}</div>
              </div>
              <div className='w-32 shrink-0 border-r p-2'>
                <div className='truncate text-sm'>{task.assignee}</div>
              </div>
              <div className='w-32 shrink-0 border-r p-2'>
                <Badge
                  variant='outline'
                  style={{
                    borderColor: getCategoryColor(task.categoryId),
                    color: getCategoryColor(task.categoryId),
                  }}
                  className='truncate text-xs'
                >
                  {getCategoryName(task.categoryId)}
                </Badge>
              </div>
              <div className='relative flex flex-1' style={{ minHeight: '60px' }}>
                {/* 날짜 구분선 */}
                {days.map((_, index) => (
                  <div key={index} className='flex-1 border-r' style={{ minWidth: '40px' }} />
                ))}

                {/* 업무 바 */}
                <div
                  className='absolute top-1/2 -translate-y-1/2 cursor-pointer rounded px-2 py-1 text-xs text-white transition-opacity hover:opacity-80'
                  style={{
                    left: position.left,
                    width: position.width,
                    backgroundColor: getCategoryColor(task.categoryId),
                    height: '32px',
                  }}
                  onClick={() => onTaskClick?.(task)}
                >
                  <div className='truncate font-medium'>{task.title}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
