import React from 'react';

const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 4,
  error,
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
      
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={`
          saas-input resize-none
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-secondary-300 focus:border-primary-500'}
        `}
        {...props}
      />
      
      {error && (
        <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1 animate-slide-up">
          {error}
        </p>
      )}
    </div>
  );
};

export default Textarea;
