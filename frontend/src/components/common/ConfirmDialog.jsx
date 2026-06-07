import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone. Please confirm to proceed.',
  confirmText = 'Yes, Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'warning' | 'primary'
  loading = false
}) => {
  const getIconColor = () => {
    switch (type) {
      case 'danger': return 'text-red-500 bg-red-50 border-red-100';
      case 'warning': return 'text-amber-500 bg-amber-50 border-amber-100';
      case 'primary':
      default:
        return 'text-primary-600 bg-primary-50 border-primary-100';
    }
  };

  const getConfirmVariant = () => {
    if (type === 'danger') return 'danger';
    if (type === 'warning') return 'success'; // emerald theme for confirmations
    return 'primary';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" closeOnBackdrop={!loading}>
      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <div className={`h-11 w-11 rounded-lg border flex items-center justify-center shrink-0 shadow-sm ${getIconColor()}`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-secondary-600 leading-relaxed font-medium">
              {message}
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-secondary-200 justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            size="sm"
          >
            {cancelText}
          </Button>
          
          <Button
            variant={getConfirmVariant()}
            onClick={onConfirm}
            loading={loading}
            size="sm"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
