import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({
  title,
  value,
  icon,
  trendValue,
  trendType = 'up', // 'up' | 'down'
  className = ''
}) => {
  return (
    <div className={`saas-card p-6 flex justify-between items-start gap-4 hover:shadow-md transition-all duration-200 ${className}`}>
      <div className="space-y-2.5">
        <span className="block text-xs font-semibold text-secondary-500 uppercase tracking-wider">
          {title}
        </span>
        <span className="block font-display font-extrabold text-3xl text-secondary-800 tracking-tight">
          {value}
        </span>
        
        {trendValue && (
          <div className="flex items-center gap-1.5 text-xs font-semibold mt-1.5 select-none">
            {trendType === 'up' ? (
              <span className="flex items-center gap-0.5 text-accent-600 bg-accent-50 border border-accent-100 rounded px-1.5 py-0.5">
                <TrendingUp className="h-3 w-3" />
                {trendValue}
              </span>
            ) : (
              <span className="flex items-center gap-0.5 text-red-600 bg-red-50 border border-red-100 rounded px-1.5 py-0.5">
                <TrendingDown className="h-3 w-3" />
                {trendValue}
              </span>
            )}
            <span className="text-secondary-400 font-medium font-sans">vs last month</span>
          </div>
        )}
      </div>

      {icon && (
        <div className="h-12 w-12 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 shrink-0 shadow-sm shadow-primary-500/5">
          {icon}
        </div>
      )}
    </div>
  );
};

export default StatCard;
