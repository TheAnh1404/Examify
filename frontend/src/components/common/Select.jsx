import React from 'react';

const Select = ({
  label,
  name,
  value,
  onChange,
  options = [], // [{ value, label }] or simple string array
  required = false,
  error,
  placeholder,
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
      
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`
          saas-input appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%2522%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_14px_center] bg-no-repeat pr-10
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-secondary-300 focus:border-primary-500'}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        
        {options.map((opt) => {
          const isObj = typeof opt === 'object' && opt !== null;
          const val = isObj ? opt.value : opt;
          const lab = isObj ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {lab}
            </option>
          );
        })}
      </select>
      
      {error && (
        <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1 animate-slide-up">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
