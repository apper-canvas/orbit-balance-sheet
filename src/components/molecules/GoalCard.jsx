import { cn } from "@/utils/cn";
import { formatCurrency, formatDate } from "@/utils/formatters";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import ProgressBar from "@/components/atoms/ProgressBar";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";

const GoalCard = ({ 
  goal, 
  onEdit, 
  onAddContribution, 
  className 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "success";
      case "close": return "warning";
      default: return "info";
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case "completed": return "Completed";
      case "close": return "Almost There";
      default: return "In Progress";
    }
  };
  
  return (
    <Card className={cn("p-6", className)} hoverable>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-lg shadow-lg">
            <ApperIcon name="Target" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
            <Badge variant={getStatusColor(goal.status)}>
              {getStatusText(goal.status)}
            </Badge>
          </div>
        </div>
        
        <button
          onClick={() => onEdit?.(goal)}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ApperIcon name="Edit2" size={18} />
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
          </span>
        </div>
        
        <ProgressBar 
          value={goal.currentAmount} 
          max={goal.targetAmount}
          variant="success"
          className="h-3"
        />
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            {goal.percentage.toFixed(0)}% complete
          </span>
          <span className="font-medium text-gray-900">
            {formatCurrency(goal.remaining)} to go
          </span>
        </div>
        
        {goal.targetDate && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <ApperIcon name="Calendar" size={16} />
            <span>Target: {formatDate(goal.targetDate)}</span>
          </div>
        )}
        
        <Button
          onClick={() => onAddContribution?.(goal)}
          className="w-full"
          size="sm"
        >
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Contribution
        </Button>
      </div>
    </Card>
  );
};

export default GoalCard;