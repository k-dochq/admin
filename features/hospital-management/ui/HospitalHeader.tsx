'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function HospitalHeader() {
  return (
    <div className='flex items-center justify-end'>
      <Button>
        <Plus className='mr-2 h-4 w-4' />
        병원 추가
      </Button>
    </div>
  );
}
