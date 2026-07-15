import React from 'react';
import { cn } from '../../utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  subtitle?: string;
}

const colorMap = {
  blue:   { bg: 'bg-blue-50',    icon: 'text-blue-600'    },
  green:  { bg: 'bg-emerald-50', icon: 'text-emerald-600' },
  yellow: { bg: 'bg-amber-50',   icon: 'text-amber-600'   },
  red:    { bg: 'bg-red-50',     icon: 'text-red-600'     },
  purple: { bg: 'bg-violet-50',  icon: 'text-violet-600'  },
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = 'blue', subtitle }) => {
  const c = colorMap[color];
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', c.bg, c.icon)}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};
