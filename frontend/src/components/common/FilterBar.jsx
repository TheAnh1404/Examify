import { Filter, ChevronDown } from 'lucide-react';

const FilterBar = ({
  value,
  onChange,
  options = [], // [{ value, label }]
  label = 'Filter:',
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-3 w-full sm:w-auto ${className}`}>
      <div className="h-11 px-4 rounded-xl bg-white border border-secondary-200 flex items-center gap-2.5 shadow-sm group focus-within:border-primary-500 transition-all">
        <Filter className="h-4 w-4 text-secondary-400 shrink-0" />
        {label && <span className="text-sm font-bold text-secondary-500 shrink-0 hidden sm:inline">{label}</span>}
        
        <div className="relative">
          <select
            value={value}
            onChange={onChange}
            className="bg-transparent text-secondary-900 text-sm font-bold focus:outline-none w-full sm:w-44 appearance-none pr-6 cursor-pointer"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
