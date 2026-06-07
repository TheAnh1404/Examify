import React from 'react';

const Logo = ({ className = 'h-8 w-8', ...props }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={`${className} select-none shrink-0`} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Background rectangle from the original design */}
      <rect width="100" height="100" rx="22" fill="#6366F1" />
      
      {/* White Bold E */}
      <path 
        d="M 28 28 H 68 V 38 H 42 V 45 H 60 V 55 H 42 V 62 H 68 V 72 H 28 Z" 
        fill="white" 
      />
      
      {/* Emerald Checkmark */}
      <path 
        d="M 52 65 L 66 79 L 88 50" 
        stroke="#10B981" 
        strokeWidth="11" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
};

export default Logo;
