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
        <div className={`px-8 py-6 border-b border-secondary-50 flex items-center justify-between ${headerClassName}`}>
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="p-2.5 rounded-xl bg-primary-50 text-primary-500 shadow-sm shadow-primary-500/5">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <div>
              {title && <h3 className="text-lg font-bold text-secondary-900 tracking-tight">{title}</h3>}
              {subtitle && <p className="text-xs font-semibold text-secondary-400 mt-0.5 tracking-wide uppercase">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}
      
      <div className={`px-8 py-6 ${bodyClassName}`}>
        {children}
      </div>

      {footer && (
        <div className="px-8 py-5 bg-secondary-50/30 border-t border-secondary-50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
