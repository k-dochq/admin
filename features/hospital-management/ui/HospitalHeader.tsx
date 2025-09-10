'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function HospitalHeader() {
  const router = useRouter();

  const handleAddHospital = () => {
    router.push('/admin/hospitals/add');
  };

  return (
    <div className='flex items-center justify-end'>
      <Button onClick={handleAddHospital}>
        <Plus className='mr-2 h-4 w-4' />
        병원 추가
      </Button>
    </div>
  );
}
