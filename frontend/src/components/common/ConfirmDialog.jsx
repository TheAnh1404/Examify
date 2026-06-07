import React from 'react';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'warning' | 'primary' | 'success'
  loading = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'danger': return <AlertTriangle className="h-6 w-6 text-danger-600" />;
      case 'warning': return <AlertTriangle className="h-6 w-6 text-warning-600" />;
      case 'success': return <CheckCircle2 className="h-6 w-6 text-accent-600" />;
      case 'primary':
      default:
        return <Info className="h-6 w-6 text-primary-600" />;
    }
  };

  const getIconContainerColor = () => {
    switch (type) {
      case 'danger': return 'bg-danger-50 border-danger-100';
      case 'warning': return 'bg-warning-50 border-warning-100';
      case 'success': return 'bg-accent-50 border-accent-100';
      case 'primary':
      default:
        return 'bg-primary-50 border-primary-100';
    }
  };

  const getConfirmVariant = () => {
    if (type === 'danger') return 'danger';
    if (type === 'success') return 'success';
    return 'primary';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" closeOnBackdrop={!loading}>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className={`h-12 w-12 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${getIconContainerColor()}`}>
            {getIcon()}
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary-600 leading-relaxed font-medium mt-1">
              {message}
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            size="md"
            className="px-6"
          >
            {cancelText}
          </Button>
          
          <Button
            variant={getConfirmVariant()}
            onClick={onConfirm}
            loading={loading}
            size="md"
            className="px-6"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
