import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <div className={cn('bg-card rounded-lg border p-6 shadow-sm', className)}>
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <p className='text-muted-foreground text-sm font-medium'>{title}</p>
          <p className='text-2xl font-bold'>{value}</p>
          {description && <p className='text-muted-foreground text-xs'>{description}</p>}
        </div>
        {Icon && (
          <div className='bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full'>
            <Icon className='text-primary h-4 w-4' />
          </div>
        )}
      </div>
      {trend && (
        <div className='mt-4 flex items-center'>
          <span
            className={cn(
              'text-sm font-medium',
              trend.isPositive ? 'text-green-600' : 'text-red-600',
            )}
          >
            {trend.isPositive ? '+' : ''}
            {trend.value}%
          </span>
          <span className='text-muted-foreground ml-1 text-xs'>vs 이전 기간</span>
        </div>
      )}
    </div>
  );
}
