import { ChevronDown } from 'lucide-react';

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
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      
      <div className="relative group">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`
            saas-input appearance-none pr-10 cursor-pointer
            ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/10' : ''}
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
        
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400 pointer-events-none transition-colors group-focus-within:text-primary-500" />
      </div>
      
      {error && (
        <p className="text-xs font-medium text-danger-600 mt-1 flex items-center gap-1 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
