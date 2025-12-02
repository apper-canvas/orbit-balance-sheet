import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Empty = ({ 
  icon = "FileX", 
  title = "No data available", 
  message = "Get started by adding your first item.", 
  actionText, 
  onAction 
}) => {
  return (
    <div className="min-h-[300px] flex items-center justify-center p-8">
      <div className="text-center max-w-md space-y-6">
        <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
          <ApperIcon name={icon} size={40} />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600">{message}</p>
        </div>
        
        {actionText && onAction && (
          <Button onClick={onAction} className="inline-flex items-center space-x-2">
            <ApperIcon name="Plus" size={16} />
            <span>{actionText}</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default Empty;