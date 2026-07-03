import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  // Capitalize path segments for display
  const formatSegment = (str) => {
    // If it is an ID (e.g. att-xxx, ex-xxx, usr-xxx), abbreviate it
    if (str.includes('-')) {
      if (str.startsWith('usr-') || str.startsWith('sbj-') || str.startsWith('q-') || str.startsWith('ex-') || str.startsWith('att-')) {
        return 'Chi tiết';
      }
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs text-secondary-450 font-medium font-sans mb-3 shrink-0 select-none">
      <Link to="/" className="text-secondary-400 hover:text-primary-600 transition-colors flex items-center gap-1">
        <Home className="h-3.5 w-3.5" />
      </Link>
      
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;

        return (
          <React.Fragment key={to}>
            <ChevronRight className="h-3.5 w-3.5 text-secondary-300" />
            {last ? (
              <span className="text-secondary-600 font-semibold truncate max-w-[150px]">
                {formatSegment(value)}
              </span>
            ) : (
              <Link to={to} className="text-secondary-400 hover:text-primary-600 transition-colors truncate max-w-[150px]">
                {formatSegment(value)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
