'use client';

import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { User, Building2, Star, MessageSquare, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RecentActivity } from '@/lib/queries/dashboard';

interface ActivityFeedProps {
  activities: RecentActivity[];
  className?: string;
}

const ACTIVITY_ICONS = {
  user: User,
  hospital: Building2,
  review: Star,
  consultation: MessageSquare,
};

const ACTIVITY_COLORS = {
  user: 'text-blue-600 bg-blue-100',
  hospital: 'text-green-600 bg-green-100',
  review: 'text-yellow-600 bg-yellow-100',
  consultation: 'text-purple-600 bg-purple-100',
};

export function ActivityFeed({ activities, className }: ActivityFeedProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <h3 className='text-lg font-semibold'>최근 활동</h3>
      <div className='space-y-3'>
        {activities.map((activity) => {
          const Icon = ACTIVITY_ICONS[activity.type];
          const colorClass = ACTIVITY_COLORS[activity.type];

          return (
            <div
              key={activity.id}
              className='bg-card flex items-start space-x-3 rounded-lg border p-3'
            >
              <div
                className={cn(
                  'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
                  colorClass,
                )}
              >
                <Icon className='h-4 w-4' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-foreground text-sm font-medium'>{activity.title}</p>
                <p className='text-muted-foreground truncate text-sm'>{activity.description}</p>
                <div className='text-muted-foreground mt-1 flex items-center text-xs'>
                  <Clock className='mr-1 h-3 w-3' />
                  {formatDistanceToNow(activity.createdAt, {
                    addSuffix: true,
                    locale: ko,
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
