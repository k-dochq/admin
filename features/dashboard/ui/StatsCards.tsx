import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, FileText, Database, Activity } from 'lucide-react';

const stats = [
  {
    title: '총 수익',
    value: '₩45,231,000',
    change: '+20.1%',
    changeType: 'increase' as const,
    icon: TrendingUp,
    description: '지난 달 대비',
  },
  {
    title: '활성 사용자',
    value: '2,350',
    change: '+180',
    changeType: 'increase' as const,
    icon: Users,
    description: '새로 가입한 사용자',
  },
  {
    title: '총 주문',
    value: '12,234',
    change: '-19%',
    changeType: 'decrease' as const,
    icon: FileText,
    description: '지난 주 대비',
  },
  {
    title: '시스템 활동',
    value: '573',
    change: '+201',
    changeType: 'increase' as const,
    icon: Activity,
    description: '활성 세션',
  },
];

export function StatsCards() {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{stat.title}</CardTitle>
            <stat.icon className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stat.value}</div>
            <div className='text-muted-foreground flex items-center space-x-2 text-xs'>
              <Badge
                variant={stat.changeType === 'increase' ? 'default' : 'destructive'}
                className='text-xs'
              >
                {stat.changeType === 'increase' ? (
                  <TrendingUp className='mr-1 h-3 w-3' />
                ) : (
                  <TrendingDown className='mr-1 h-3 w-3' />
                )}
                {stat.change}
              </Badge>
              <span>{stat.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
