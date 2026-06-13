const Badge = ({ 
  children, 
  variant = 'slate', // 'primary' | 'success' | 'danger' | 'warning' | 'slate' | 'indigo' | 'purple'
  className = '',
  dot = false
}) => {
  const styles = {
    primary: 'bg-primary-50 border-primary-100 text-primary-600',
    success: 'bg-accent-50 border-accent-100 text-accent-700',
    danger: 'bg-danger-50 border-danger-100 text-danger-700',
    warning: 'bg-warning-50 border-warning-100 text-warning-700',
    slate: 'bg-secondary-50 border-secondary-100 text-secondary-500',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600',
    purple: 'bg-purple-50 border-purple-100 text-purple-600'
  };

  const dotStyles = {
    primary: 'bg-primary-500',
    success: 'bg-accent-500',
    danger: 'bg-danger-500',
    warning: 'bg-warning-500',
    slate: 'bg-secondary-400',
    indigo: 'bg-indigo-500',
    purple: 'bg-purple-500'
  };

  const formatText = (txt) => {
    if (typeof txt === 'string') {
      return txt; // Keep casing as provided or handle externally
    }
    return txt;
  };

  return (
    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-[0.1em] inline-flex items-center justify-center gap-1.5 border shrink-0 ${styles[variant]} ${className}`}>
      {dot && <span className={`h-1 w-1 rounded-full ${dotStyles[variant]}`} />}
      {formatText(children)}
    </span>
  );
};

export default Badge;
