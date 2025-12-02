import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import SummaryCard from "@/components/molecules/SummaryCard";
import TransactionItem from "@/components/molecules/TransactionItem";
import ExpenseChart from "@/components/organisms/ExpenseChart";
import SpendingTrendChart from "@/components/organisms/SpendingTrendChart";
import TransactionForm from "@/components/organisms/TransactionForm";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import { transactionService } from "@/services/api/transactionService";
import { budgetService } from "@/services/api/budgetService";
import { savingsGoalService } from "@/services/api/savingsGoalService";
import { 
  calculateMonthlyTotals, 
  calculateCategoryBreakdown, 
  calculateSpendingTrend,
  calculateBudgetProgress
} from "@/utils/calculations";

const Dashboard = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [transactionsData, budgetsData, goalsData] = await Promise.all([
        transactionService.getAll(),
        budgetService.getAll(),
        savingsGoalService.getAll()
      ]);
      
      setTransactions(transactionsData);
      setBudgets(budgetsData);
      setGoals(goalsData);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSaved = async () => {
    setShowTransactionForm(false);
    await loadDashboardData();
  };

  const handleDeleteTransaction = async (transaction) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    
    try {
      await transactionService.delete(transaction.Id);
      toast.success("Transaction deleted successfully");
      await loadDashboardData();
    } catch (error) {
      toast.error("Failed to delete transaction");
    }
  };

  if (loading) return <Loading message="Loading your financial overview..." />;
  if (error) return <ErrorView message={error} onRetry={loadDashboardData} />;

  const monthlyTotals = calculateMonthlyTotals(transactions);
  const categoryBreakdown = calculateCategoryBreakdown(transactions);
  const spendingTrends = calculateSpendingTrend(transactions);
  const budgetProgress = calculateBudgetProgress(budgets, transactions);
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Calculate budget health
  const budgetHealth = budgetProgress.length > 0 
    ? budgetProgress.filter(b => b.status === "good").length / budgetProgress.length * 100
    : 100;

  // Calculate savings rate
  const savingsRate = monthlyTotals.income > 0 
    ? ((monthlyTotals.income - monthlyTotals.expenses) / monthlyTotals.income) * 100
    : 0;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your financial summary for this month.</p>
        </div>
        <Button onClick={() => setShowTransactionForm(true)} className="mt-4 md:mt-0">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Income"
          amount={monthlyTotals.income}
          icon="TrendingUp"
          variant="income"
          trend={spendingTrends.length > 1 ? 
            ((spendingTrends[spendingTrends.length - 1].income - spendingTrends[spendingTrends.length - 2].income) / spendingTrends[spendingTrends.length - 2].income) * 100 
            : 0}
          trendLabel="vs last month"
        />
        <SummaryCard
          title="Total Expenses"
          amount={monthlyTotals.expenses}
          icon="TrendingDown"
          variant="expense"
          trend={spendingTrends.length > 1 ? 
            ((spendingTrends[spendingTrends.length - 1].expenses - spendingTrends[spendingTrends.length - 2].expenses) / spendingTrends[spendingTrends.length - 2].expenses) * 100 
            : 0}
          trendLabel="vs last month"
        />
        <SummaryCard
          title="Net Balance"
          amount={monthlyTotals.balance}
          icon="Wallet"
          variant="balance"
          trend={savingsRate}
          trendLabel="savings rate"
        />
        <SummaryCard
          title="Budget Health"
          amount={budgetHealth}
          icon="Target"
          variant="default"
          trend={budgetHealth >= 60 ? 5 : -10}
          trendLabel="% on track"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseChart 
          data={categoryBreakdown} 
          title="Expense Breakdown"
        />
        <SpendingTrendChart 
          data={spendingTrends} 
          title="6-Month Spending Trend"
        />
      </div>

      {/* Recent Transactions & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/transactions")}
                >
                  View All
                  <ApperIcon name="ArrowRight" size={16} className="ml-2" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              {recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <TransactionItem
                      key={transaction.Id}
                      transaction={transaction}
                      onDelete={handleDeleteTransaction}
                      showActions={false}
                    />
                  ))}
                </div>
              ) : (
                <Empty
                  icon="Receipt"
                  title="No transactions yet"
                  message="Start tracking your finances by adding your first transaction."
                  actionText="Add Transaction"
                  onAction={() => setShowTransactionForm(true)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Budgets</span>
                <span className="font-semibold text-gray-900">{budgets.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Savings Goals</span>
                <span className="font-semibold text-gray-900">{goals.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Transactions</span>
                <span className="font-semibold text-gray-900">{monthlyTotals.transactions.length}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/budgets")}
              >
                <ApperIcon name="PieChart" size={16} className="mr-2" />
                Manage Budgets
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/goals")}
              >
                <ApperIcon name="Target" size={16} className="mr-2" />
                View Goals
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/reports")}
              >
                <ApperIcon name="BarChart3" size={16} className="mr-2" />
                View Reports
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md">
            <TransactionForm
              onSave={handleTransactionSaved}
              onCancel={() => setShowTransactionForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;