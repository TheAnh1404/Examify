import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({
  title,
  value,
  icon: Icon,
  trendValue,
  trendType = 'up', // 'up' | 'down'
  className = '',
  description
}) => {
  const isUp = trendType === 'up';

  return (
    <div className={`saas-card p-8 flex flex-col justify-between hover:shadow-xl hover:shadow-secondary-200/50 transition-all duration-300 ${className}`}>
      <div className="flex items-start justify-between mb-6">
        <div className="p-3.5 rounded-2xl bg-[#EEF2FF] text-primary-500 shadow-sm shadow-primary-500/5">
          {Icon && <Icon className="h-6 w-6" />}
        </div>
        {trendValue && (
          <div className={`flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1.5 rounded-lg border ${
            isUp 
              ? 'bg-accent-50 text-accent-700 border-accent-100/50' 
              : 'bg-danger-50 text-danger-700 border-danger-100/50'
          }`}>
            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trendValue}
          </div>
        )}
      </div>

      <div>
        <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1.5">{title}</p>
        <h3 className="text-3xl font-extrabold text-secondary-900 tracking-tight">{value}</h3>
        {description && <p className="text-xs font-semibold text-secondary-400 mt-3 flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-secondary-200" />
          {description}
        </p>}
      </div>
    </div>
  );
};

export default StatCard;
