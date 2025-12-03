import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import AccountCard from "@/components/molecules/AccountCard";
import AccountForm from "@/components/organisms/AccountForm";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import { accountService } from "@/services/api/accountService";
import { formatCurrency } from "@/utils/formatters";

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    status: "all"
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await accountService.getAll();
      setAccounts(data);
    } catch (err) {
      setError("Failed to load accounts. Please try again.");
      toast.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSaved = async () => {
    setShowForm(false);
    setEditingAccount(null);
    await loadAccounts();
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleDelete = async (account) => {
    if (!confirm(`Are you sure you want to delete "${account.name}"? This action cannot be undone.`)) return;
    
    try {
      await accountService.delete(account.Id);
      toast.success("Account deleted successfully");
      await loadAccounts();
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      type: "",
      status: "all"
    });
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         account.bank.toLowerCase().includes(filters.search.toLowerCase()) ||
                         account.accountNumber.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = !filters.type || account.type === filters.type;
    const matchesStatus = filters.status === "all" || 
                         (filters.status === "active" && account.isActive) ||
                         (filters.status === "inactive" && !account.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  const sortedAccounts = filteredAccounts.sort((a, b) => a.name.localeCompare(b.name));

  // Calculate summary statistics
  const totalBalance = accounts
    .filter(account => account.type !== "credit")
    .reduce((sum, account) => sum + account.balance, 0);

  const totalDebt = accounts
    .filter(account => account.type === "credit" && account.balance < 0)
    .reduce((sum, account) => sum + Math.abs(account.balance), 0);

  const netWorth = totalBalance - totalDebt;

  const accountsByType = accounts.reduce((acc, account) => {
    acc[account.type] = (acc[account.type] || 0) + 1;
    return acc;
  }, {});

  if (loading) return <Loading message="Loading accounts..." />;
  if (error) return <ErrorView message={error} onRetry={loadAccounts} />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-600 mt-1">Manage your financial accounts and track balances</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="mt-4 md:mt-0">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Account
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <ApperIcon name="TrendingUp" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(totalBalance)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <ApperIcon name="TrendingDown" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Debt</p>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(totalDebt)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-primary-50 to-teal-50 border-primary-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
              <ApperIcon name="Wallet" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Net Worth</p>
              <p className={`text-2xl font-bold ${netWorth >= 0 ? "text-primary-700" : "text-red-700"}`}>
                {formatCurrency(netWorth)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <ApperIcon name="CreditCard" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Accounts</p>
              <p className="text-2xl font-bold text-blue-700">{accounts.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filter Accounts</h3>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <ApperIcon name="RotateCcw" size={16} className="mr-2" />
            Clear Filters
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              placeholder="Search accounts..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          
          <div>
            <Select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
            >
              <option value="">All Types</option>
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="credit">Credit Card</option>
              <option value="investment">Investment</option>
            </Select>
          </div>
          
          <div>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Accounts Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {filteredAccounts.length === accounts.length 
              ? `All Accounts (${accounts.length})`
              : `Filtered Results (${filteredAccounts.length} of ${accounts.length})`
            }
          </h3>
          {Object.keys(accountsByType).length > 0 && (
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {Object.entries(accountsByType).map(([type, count]) => (
                <span key={type} className="capitalize">
                  {type}: {count}
                </span>
              ))}
            </div>
          )}
        </div>

        {sortedAccounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAccounts.map((account) => (
              <AccountCard
                key={account.Id}
                account={account}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <Empty
            icon="CreditCard"
            title="No accounts yet"
            message="Start managing your finances by adding your first account."
            actionText="Add Account"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <Empty
            icon="Search"
            title="No accounts found"
            message="Try adjusting your filters to see more results."
            actionText="Clear Filters"
            onAction={clearFilters}
          />
        )}
      </div>

      {/* Account Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <AccountForm
              account={editingAccount}
              onSave={handleFormSaved}
              onCancel={() => {
                setShowForm(false);
                setEditingAccount(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;