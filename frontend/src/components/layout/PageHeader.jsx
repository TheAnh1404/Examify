import React from 'react';
import Breadcrumb from './Breadcrumb';

const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8 animate-fade-in shrink-0">
      <div>
        <Breadcrumb />
        <h1 className="h1 mb-1">
          {title}
        </h1>
        {subtitle && (
          <p className="p">
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
