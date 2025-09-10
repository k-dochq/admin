'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function DoctorHeader() {
  const router = useRouter();

  const handleAddDoctor = () => {
    router.push('/admin/doctors/add');
  };

  return (
    <div className='flex items-center justify-between'>
      <div>
        <h1 className='text-2xl font-bold'>의사 관리</h1>
        <p className='text-muted-foreground'>의사 정보를 관리하고 병원과 연결할 수 있습니다.</p>
      </div>
      <Button onClick={handleAddDoctor}>
        <Plus className='mr-2 h-4 w-4' />
        의사 추가
      </Button>
    </div>
  );
}
