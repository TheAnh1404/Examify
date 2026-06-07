import React from 'react';

const Badge = ({ 
  children, 
  variant = 'slate', // 'primary' | 'success' | 'danger' | 'warning' | 'slate' | 'indigo' | 'purple'
  className = '' 
}) => {
  const styles = {
    primary: 'bg-primary-50 border border-primary-100 text-primary-700',
    success: 'bg-accent-50 border border-accent-100 text-accent-700',
    danger: 'bg-red-50 border border-red-100 text-red-700',
    warning: 'bg-amber-50 border border-amber-100 text-amber-700',
    slate: 'bg-secondary-100 border border-secondary-200 text-secondary-700',
    indigo: 'bg-indigo-50 border border-indigo-100 text-indigo-700',
    purple: 'bg-purple-50 border border-purple-100 text-purple-700'
  };

  const cleanText = (txt) => {
    if (typeof txt === 'string') {
      return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
    }
    return txt;
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center shrink-0 ${styles[variant]} ${className}`}>
      {cleanText(children)}
    </span>
  );
};

export default Badge;
