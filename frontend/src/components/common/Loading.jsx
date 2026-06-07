import React from 'react';

const Loading = ({ 
  message = 'Retrieving records...', 
  fullPage = false 
}) => {
  const containerStyle = fullPage 
    ? 'min-h-screen bg-secondary-50 flex flex-col items-center justify-center p-6' 
    : 'min-h-[300px] flex flex-col items-center justify-center p-6';

  return (
    <div className={containerStyle}>
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-primary-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div>
      </div>
      
      {message && (
        <p className="mt-4 text-xs font-semibold text-secondary-500 uppercase tracking-widest animate-pulse font-sans">
          {message}
        </p>
      )}
    </div>
  );
};

export default Loading;
