import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { transactionService } from "@/services/api/transactionService";
import { savingsGoalService } from "@/services/api/savingsGoalService";
import { budgetService } from "@/services/api/budgetService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import ExpenseChart from "@/components/organisms/ExpenseChart";
import SpendingTrendChart from "@/components/organisms/SpendingTrendChart";
import Goals from "@/components/pages/Goals";
import Settings from "@/components/pages/Settings";
import Budgets from "@/components/pages/Budgets";
import { formatCurrency, getCurrentMonth, getMonthName } from "@/utils/formatters";
import { calculateBudgetProgress, calculateCategoryBreakdown, calculateMonthlyTotals, calculateSavingsProgress, calculateSpendingTrend } from "@/utils/calculations";

const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth().month);
  const [selectedYear, setSelectedYear] = useState(getCurrentMonth().year);
  const [reportType, setReportType] = useState("monthly");

  // Load all data for comprehensive reports
  const loadReportsData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [transactionData, goalsData, budgetData] = await Promise.all([
        transactionService.getAll(),
        savingsGoalService.getAll(),
        budgetService.getAll()
      ]);
      
      setTransactions(transactionData);
      setSavingsGoals(goalsData);
      setBudgets(budgetData);
    } catch (error) {
      console.error('Error loading reports data:', error);
      setError("Failed to load reports data. Please try again.");
      toast.error("Failed to load reports data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportsData();
  }, []);

  // Export report data
  const exportData = () => {
    const reportData = getReportData();
    const exportContent = {
      reportType,
      period: reportType === "monthly" 
        ? `${getMonthName(selectedMonth)} ${selectedYear}` 
        : selectedYear.toString(),
      summary: reportData.monthlyTotals,
      categoryBreakdown: reportData.categoryBreakdown,
      insights: getEnhancedInsights(),
      generatedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportContent, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `financial-report-${reportType}-${selectedYear}${reportType === 'monthly' ? `-${selectedMonth + 1}` : ''}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success("Report exported successfully");
  };

  if (loading) return <Loading message="Loading financial reports..." />;
  
  if (error) {
    return (
      <ErrorView 
        title="Reports Error"
        message={error}
        onRetry={loadReportsData}
      />
    );
  }

  if (transactions.length === 0) {
    return (
      <Empty 
        icon="BarChart3"
        title="No Transaction Data"
        message="Add some transactions to generate financial reports and insights."
        action={{ label: "Add Transaction", href: "/transactions" }}
      />
/>
    );
  }

  const getReportData = () => {
if (reportType === "monthly") {
      const monthlyTotals = calculateMonthlyTotals(transactions, selectedMonth, selectedYear);
      const categoryBreakdown = calculateCategoryBreakdown(transactions, selectedMonth, selectedYear);
      return {
        monthlyTotals,
        categoryBreakdown,
        spendingTrends: calculateSpendingTrend(transactions, 6),
        goalProgress: calculateSavingsProgress(savingsGoals, transactions),
        budgetPerformance: calculateBudgetProgress(budgets, transactions, selectedMonth, selectedYear)
      };
    } else {
      // Annual report
      const annualTransactions = transactions.filter(t => 
        new Date(t.date).getFullYear() === selectedYear
      );
      const annualTotals = {
        income: annualTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0),
        expenses: annualTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
        transactions: annualTransactions
      };
      annualTotals.balance = annualTotals.income - annualTotals.expenses;
      
      const categoryBreakdown = annualTransactions
        .filter(t => t.type === "expense")
        .reduce((acc, t) => {
          if (!acc[t.category]) {
            acc[t.category] = { amount: 0, count: 0 };
          }
          acc[t.category].amount += t.amount;
          acc[t.category].count += 1;
          return acc;
        }, {});
      
      const totalExpenses = Object.values(categoryBreakdown).reduce((sum, cat) => sum + cat.amount, 0);
      const formattedBreakdown = Object.entries(categoryBreakdown).map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0
      })).sort((a, b) => b.amount - a.amount);
      
      return {
        monthlyTotals: annualTotals,
        categoryBreakdown: formattedBreakdown,
        spendingTrends: calculateSpendingTrend(transactions, 12),
        goalProgress: calculateSavingsProgress(savingsGoals, transactions),
        budgetPerformance: calculateBudgetProgress(budgets, transactions, null, selectedYear)
      };
    }
};

  const reportData = getReportData();
  const { monthlyTotals, categoryBreakdown, spendingTrends, goalProgress, budgetPerformance } = reportData;

  // Get available years from transactions
  const availableYears = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))].sort((a, b) => b - a);

  // Enhanced insights calculations
  const getEnhancedInsights = () => {
    const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;
    const averageTransaction = monthlyTotals.transactions.length > 0 
      ? monthlyTotals.expenses / monthlyTotals.transactions.filter(t => t.type === "expense").length 
      : 0;
    const savingsRate = monthlyTotals.income > 0 ? (monthlyTotals.balance / monthlyTotals.income) * 100 : 0;
    
    // Financial health scoring (0-100)
    const financialHealthScore = Math.min(100, Math.max(0, 
      (savingsRate > 0 ? 25 : 0) + // Positive savings rate: 25 points
      (savingsRate >= 20 ? 25 : savingsRate * 1.25) + // High savings rate: up to 25 points
      (budgetPerformance.length > 0 ? 25 : 0) + // Has budgets: 25 points
      (goalProgress.length > 0 ? 25 : 0) // Has goals: 25 points
    ));
    
    return {
      topCategory,
      averageTransaction,
      savingsRate,
      financialHealthScore,
      recommendations: generateRecommendations(savingsRate, topCategory, budgetPerformance)
    };
  };

  // Generate personalized recommendations
  const generateRecommendations = (savingsRate, topCategory, budgetPerformance) => {
    const recommendations = [];
    
    if (savingsRate < 10) {
      recommendations.push({
        type: "savings",
        priority: "high",
        title: "Increase Your Savings Rate",
        message: "Aim to save at least 10-20% of your income for better financial security."
      });
    }
    
    if (topCategory && topCategory.percentage > 40) {
      recommendations.push({
        type: "spending",
        priority: "medium",
        title: `Review ${topCategory.category} Spending`,
        message: `${topCategory.category} accounts for ${topCategory.percentage.toFixed(1)}% of your expenses. Consider ways to optimize this category.`
      });
    }
    
    if (budgetPerformance.some(b => b.percentage > 100)) {
      recommendations.push({
        type: "budget",
        priority: "high",
        title: "Budget Overspending Alert",
        message: "You've exceeded your budget in some categories. Review and adjust your spending patterns."
      });
    }
    
    if (goalProgress.some(g => g.monthsToGoal > 24)) {
      recommendations.push({
        type: "goals",
        priority: "medium",
        title: "Accelerate Goal Progress",
        message: "Some savings goals may take longer than expected. Consider increasing monthly contributions."
      });
    }
    
    return recommendations;
  };

  const insights = getEnhancedInsights();
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive analysis with personalized insights</p>
        </div>
        <Button onClick={exportData} className="mt-4 md:mt-0">
          <ApperIcon name="Download" size={16} className="mr-2" />
          Export Report
        </Button>
      </div>

      {/* Report Controls */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 md:mb-0">Report Settings</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="monthly">Monthly Report</option>
              <option value="annual">Annual Report</option>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Select>
          </div>
          
          {reportType === "monthly" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>{getMonthName(i)}</option>
                ))}
              </Select>
            </div>
          )}
        </div>
      </Card>
</Card>

      </Card>
{/* Report Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <ApperIcon name="TrendingUp" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                {reportType === "monthly" ? "Monthly Income" : "Annual Income"}
              </p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(monthlyTotals.income)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <ApperIcon name="TrendingDown" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                {reportType === "monthly" ? "Monthly Expenses" : "Annual Expenses"}
              </p>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(monthlyTotals.expenses)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-primary-50 to-teal-50 border-primary-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
              <ApperIcon name="Wallet" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Net Balance</p>
              <p className={`text-2xl font-bold ${monthlyTotals.balance >= 0 ? "text-primary-700" : "text-red-700"}`}>
                {formatCurrency(monthlyTotals.balance)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <ApperIcon name="Activity" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Financial Health</p>
              <p className={`text-2xl font-bold ${
                insights.financialHealthScore >= 70 ? "text-green-700" : 
                insights.financialHealthScore >= 40 ? "text-yellow-600" : "text-red-700"
              }`}>
                {Math.round(insights.financialHealthScore)}/100
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseChart 
          data={categoryBreakdown} 
          title={`${reportType === "monthly" ? "Monthly" : "Annual"} Expense Breakdown`}
        />
        <SpendingTrendChart 
          data={spendingTrends} 
          title={`${reportType === "monthly" ? "6-Month" : "12-Month"} Spending Trends`}
        />
      </div>
</div>
{/* Enhanced Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Insights */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h3>
          <div className="space-y-4">
            {insights.topCategory && (
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-primary-50 to-teal-50 rounded-lg">
                <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                  <ApperIcon name="TrendingUp" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Top Spending Category</p>
                  <p className="text-sm text-gray-600">
                    {insights.topCategory.category} - {formatCurrency(insights.topCategory.amount)} ({insights.topCategory.percentage.toFixed(1)}%)
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <ApperIcon name="Calculator" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Average Transaction</p>
                <p className="text-sm text-gray-600">
                  {formatCurrency(insights.averageTransaction)} per expense transaction
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <ApperIcon name="Percent" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Savings Rate</p>
                <p className="text-sm text-gray-600">
                  {insights.savingsRate.toFixed(1)}% of income saved
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <ApperIcon name="Receipt" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Transaction Volume</p>
                <p className="text-sm text-gray-600">
                  {monthlyTotals.transactions.length} transactions this {reportType === "monthly" ? "month" : "year"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Personalized Recommendations */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personalized Recommendations</h3>
          <div className="space-y-3">
            {insights.recommendations.length > 0 ? insights.recommendations.map((rec, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                rec.priority === 'high' ? 'bg-red-50 border-red-500' :
                rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                'bg-blue-50 border-blue-500'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className={`p-1 rounded ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-600' :
                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <ApperIcon name={
                      rec.type === 'savings' ? 'PiggyBank' :
                      rec.type === 'spending' ? 'TrendingDown' :
                      rec.type === 'budget' ? 'AlertTriangle' :
                      'Target'
                    } size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{rec.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{rec.message}</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <ApperIcon name="CheckCircle" size={48} className="mx-auto mb-3 text-green-500" />
                <p className="font-medium">Great job!</p>
                <p className="text-sm">Your finances look healthy. Keep up the good work!</p>
              </div>
            )}
          </div>
        </Card>

        {/* Goals & Budget Progress */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Tracking</h3>
          
          {/* Savings Goals Progress */}
          {goalProgress.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Savings Goals</h4>
              <div className="space-y-3">
                {goalProgress.slice(0, 3).map((goal, index) => (
                  <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">{goal.title}</span>
                      <span className="text-xs text-gray-600">{goal.percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, goal.percentage)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {formatCurrency(goal.savedAmount)} saved
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatCurrency(goal.targetAmount)} goal
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Budget Performance */}
          {budgetPerformance.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Budget Performance</h4>
              <div className="space-y-3">
                {budgetPerformance.slice(0, 3).map((budget, index) => (
                  <div key={index} className={`p-3 rounded-lg ${
                    budget.percentage <= 75 ? 'bg-gradient-to-r from-green-50 to-emerald-50' :
                    budget.percentage <= 100 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' :
                    'bg-gradient-to-r from-red-50 to-rose-50'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">{budget.category}</span>
                      <span className={`text-xs font-medium ${
                        budget.percentage <= 75 ? 'text-green-600' :
                        budget.percentage <= 100 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>{budget.percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          budget.percentage <= 75 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          budget.percentage <= 100 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                          'bg-gradient-to-r from-red-500 to-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, budget.percentage)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {formatCurrency(budget.spent)} spent
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatCurrency(budget.budgetAmount)} budgeted
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {goalProgress.length === 0 && budgetPerformance.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <ApperIcon name="Target" size={48} className="mx-auto mb-3" />
              <p className="font-medium">No Goals or Budgets</p>
              <p className="text-sm">Set up savings goals and budgets to track your progress here.</p>
            </div>
          )}
</Card>
      </div>

      {/* Category Details */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
          {categoryBreakdown.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {categoryBreakdown.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{category.category}</p>
                      <p className="text-sm text-gray-600">{category.count} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(category.amount)}</p>
                    <p className="text-sm text-gray-600">{category.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No expense data available for the selected period</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Reports;