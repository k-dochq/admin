'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Filter } from 'lucide-react';

interface AssigneeFilterProps {
  assignees: string[];
  selectedAssignees: Set<string>;
  onToggle: (assignee: string, checked: boolean) => void;
}

export function AssigneeFilter({ assignees, selectedAssignees, onToggle }: AssigneeFilterProps) {
  if (assignees.length === 0) {
    return null;
  }

  return (
    <div className='ml-4 flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5'>
      <Filter className='h-4 w-4 text-gray-600' />
      <span className='text-sm font-medium text-gray-700'>담당자 필터:</span>
      <div className='flex items-center gap-3'>
        {assignees.map((assignee) => (
          <div key={assignee} className='flex items-center gap-1.5'>
            <Checkbox
              id={`assignee-${assignee}`}
              checked={selectedAssignees.has(assignee)}
              onCheckedChange={(checked) => onToggle(assignee, checked === true)}
            />
            <label
              htmlFor={`assignee-${assignee}`}
              className='cursor-pointer text-sm text-gray-700'
            >
              {assignee}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
