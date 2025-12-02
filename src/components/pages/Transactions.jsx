import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import TransactionItem from "@/components/molecules/TransactionItem";
import TransactionForm from "@/components/organisms/TransactionForm";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import { transactionService } from "@/services/api/transactionService";
import { categoryService } from "@/services/api/categoryService";
import { formatCurrency } from "@/utils/formatters";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    type: "",
    dateFrom: "",
    dateTo: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [transactionsData, categoriesData] = await Promise.all([
        transactionService.getAll(),
        categoryService.getAll()
      ]);
      
      setTransactions(transactionsData);
      setCategories(categoriesData);
    } catch (err) {
      setError("Failed to load transactions. Please try again.");
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSaved = async () => {
    setShowForm(false);
    setEditingTransaction(null);
    await loadData();
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDelete = async (transaction) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    
    try {
      await transactionService.delete(transaction.Id);
      toast.success("Transaction deleted successfully");
      await loadData();
    } catch (error) {
      toast.error("Failed to delete transaction");
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      type: "",
      dateFrom: "",
      dateTo: ""
    });
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = !filters.category || transaction.category === filters.category;
    const matchesType = !filters.type || transaction.type === filters.type;
    const matchesDateFrom = !filters.dateFrom || new Date(transaction.date) >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || new Date(transaction.date) <= new Date(filters.dateTo);

    return matchesSearch && matchesCategory && matchesType && matchesDateFrom && matchesDateTo;
  });

  const sortedTransactions = filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalIncome = filteredTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) return <Loading message="Loading transactions..." />;
  if (error) return <ErrorView message={error} onRetry={loadData} />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Manage and track all your financial transactions</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="mt-4 md:mt-0">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <ApperIcon name="TrendingUp" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <ApperIcon name="TrendingDown" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(totalExpenses)}</p>
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
              <p className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? "text-primary-700" : "text-red-700"}`}>
                {formatCurrency(totalIncome - totalExpenses)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filter Transactions</h3>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <ApperIcon name="RotateCcw" size={16} className="mr-2" />
            Clear Filters
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <Input
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          
          <div>
            <Select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.Id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
          
          <div>
            <Select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </Select>
          </div>
          
          <div>
            <Input
              type="date"
              placeholder="From date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
            />
          </div>
          
          <div>
            <Input
              type="date"
              placeholder="To date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Transactions List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {filteredTransactions.length === transactions.length 
              ? `All Transactions (${transactions.length})`
              : `Filtered Results (${filteredTransactions.length} of ${transactions.length})`
            }
          </h3>
        </div>

        {sortedTransactions.length > 0 ? (
          <div className="space-y-4">
            {sortedTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.Id}
                transaction={transaction}
                onEdit={handleEdit}
                onDelete={handleDelete}
                showActions={true}
              />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <Empty
            icon="Receipt"
            title="No transactions yet"
            message="Start tracking your finances by adding your first transaction."
            actionText="Add Transaction"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <Empty
            icon="Search"
            title="No transactions found"
            message="Try adjusting your filters to see more results."
            actionText="Clear Filters"
            onAction={clearFilters}
          />
        )}
      </Card>

      {/* Transaction Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md">
            <TransactionForm
              transaction={editingTransaction}
              onSave={handleFormSaved}
              onCancel={() => {
                setShowForm(false);
                setEditingTransaction(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;