import { HelpCircle } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  title = 'Không tìm thấy dữ liệu',
  description = 'Hiện chưa có mục nào trong danh mục này.',
  icon: Icon,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div className={`saas-card p-12 text-center flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto border-dashed border-2 border-secondary-305 bg-white ${className}`}>
      <div className="h-16 w-16 rounded-full bg-secondary-50 border border-secondary-200 flex items-center justify-center text-secondary-400 shadow-sm shrink-0 mb-2">
        {Icon ? <Icon className="h-8 w-8" /> : <HelpCircle className="h-8 w-8" />}
      </div>
      
      <div className="space-y-1">
        <h4 className="font-semibold text-lg text-secondary-800 tracking-tight">{title}</h4>
        <p className="text-sm text-secondary-500 max-w-sm mx-auto leading-relaxed">{description}</p>
      </div>
      
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary" size="sm" className="mt-2.5">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
