import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  actions,
  footer,
  hoverable = false,
  className = '',
  bodyClassName = 'p-6'
}) => {
  return (
    <div className={`saas-card ${hoverable ? 'saas-card-hover' : ''} ${className}`}>
      {/* Header Slot */}
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-secondary-200 flex items-center justify-between gap-4 flex-wrap shrink-0">
          <div>
            {title && <h3 className="font-semibold text-base text-secondary-800 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-secondary-500 font-medium mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2.5 ml-auto">{actions}</div>}
        </div>
      )}
      
      {/* Body Content */}
      <div className={bodyClassName}>
        {children}
      </div>

      {/* Footer Slot */}
      {footer && (
        <div className="px-6 py-3 border-t border-secondary-200 bg-secondary-50 flex items-center gap-3 shrink-0 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
