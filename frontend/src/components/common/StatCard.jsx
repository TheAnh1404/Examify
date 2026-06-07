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
    <div className={`saas-card p-6 flex flex-col justify-between hover:shadow-card-hover transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-primary-50 text-primary-600">
          {Icon && <Icon className="h-5 w-5" />}
        </div>
        {trendValue && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${
            isUp 
              ? 'bg-accent-50 text-accent-700 border-accent-100' 
              : 'bg-danger-50 text-danger-700 border-danger-100'
          }`}>
            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trendValue}
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-secondary-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-secondary-900 tracking-tight">{value}</h3>
        {description && <p className="text-xs text-secondary-400 mt-2">{description}</p>}
      </div>
    </div>
  );
};

export default StatCard;
