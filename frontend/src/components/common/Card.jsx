import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  footer,
  className = '', 
  bodyClassName = '',
  headerClassName = '',
  hover = false,
  icon: Icon
}) => {
  return (
    <div className={`saas-card ${hover ? 'saas-card-hover' : ''} ${className}`}>
      {(title || Icon) && (
        <div className={`px-6 py-4 border-b border-secondary-100 flex items-center justify-between ${headerClassName}`}>
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <div>
              {title && <h3 className="text-base font-bold text-secondary-900 leading-none">{title}</h3>}
              {subtitle && <p className="text-xs text-secondary-500 mt-1">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}
      
      <div className={`px-6 py-5 ${bodyClassName}`}>
        {children}
      </div>

      {footer && (
        <div className="px-6 py-4 bg-secondary-50/50 border-t border-secondary-100">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
