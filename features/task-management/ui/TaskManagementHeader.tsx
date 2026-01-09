'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Tag, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { AssigneeFilter } from './AssigneeFilter';

interface TaskManagementHeaderProps {
  isListPanelOpen: boolean;
  onToggleListPanel: () => void;
  allAssignees: string[];
  selectedAssignees: Set<string>;
  onAssigneeToggle: (assignee: string, checked: boolean) => void;
  showInProgressOnly: boolean;
  onShowInProgressOnlyChange: (checked: boolean) => void;
  dateRangeMode: 'week' | 'month';
  onDateRangeModeChange: (mode: 'week' | 'month') => void;
  onOpenCategoryManagement: () => void;
  onCreateTask: () => void;
}

export function TaskManagementHeader({
  isListPanelOpen,
  onToggleListPanel,
  allAssignees,
  selectedAssignees,
  onAssigneeToggle,
  showInProgressOnly,
  onShowInProgressOnlyChange,
  dateRangeMode,
  onDateRangeModeChange,
  onOpenCategoryManagement,
  onCreateTask,
}: TaskManagementHeaderProps) {
  return (
    <div className='border-b bg-white p-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <h1 className='text-2xl font-bold'>스케줄 관리</h1>
          <Button variant='outline' size='sm' onClick={onToggleListPanel}>
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
          <AssigneeFilter
            assignees={allAssignees}
            selectedAssignees={selectedAssignees}
            onToggle={onAssigneeToggle}
          />
          <div className='ml-4 flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5'>
            <Checkbox
              id='show-in-progress-only'
              checked={showInProgressOnly}
              onCheckedChange={(checked) => onShowInProgressOnlyChange(checked === true)}
            />
            <label
              htmlFor='show-in-progress-only'
              className='cursor-pointer text-sm font-medium text-gray-700'
            >
              진행중인 것만 보기
            </label>
          </div>
          <div className='ml-4 flex items-center gap-1 rounded-md border border-gray-200 bg-white'>
            <Button
              variant={dateRangeMode === 'week' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => onDateRangeModeChange('week')}
              className='rounded-r-none'
            >
              2주
            </Button>
            <Button
              variant={dateRangeMode === 'month' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => onDateRangeModeChange('month')}
              className='rounded-l-none border-l'
            >
              한달
            </Button>
          </div>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={onOpenCategoryManagement}>
            <Tag className='mr-2 h-4 w-4' />
            카테고리 관리
          </Button>
          <Button onClick={onCreateTask}>
            <Plus className='mr-2 h-4 w-4' />
            업무 추가
          </Button>
        </div>
      </div>
    </div>
  );
}
