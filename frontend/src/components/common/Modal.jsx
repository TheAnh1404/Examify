import { useEffect, useId } from 'react';
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
  const titleId = useId();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && closeOnBackdrop) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeOnBackdrop, onClose]);

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
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity animate-fade-in" 
        onClick={() => closeOnBackdrop && onClose()}
      />
      
      {/* Modal Content Pane */}
      <div
        className={`w-full bg-white border border-secondary-100 rounded-[2rem] shadow-2xl z-10 animate-fade-in relative flex flex-col max-h-[90vh] ${sizes[size]}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {/* Modal Header */}
        <div className="px-10 py-8 border-b border-secondary-50 flex items-center justify-between shrink-0">
          <h3 id={titleId} className="font-extrabold text-2xl text-secondary-900 tracking-tight">
            {title}
          </h3>
          
          <button 
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="p-2.5 rounded-2xl text-secondary-300 hover:text-secondary-600 hover:bg-secondary-50 transition-all border border-transparent hover:border-secondary-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="px-10 py-8 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="px-10 py-6 bg-secondary-50/30 border-t border-secondary-50 rounded-b-[2rem]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
