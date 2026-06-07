import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  className = '',
  icon,
  iconRight = false,
  fullWidth = false
}) => {
  const baseStyle = 'inline-flex items-center justify-center gap-2 font-bold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] focus:outline-none';
  
  const variants = {
    primary: 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white shadow-lg shadow-primary-500/20 focus:ring-4 focus:ring-primary-500/10',
    secondary: 'bg-white hover:bg-secondary-50 active:bg-secondary-100 border border-secondary-100 text-secondary-900 shadow-sm focus:ring-4 focus:ring-secondary-500/5',
    danger: 'bg-danger-600 hover:bg-danger-700 active:bg-danger-800 text-white shadow-lg shadow-danger-500/20 focus:ring-4 focus:ring-danger-500/10',
    success: 'bg-accent-600 hover:bg-accent-700 active:bg-accent-800 text-white shadow-lg shadow-accent-500/20 focus:ring-4 focus:ring-accent-500/10',
    ghost: 'hover:bg-secondary-100 text-secondary-600 hover:text-secondary-900 border border-transparent',
    outline: 'bg-transparent border border-secondary-200 text-secondary-600 hover:bg-secondary-50 hover:border-secondary-300'
  };

  const sizes = {
    sm: 'text-xs px-4 py-2 rounded-xl',
    md: 'text-sm px-6 py-3 rounded-xl',
    lg: 'text-base px-8 py-4 rounded-2xl'
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
    >
      {loading ? (
        <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
      ) : (
        <>
          {!iconRight && icon && <span className="shrink-0">{icon}</span>}
          {children}
          {iconRight && icon && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
