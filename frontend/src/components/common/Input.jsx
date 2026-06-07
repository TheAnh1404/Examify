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
    <div className={`space-y-2 w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="saas-label">
          {label} {required && <span className="text-primary-500">*</span>}
        </label>
      )}
      
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-300 shrink-0 transition-colors group-focus-within:text-primary-500">
            {React.cloneElement(icon, { size: 18 })}
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
            saas-input py-3
            ${icon ? 'pl-12' : 'pl-5'}
            ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/5' : ''}
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
