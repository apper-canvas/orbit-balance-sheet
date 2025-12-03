import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/formatters";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";

const AccountCard = ({ 
  account, 
  onEdit, 
  onDelete,
  className 
}) => {
  const getAccountIcon = (type) => {
    switch (type) {
      case "checking": return "CreditCard";
      case "savings": return "PiggyBank";
      case "credit": return "CreditCard";
      case "investment": return "TrendingUp";
      default: return "Wallet";
    }
  };

  const getAccountTypeColor = (type) => {
    switch (type) {
      case "checking": return "bg-blue-100 text-blue-700";
      case "savings": return "bg-green-100 text-green-700";
      case "credit": return "bg-orange-100 text-orange-700";
      case "investment": return "bg-purple-100 text-purple-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getBalanceColor = (balance, type) => {
    if (type === "credit") {
      return balance < 0 ? "text-orange-600" : "text-green-600";
    }
    return balance >= 0 ? "text-green-600" : "text-red-600";
  };

  const formatAccountType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Card className={cn("p-6 card-hover", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
            <ApperIcon name={getAccountIcon(account.type)} size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
            <p className="text-sm text-gray-600">{account.bank}</p>
            <p className="text-sm text-gray-500">{account.accountNumber}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getAccountTypeColor(account.type)}>
            {formatAccountType(account.type)}
          </Badge>
          {!account.isActive && (
            <Badge variant="secondary">Inactive</Badge>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-gray-600">
            {account.type === "credit" ? "Current Balance" : "Balance"}
          </span>
          <span className={cn("text-2xl font-bold", getBalanceColor(account.balance, account.type))}>
            {formatCurrency(account.balance)}
          </span>
        </div>
        {account.type === "credit" && account.creditLimit && (
          <div className="mt-2">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-gray-600">Available Credit</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(account.creditLimit + account.balance)}
              </span>
            </div>
            <div className="mt-1 bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.max(0, Math.min(100, ((Math.abs(account.balance)) / account.creditLimit) * 100))}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>

      {account.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{account.description}</p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          Created {new Date(account.createdAt).toLocaleDateString()}
        </span>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(account)}
          >
            <ApperIcon name="Edit" size={16} className="mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(account)}
            className="text-red-600 hover:text-red-700"
          >
            <ApperIcon name="Trash2" size={16} className="mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AccountCard;