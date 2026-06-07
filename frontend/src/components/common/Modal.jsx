import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  closeOnBackdrop = true
}) => {
  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-secondary-900/60 backdrop-blur-sm" 
        onClick={() => closeOnBackdrop && onClose()}
      />
      
      {/* Modal Content Pane */}
      <div className={`w-full bg-white border border-secondary-200 rounded-xl shadow-xl z-10 animate-slide-up relative flex flex-col max-h-[90vh] ${sizes[size]}`}>
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-secondary-200 flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-lg text-secondary-800 tracking-tight">
            {title}
          </h3>
          
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-secondary-400 hover:text-secondary-650 hover:bg-secondary-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
