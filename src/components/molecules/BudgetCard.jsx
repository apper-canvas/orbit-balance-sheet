import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/formatters";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import ProgressBar from "@/components/atoms/ProgressBar";
import Badge from "@/components/atoms/Badge";

const BudgetCard = ({ 
  budget, 
  onEdit, 
  className 
}) => {
  const getCategoryIcon = (category) => {
    const iconMap = {
      "Groceries": "ShoppingCart",
      "Transport": "Car",
      "Entertainment": "Film",
      "Utilities": "Zap",
      "Healthcare": "Heart",
      "Education": "BookOpen",
      "Dining": "Utensils",
      "Shopping": "ShoppingBag",
      "Other": "Circle"
    };
    return iconMap[category] || "Circle";
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case "exceeded": return "error";
      case "warning": return "warning";
      default: return "success";
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case "exceeded": return "Over Budget";
      case "warning": return "Near Limit";
      default: return "On Track";
    }
  };
  
  return (
    <Card className={cn("p-6", className)} hoverable>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
            <ApperIcon name={getCategoryIcon(budget.category)} size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{budget.category}</h3>
            <Badge variant={getStatusColor(budget.status)}>
              {getStatusText(budget.status)}
            </Badge>
          </div>
        </div>
        
        <button
          onClick={() => onEdit?.(budget)}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ApperIcon name="Edit2" size={18} />
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Spent</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(budget.spent)} of {formatCurrency(budget.monthlyLimit)}
          </span>
        </div>
        
        <ProgressBar 
          value={budget.spent} 
          max={budget.monthlyLimit}
          className="h-3"
        />
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            {budget.percentage.toFixed(0)}% used
          </span>
          <span className={cn(
            "font-medium",
            budget.remaining > 0 ? "text-green-600" : "text-red-600"
          )}>
            {budget.remaining > 0 
              ? `${formatCurrency(budget.remaining)} left` 
              : `${formatCurrency(Math.abs(budget.remaining))} over`
            }
          </span>
        </div>
      </div>
    </Card>
  );
};

export default BudgetCard;