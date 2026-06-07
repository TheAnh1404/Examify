import React from 'react';
import Breadcrumb from './Breadcrumb';

const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-secondary-200 pb-5 mb-6 shrink-0">
      <div>
        <Breadcrumb />
        <h1 className="font-display font-bold text-2xl text-secondary-800 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-secondary-500 mt-1 font-medium">
            {subtitle}
          </p>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
