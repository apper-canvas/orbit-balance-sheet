import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { budgetService } from "@/services/api/budgetService";
import { transactionService } from "@/services/api/transactionService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Alert from "@/components/atoms/Alert";
import BudgetForm from "@/components/organisms/BudgetForm";
import BudgetCard from "@/components/molecules/BudgetCard";
import { calculateBudgetProgress } from "@/utils/calculations";

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
// Calculate budgets with progress once budgets and transactions are loaded
  const budgetsWithProgress = budgets.length > 0 && transactions.length > 0 
    ? calculateBudgetProgress(budgets, transactions) 
    : [];

  // Calculate totals
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgetsWithProgress.reduce((sum, budget) => sum + budget.spent, 0);
  const overBudgetCount = budgetsWithProgress.filter(b => b.status === "exceeded").length;
  const warningBudgetCount = budgetsWithProgress.filter(b => b.status === "warning").length;
  const alertBudgetCount = overBudgetCount + warningBudgetCount;

  useEffect(() => {
    loadData();
  }, []);

  // Check for budget alerts when data changes
  useEffect(() => {
    if (budgetsWithProgress.length > 0) {
      const criticalBudgets = budgetsWithProgress.filter(b => b.status === "exceeded");
      const warningBudgets = budgetsWithProgress.filter(b => b.status === "warning");
      
      // Show toast notifications for new critical alerts
      criticalBudgets.forEach(budget => {
        if (budget.percentage > 100) {
          toast.error(`Budget Alert: ${budget.category} is ${Math.round(budget.percentage)}% over budget!`);
        }
      });
    }
  }, [budgetsWithProgress]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [budgetsData, transactionsData] = await Promise.all([
        budgetService.getAll(),
        transactionService.getAll()
      ]);
      
      setBudgets(budgetsData);
      setTransactions(transactionsData);
    } catch (err) {
      setError("Failed to load budgets. Please try again.");
      toast.error("Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSaved = async () => {
    setShowForm(false);
    setEditingBudget(null);
    await loadData();
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleDelete = async (budget) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;
    
    try {
      await budgetService.delete(budget.Id);
      toast.success("Budget deleted successfully");
      await loadData();
    } catch (error) {
      toast.error("Failed to delete budget");
    }
  };

  if (loading) return <Loading message="Loading budgets..." />;
  if (error) return <ErrorView message={error} onRetry={loadData} />;

return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
          <p className="text-gray-600 mt-1">Set and track your spending limits by category</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="mt-4 md:mt-0">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Create Budget
        </Button>
      </div>

      {/* Budget Overview */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                <ApperIcon name="Target" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">${totalBudget.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <ApperIcon name="TrendingUp" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">${totalSpent.toLocaleString()}</p>
                <p className="text-sm text-gray-500">
                  {totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(1)}% of budget` : "0% of budget"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${overBudgetCount > 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                <ApperIcon name={overBudgetCount > 0 ? "AlertTriangle" : "CheckCircle"} size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Status</p>
                <p className={`text-2xl font-bold ${overBudgetCount > 0 ? "text-red-700" : "text-green-700"}`}>
                  {overBudgetCount === 0 ? "On Track" : `${overBudgetCount} Over`}
                </p>
                <p className="text-sm text-gray-500">
                  {budgets.length - overBudgetCount} of {budgets.length} budgets healthy
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
{/* Budget Alerts */}
      {alertBudgetCount > 0 && (
        <div className="mb-6">
          {overBudgetCount > 0 && (
            <Alert 
              variant="error" 
              icon="AlertTriangle"
              title="Budget Alert: Critical"
              description={`${overBudgetCount} ${overBudgetCount === 1 ? 'budget has' : 'budgets have'} exceeded their limits. Review your spending to get back on track.`}
              className="mb-3"
            />
          )}
          
          {warningBudgetCount > 0 && (
            <Alert 
              variant="warning" 
              icon="AlertCircle"
              title="Budget Warning"
              description={`${warningBudgetCount} ${warningBudgetCount === 1 ? 'budget is' : 'budgets are'} approaching their limits (80%+). Consider reducing spending in these categories.`}
            />
          )}
        </div>
      )}

      {/* Budget Cards */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Your Budgets</h3>
          {budgets.length > 0 && (
            <div className="flex items-center space-x-4">
              {alertBudgetCount > 0 && (
                <div className="flex items-center space-x-1 text-sm font-medium text-red-600">
                  <ApperIcon name="AlertTriangle" size={16} />
                  <span>{alertBudgetCount} need attention</span>
                </div>
              )}
              <div className="text-sm text-gray-600">
                {budgets.length} {budgets.length === 1 ? "budget" : "budgets"} active
              </div>
            </div>
          )}
        </div>

        {budgetsWithProgress.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgetsWithProgress.map((budget) => (
              <div key={budget.Id} className="relative group">
                <BudgetCard budget={budget} onEdit={handleEdit} />
                <button
                  onClick={() => handleDelete(budget)}
                  className="absolute top-4 right-12 p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <ApperIcon name="Trash2" size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            icon="PieChart"
            title="No budgets yet"
            message="Create your first budget to start tracking your spending limits."
            actionText="Create Budget"
            onAction={() => setShowForm(true)}
          />
        )}
      </div>

      {/* Budget Tips */}
      {budgets.length > 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-teal-50 rounded-xl p-6 border border-primary-100">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
              <ApperIcon name="Lightbulb" size={20} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Budget Tips</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Review your budgets monthly and adjust based on spending patterns</li>
                <li>• Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings</li>
                <li>• Set up alerts when you're approaching 80% of your budget limit</li>
                <li>• Track your progress weekly to stay on course</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Budget Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md">
            <BudgetForm
              budget={editingBudget}
              onSave={handleFormSaved}
              onCancel={() => {
                setShowForm(false);
                setEditingBudget(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;