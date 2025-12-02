import { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import ApperIcon from '@/components/ApperIcon';

const Alert = forwardRef(({ 
  variant = "info", 
  icon, 
  title, 
  description, 
  className,
  children,
  onClose,
  ...props 
}, ref) => {
  const variants = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800", 
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    error: "bg-red-50 border-red-200 text-red-800"
  };

  const iconVariants = {
    info: "text-blue-600",
    success: "text-green-600",
    warning: "text-yellow-600", 
    error: "text-red-600"
  };

  const defaultIcons = {
    info: "Info",
    success: "CheckCircle",
    warning: "AlertTriangle",
    error: "AlertCircle"
  };

  return (
    <div
      ref={ref}
      className={cn(
        "border rounded-lg p-4 transition-all duration-200",
        variants[variant],
        className
      )}
      {...props}
    >
      <div className="flex items-start space-x-3">
        {(icon !== false) && (
          <div className={cn("flex-shrink-0 mt-0.5", iconVariants[variant])}>
            <ApperIcon 
              name={icon || defaultIcons[variant]} 
              size={20}
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-medium text-sm mb-1">
              {title}
            </div>
          )}
          
          {(description || children) && (
            <div className="text-sm">
              {description || children}
            </div>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              "flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors",
              iconVariants[variant]
            )}
          >
            <ApperIcon name="X" size={16} />
          </button>
        )}
      </div>
    </div>
  );
});

Alert.displayName = "Alert";

export default Alert;