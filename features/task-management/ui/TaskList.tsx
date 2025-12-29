'use client';

import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import type { Task, TaskCategory } from '../api/entities/types';
import {
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
} from '../api/entities/types';

interface TaskListProps {
  tasks: Task[];
  categories: TaskCategory[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskList({ tasks, categories, onEdit, onDelete }: TaskListProps) {
  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return '미분류';
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || '미분류';
  };

  const getCategoryColor = (categoryId: string | null) => {
    if (!categoryId) return undefined;
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || undefined;
  };

  if (tasks.length === 0) {
    return (
      <div className='flex items-center justify-center py-12 text-gray-500'>업무가 없습니다.</div>
    );
  }

  return (
    <div className='space-y-3'>
      {tasks.map((task) => (
        <Card key={task.id} className='transition-shadow hover:shadow-md'>
          <CardContent className='p-4'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <div className='mb-2 flex items-center gap-2'>
                  <h3 className='font-semibold'>{task.title}</h3>
                  <Badge
                    variant='outline'
                    style={{
                      borderColor: TASK_PRIORITY_COLORS[task.priority],
                      color: TASK_PRIORITY_COLORS[task.priority],
                    }}
                  >
                    {TASK_PRIORITY_LABELS[task.priority]}
                  </Badge>
                </div>

                {task.description && (
                  <p className='mb-2 text-sm text-gray-600'>{task.description}</p>
                )}

                <div className='flex flex-wrap gap-2 text-xs text-gray-500'>
                  <span>담당자: {task.assignee}</span>
                  <span>•</span>
                  <span>상태: {TASK_STATUS_LABELS[task.status]}</span>
                  <span>•</span>
                  <span>
                    {format(new Date(task.startDate), 'yyyy-MM-dd')} ~{' '}
                    {format(new Date(task.endDate), 'yyyy-MM-dd')}
                  </span>
                </div>

                {task.categoryId && (
                  <div className='mt-2'>
                    <Badge
                      style={{
                        backgroundColor: getCategoryColor(task.categoryId) || undefined,
                        color: 'white',
                      }}
                    >
                      {getCategoryName(task.categoryId)}
                    </Badge>
                  </div>
                )}
              </div>

              <div className='ml-4 flex gap-1'>
                <Button variant='ghost' size='sm' onClick={() => onEdit(task)}>
                  <Pencil className='h-4 w-4' />
                </Button>
                <Button variant='ghost' size='sm' onClick={() => onDelete(task.id)}>
                  <Trash2 className='h-4 w-4 text-red-500' />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
