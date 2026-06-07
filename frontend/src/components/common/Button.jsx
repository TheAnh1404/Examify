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
  icon
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 active:scale-[0.98] focus:outline-none';
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-sm hover:shadow-md disabled:bg-primary-300',
    secondary: 'bg-white hover:bg-secondary-50 active:bg-secondary-100 border border-secondary-300 text-secondary-700 shadow-sm disabled:border-secondary-200 disabled:text-secondary-400',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm disabled:bg-red-300',
    success: 'bg-accent-600 hover:bg-accent-700 active:bg-accent-800 text-white shadow-sm disabled:bg-accent-300',
    ghost: 'hover:bg-secondary-100 text-secondary-600 hover:text-secondary-900'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && (
        <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
      )}
      {!loading && icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
