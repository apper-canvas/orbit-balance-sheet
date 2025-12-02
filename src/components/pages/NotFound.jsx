import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md space-y-8">
        <div className="space-y-4">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
            <ApperIcon name="Search" size={48} />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">404</h1>
            <h2 className="text-2xl font-semibold text-gray-800">Page Not Found</h2>
            <p className="text-gray-600">
              Sorry, the page you're looking for doesn't exist or has been moved.
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={() => navigate("")} 
            className="inline-flex items-center space-x-2"
          >
            <ApperIcon name="Home" size={16} />
            <span>Back to Dashboard</span>
          </Button>
          
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <button
              onClick={() => navigate("transactions")}
              className="hover:text-primary-600 transition-colors"
            >
              Transactions
            </button>
            <span>•</span>
            <button
              onClick={() => navigate("budgets")}
              className="hover:text-primary-600 transition-colors"
            >
              Budgets
            </button>
            <span>•</span>
            <button
              onClick={() => navigate("goals")}
              className="hover:text-primary-600 transition-colors"
            >
              Goals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;