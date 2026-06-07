import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  closeOnBackdrop = true,
  footer
}) => {
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
        className="absolute inset-0 bg-secondary-900/60 backdrop-blur-sm transition-opacity animate-fade-in" 
        onClick={() => closeOnBackdrop && onClose()}
      />
      
      {/* Modal Content Pane */}
      <div className={`w-full bg-white border border-secondary-200 rounded-2xl shadow-2xl z-10 animate-fade-in relative flex flex-col max-h-[90vh] ${sizes[size]}`}>
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-secondary-100 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-lg text-secondary-900 tracking-tight">
            {title}
          </h3>
          
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="px-6 py-4 bg-secondary-50/50 border-t border-secondary-100 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
