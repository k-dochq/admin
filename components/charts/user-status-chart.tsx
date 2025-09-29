'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { UserStatusStats } from '@/lib/queries/dashboard';

interface UserStatusChartProps {
  data: UserStatusStats[];
}

const COLORS = {
  ACTIVE: '#10b981', // green-500
  INACTIVE: '#6b7280', // gray-500
  SUSPENDED: '#f59e0b', // amber-500
  DELETED: '#ef4444', // red-500
};

const STATUS_LABELS = {
  ACTIVE: '활성',
  INACTIVE: '비활성',
  SUSPENDED: '정지',
  DELETED: '삭제됨',
};

export function UserStatusChart({ data }: UserStatusChartProps) {
  const chartData = data.map((item) => ({
    name: STATUS_LABELS[item.status],
    value: item.count,
    percentage: item.percentage,
    color: COLORS[item.status],
  }));

  return (
    <ResponsiveContainer width='100%' height='100%'>
      <PieChart>
        <Pie
          data={chartData}
          cx='50%'
          cy='50%'
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey='value'
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string, props: { payload?: { percentage: number } }) => [
            `${value}명 (${props.payload?.percentage.toFixed(1) || 0}%)`,
            name,
          ]}
        />
        <Legend
          verticalAlign='bottom'
          height={36}
          formatter={(value, entry) => <span style={{ color: entry.color }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
