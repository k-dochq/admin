import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, description, children, className }: ChartCardProps) {
  return (
    <div className={cn('bg-card rounded-lg border p-6 shadow-sm', className)}>
      <div className='mb-4'>
        <h3 className='text-lg font-semibold'>{title}</h3>
        {description && <p className='text-muted-foreground text-sm'>{description}</p>}
      </div>
      <div className='h-80'>{children}</div>
    </div>
  );
}
