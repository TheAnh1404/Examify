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
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      
      <div className="relative group">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-400 shrink-0 transition-colors group-focus-within:text-primary-500">
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
            ${icon ? 'pl-11' : 'pl-4'}
            ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/10' : ''}
          `}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-xs font-medium text-danger-600 mt-1 flex items-center gap-1 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
