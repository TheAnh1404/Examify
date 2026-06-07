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
          {label} {required && <span className="text-danger-500">*</span>}
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
          saas-input resize-none py-3
          ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/10' : ''}
        `}
        {...props}
      />
      
      {error && (
        <p className="text-xs font-medium text-danger-600 mt-1 flex items-center gap-1 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};

export default Textarea;
