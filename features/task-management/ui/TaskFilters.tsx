'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import type { GetTasksRequest, TaskCategory } from '../api/entities/types';
import {
  TaskStatus,
  TaskPriority,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
} from '../api/entities/types';

interface TaskFiltersProps {
  filters: GetTasksRequest;
  categories: TaskCategory[];
  onFilterChange: (filters: GetTasksRequest) => void;
}

export function TaskFilters({ filters, categories, onFilterChange }: TaskFiltersProps) {
  // 필터 섹션 펼침/접힘 상태
  const [isExpanded, setIsExpanded] = useState(false);

  // 로컬 상태로 필터값 관리 (검색 버튼을 누르기 전까지는 로컬에만 저장)
  const [localFilters, setLocalFilters] = useState<GetTasksRequest>(filters);

  const handleLocalChange = useCallback((key: keyof GetTasksRequest, value: string | undefined) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  }, []);

  const handleSearch = useCallback(() => {
    onFilterChange(localFilters);
  }, [localFilters, onFilterChange]);

  const handleReset = useCallback(() => {
    setLocalFilters({});
    onFilterChange({});
  }, [onFilterChange]);

  const hasFilters = Object.values(filters).some((v) => v !== undefined);
  const hasLocalChanges =
    JSON.stringify(localFilters) !== JSON.stringify(filters) ||
    Object.values(localFilters).some((v) => v !== undefined);

  return (
    <div className='border-b bg-gray-50'>
      {/* 필터 헤더 (항상 표시) */}
      <div className='flex items-center justify-between p-4'>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className='flex items-center gap-2 font-semibold transition-colors hover:text-blue-600'
        >
          <Filter className='h-4 w-4' />
          <span>필터</span>
          {hasFilters && (
            <span className='ml-1 rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white'>
              {Object.values(filters).filter((v) => v !== undefined).length}
            </span>
          )}
          {isExpanded ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
        </button>

        {hasFilters && (
          <Button variant='ghost' size='sm' onClick={handleReset}>
            <X className='mr-1 h-4 w-4' />
            초기화
          </Button>
        )}
      </div>

      {/* 필터 내용 (접힘/펼침) */}
      {isExpanded && (
        <div className='space-y-3 px-4 pb-4'>
          {/* 담당자 */}
          <div>
            <Label htmlFor='assignee'>담당자</Label>
            <Input
              id='assignee'
              placeholder='담당자 이름'
              value={localFilters.assignee || ''}
              onChange={(e) => handleLocalChange('assignee', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </div>

          {/* 상태 */}
          <div>
            <Label htmlFor='status'>상태</Label>
            <Select
              value={localFilters.status || 'all'}
              onValueChange={(value) =>
                handleLocalChange('status', value === 'all' ? undefined : (value as TaskStatus))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='상태 선택' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>전체</SelectItem>
                {Object.values(TaskStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {TASK_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 우선순위 */}
          <div>
            <Label htmlFor='priority'>우선순위</Label>
            <Select
              value={localFilters.priority || 'all'}
              onValueChange={(value) =>
                handleLocalChange('priority', value === 'all' ? undefined : (value as TaskPriority))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='우선순위 선택' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>전체</SelectItem>
                {Object.values(TaskPriority).map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {TASK_PRIORITY_LABELS[priority]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 카테고리 */}
          <div>
            <Label htmlFor='category'>카테고리</Label>
            <Select
              value={localFilters.categoryId || 'all'}
              onValueChange={(value) =>
                handleLocalChange('categoryId', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='카테고리 선택' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>전체</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 검색 버튼 */}
          <Button
            className='w-full'
            onClick={handleSearch}
            disabled={!hasLocalChanges && !hasFilters}
          >
            <Search className='mr-2 h-4 w-4' />
            검색
          </Button>
        </div>
      )}
    </div>
  );
}
