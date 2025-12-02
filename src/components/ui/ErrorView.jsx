import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const ErrorView = ({ 
  title = "Something went wrong", 
  message = "We're having trouble loading your data. Please try again.", 
  onRetry, 
  showRetry = true 
}) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center max-w-md space-y-6">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <ApperIcon name="AlertCircle" size={40} />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600">{message}</p>
        </div>
        
        {showRetry && onRetry && (
          <Button onClick={onRetry} className="inline-flex items-center space-x-2">
            <ApperIcon name="RefreshCw" size={16} />
            <span>Try Again</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorView;