import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/formatters";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";

const SummaryCard = ({ 
  title, 
  amount, 
  icon, 
  trend, 
  trendLabel, 
  variant = "default",
  className 
}) => {
  const variants = {
    default: "border-gray-200",
    income: "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50",
    expense: "border-red-200 bg-gradient-to-br from-red-50 to-rose-50",
    balance: "border-primary-200 bg-gradient-to-br from-primary-50 to-teal-50"
  };
  
  const iconVariants = {
    default: "text-gray-600",
    income: "text-green-600",
    expense: "text-red-600",
    balance: "text-primary-600"
  };
  
  const amountVariants = {
    default: "text-gray-900",
    income: "text-green-700",
    expense: "text-red-700",
    balance: "text-primary-700"
  };
  
  return (
    <Card className={cn("p-6", variants[variant], className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={cn("p-2 rounded-lg bg-white shadow-sm", iconVariants[variant])}>
            <ApperIcon name={icon} size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={cn("text-2xl font-bold", amountVariants[variant])}>
              {formatCurrency(amount)}
            </p>
          </div>
        </div>
        {trend !== undefined && (
          <div className="text-right">
            <div className={cn("flex items-center space-x-1", 
              trend >= 0 ? "text-green-600" : "text-red-600"
            )}>
              <ApperIcon 
                name={trend >= 0 ? "TrendingUp" : "TrendingDown"} 
                size={16} 
              />
              <span className="text-sm font-medium">
                {Math.abs(trend).toFixed(1)}%
              </span>
            </div>
            {trendLabel && (
              <p className="text-xs text-gray-500 mt-1">{trendLabel}</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default SummaryCard;