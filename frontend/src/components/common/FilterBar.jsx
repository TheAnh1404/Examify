import React from 'react';
import { Filter } from 'lucide-react';

const FilterBar = ({
  value,
  onChange,
  options = [], // [{ value, label }]
  label = 'Filter:',
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2.5 w-full sm:w-auto ${className}`}>
      <Filter className="h-4.5 w-4.5 text-secondary-400 shrink-0" />
      {label && <span className="text-sm font-semibold text-secondary-500 shrink-0 hidden sm:inline">{label}</span>}
      
      <select
        value={value}
        onChange={onChange}
        className="bg-white border border-secondary-300 text-secondary-700 text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500 w-full sm:w-44 shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%2522%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_10px_center] bg-no-repeat pr-8"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterBar;
