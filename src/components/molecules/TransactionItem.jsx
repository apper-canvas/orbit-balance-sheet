import { cn } from "@/utils/cn";
import { formatCurrency, formatShortDate } from "@/utils/formatters";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";

const TransactionItem = ({ 
  transaction, 
  onEdit, 
  onDelete, 
  showActions = true,
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
      "Salary": "DollarSign",
      "Freelance": "Laptop",
      "Investment": "TrendingUp",
      "Gift": "Gift",
      "Other": "Circle",
      "Savings": "PiggyBank"
    };
    return iconMap[category] || "Circle";
  };
  
  const getCategoryColor = (category) => {
    const colorMap = {
      "Groceries": "text-green-600 bg-green-100",
      "Transport": "text-blue-600 bg-blue-100",
      "Entertainment": "text-purple-600 bg-purple-100",
      "Utilities": "text-yellow-600 bg-yellow-100",
      "Healthcare": "text-red-600 bg-red-100",
      "Education": "text-indigo-600 bg-indigo-100",
      "Dining": "text-orange-600 bg-orange-100",
      "Shopping": "text-pink-600 bg-pink-100",
      "Salary": "text-emerald-600 bg-emerald-100",
      "Freelance": "text-teal-600 bg-teal-100",
      "Investment": "text-cyan-600 bg-cyan-100",
      "Gift": "text-rose-600 bg-rose-100",
      "Savings": "text-violet-600 bg-violet-100",
      "Other": "text-gray-600 bg-gray-100"
    };
    return colorMap[category] || "text-gray-600 bg-gray-100";
  };
  
  return (
    <div className={cn(
      "flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200",
      className
    )}>
      <div className="flex items-center space-x-4">
        <div className={cn("p-2 rounded-lg", getCategoryColor(transaction.category))}>
          <ApperIcon name={getCategoryIcon(transaction.category)} size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <p className="font-medium text-gray-900">{transaction.description}</p>
            <Badge variant={transaction.type}>
              {transaction.type}
            </Badge>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-sm text-gray-500">{transaction.category}</p>
            <span className="text-gray-300">•</span>
            <p className="text-sm text-gray-500">{formatShortDate(transaction.date)}</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <p className={cn(
          "text-lg font-semibold",
          transaction.type === "income" ? "text-green-600" : "text-red-600"
        )}>
          {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
        </p>
        
        {showActions && (
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(transaction)}
              className="p-2"
            >
              <ApperIcon name="Edit2" size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(transaction)}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <ApperIcon name="Trash2" size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionItem;