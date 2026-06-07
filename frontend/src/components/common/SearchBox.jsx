import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBox = ({
  value,
  onChange,
  placeholder = 'Search records...',
  className = ''
}) => {
  return (
    <div className={`relative w-full sm:w-80 ${className}`}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400 shrink-0" />
      
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="saas-input pl-10 pr-8"
      />
      
      {value && (
        <button
          onClick={() => onChange({ target: { value: '' } })}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-650"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export default SearchBox;
