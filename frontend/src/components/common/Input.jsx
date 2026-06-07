import React from 'react';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="saas-label">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 shrink-0">
            {icon}
          </div>
        )}
        
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`
            saas-input
            ${icon ? 'pl-10' : 'pl-3.5'}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-secondary-300 focus:border-primary-500'}
          `}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1 animate-slide-up">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
