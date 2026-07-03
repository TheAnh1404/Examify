import { Search, X } from 'lucide-react';

const SearchBox = ({
  value,
  onChange,
  placeholder = 'Tìm kiếm dữ liệu...',
  className = ''
}) => {
  return (
    <div className={`relative w-full sm:w-80 group ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-secondary-400 group-focus-within:text-primary-500 transition-colors shrink-0" />
      
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="saas-input pl-11 pr-10 h-11"
      />
      
      {value && (
        <button
          onClick={() => onChange({ target: { value: '' } })}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 transition-all"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBox;
