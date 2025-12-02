import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import ExpenseChart from "@/components/organisms/ExpenseChart";
import SpendingTrendChart from "@/components/organisms/SpendingTrendChart";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import { transactionService } from "@/services/api/transactionService";
import { 
  calculateCategoryBreakdown, 
  calculateSpendingTrend, 
  calculateMonthlyTotals 
} from "@/utils/calculations";
import { formatCurrency, getMonthName, getCurrentMonth } from "@/utils/formatters";

const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth().month);
  const [selectedYear, setSelectedYear] = useState(getCurrentMonth().year);
  const [reportType, setReportType] = useState("monthly");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (err) {
      setError("Failed to load reports data. Please try again.");
      toast.error("Failed to load reports data");
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const data = getReportData();
    const csvContent = generateCSV(data);
    downloadCSV(csvContent, `financial-report-${reportType}-${selectedYear}-${selectedMonth + 1}.csv`);
    toast.success("Report exported successfully");
  };

  const generateCSV = (data) => {
    const headers = ["Category", "Amount", "Percentage", "Count"];
    const csvRows = [headers.join(",")];
    
    data.categoryBreakdown.forEach(item => {
      const row = [
        item.category,
        item.amount.toFixed(2),
        item.percentage.toFixed(1) + "%",
        item.count
      ];
      csvRows.push(row.join(","));
    });
    
    return csvRows.join("\n");
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getReportData = () => {
    if (reportType === "monthly") {
      const monthlyTotals = calculateMonthlyTotals(transactions, selectedMonth, selectedYear);
      const categoryBreakdown = calculateCategoryBreakdown(transactions, selectedMonth, selectedYear);
      return {
        monthlyTotals,
        categoryBreakdown,
        spendingTrends: calculateSpendingTrend(transactions, 6)
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
        spendingTrends: calculateSpendingTrend(transactions, 12)
      };
    }
  };

  if (loading) return <Loading message="Loading reports..." />;
  if (error) return <ErrorView message={error} onRetry={loadData} />;

  if (transactions.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
            <p className="text-gray-600 mt-1">Analyze your spending patterns and trends</p>
          </div>
        </div>
        <Empty
          icon="BarChart3"
          title="No data for reports"
          message="Add some transactions to see your financial reports and insights."
        />
      </div>
    );
  }

  const reportData = getReportData();
  const { monthlyTotals, categoryBreakdown, spendingTrends } = reportData;

  // Get available years from transactions
  const availableYears = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))].sort((a, b) => b - a);

  // Calculate insights
  const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;
  const averageTransaction = monthlyTotals.transactions.length > 0 
    ? monthlyTotals.expenses / monthlyTotals.transactions.filter(t => t.type === "expense").length 
    : 0;

  const savingsRate = monthlyTotals.income > 0 ? (monthlyTotals.balance / monthlyTotals.income) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600 mt-1">Analyze your spending patterns and trends</p>
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

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <ApperIcon name="Percent" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Savings Rate</p>
              <p className={`text-2xl font-bold ${savingsRate >= 0 ? "text-blue-700" : "text-red-700"}`}>
                {savingsRate.toFixed(1)}%
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

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Insights */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
          <div className="space-y-4">
            {topCategory && (
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-primary-50 to-teal-50 rounded-lg">
                <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                  <ApperIcon name="TrendingUp" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Top Spending Category</p>
                  <p className="text-sm text-gray-600">
                    {topCategory.category} - {formatCurrency(topCategory.amount)} ({topCategory.percentage.toFixed(1)}%)
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
                  {formatCurrency(averageTransaction)} per expense transaction
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
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

        {/* Category Details */}
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