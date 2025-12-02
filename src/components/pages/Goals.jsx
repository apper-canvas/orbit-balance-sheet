import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";
import GoalCard from "@/components/molecules/GoalCard";
import GoalForm from "@/components/organisms/GoalForm";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import { savingsGoalService } from "@/services/api/savingsGoalService";
import { transactionService } from "@/services/api/transactionService";
import { calculateSavingsProgress } from "@/utils/calculations";
import { formatCurrency } from "@/utils/formatters";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [contributionGoal, setContributionGoal] = useState(null);
  const [contributionAmount, setContributionAmount] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [goalsData, transactionsData] = await Promise.all([
        savingsGoalService.getAll(),
        transactionService.getAll()
      ]);
      
      setGoals(goalsData);
      setTransactions(transactionsData);
    } catch (err) {
      setError("Failed to load goals. Please try again.");
      toast.error("Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSaved = async () => {
    setShowForm(false);
    setEditingGoal(null);
    await loadData();
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleDelete = async (goal) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    
    try {
      await savingsGoalService.delete(goal.Id);
      toast.success("Goal deleted successfully");
      await loadData();
    } catch (error) {
      toast.error("Failed to delete goal");
    }
  };

  const handleAddContribution = (goal) => {
    setContributionGoal(goal);
    setContributionAmount("");
    setShowContributionModal(true);
  };

  const handleSaveContribution = async () => {
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      toast.error("Please enter a valid contribution amount");
      return;
    }

    try {
      const newAmount = contributionGoal.currentAmount + parseFloat(contributionAmount);
      await savingsGoalService.update(contributionGoal.Id, {
        ...contributionGoal,
        currentAmount: newAmount
      });

      // Also add as a transaction
      await transactionService.create({
        type: "income",
        amount: parseFloat(contributionAmount),
        category: "Savings",
        date: new Date().toISOString(),
        description: `Contribution to ${contributionGoal.name}`
      });

      toast.success("Contribution added successfully");
      setShowContributionModal(false);
      setContributionGoal(null);
      setContributionAmount("");
      await loadData();
    } catch (error) {
      toast.error("Failed to add contribution");
    }
  };

  if (loading) return <Loading message="Loading savings goals..." />;
  if (error) return <ErrorView message={error} onRetry={loadData} />;

  const goalsWithProgress = calculateSavingsProgress(goals, transactions);
  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentAmount = goalsWithProgress.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const completedGoals = goalsWithProgress.filter(g => g.status === "completed").length;
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Savings Goals</h1>
          <p className="text-gray-600 mt-1">Track your progress toward financial milestones</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="mt-4 md:mt-0">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Create Goal
        </Button>
      </div>

      {/* Goals Overview */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-primary-50 to-teal-50 border-primary-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                <ApperIcon name="Target" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Target</p>
                <p className="text-2xl font-bold text-primary-700">{formatCurrency(totalTargetAmount)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <ApperIcon name="Wallet" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Saved</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(totalCurrentAmount)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <ApperIcon name="TrendingUp" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-blue-700">{overallProgress.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <ApperIcon name="CheckCircle" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-amber-700">{completedGoals}</p>
                <p className="text-sm text-gray-500">of {goals.length} goals</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Goals List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Your Goals</h3>
          {goals.length > 0 && (
            <div className="text-sm text-gray-600">
              {goals.length} {goals.length === 1 ? "goal" : "goals"} active
            </div>
          )}
        </div>

        {goalsWithProgress.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goalsWithProgress.map((goal) => (
              <div key={goal.Id} className="relative group">
                <GoalCard 
                  goal={goal} 
                  onEdit={handleEdit}
                  onAddContribution={handleAddContribution}
                />
                <button
                  onClick={() => handleDelete(goal)}
                  className="absolute top-4 right-12 p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <ApperIcon name="Trash2" size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            icon="Target"
            title="No savings goals yet"
            message="Create your first savings goal to start building toward your financial future."
            actionText="Create Goal"
            onAction={() => setShowForm(true)}
          />
        )}
      </div>

      {/* Savings Tips */}
      {goals.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <ApperIcon name="Star" size={20} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Savings Tips</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Automate your savings by setting up recurring transfers</li>
                <li>• Break large goals into smaller, manageable milestones</li>
                <li>• Save any unexpected income or windfalls toward your goals</li>
                <li>• Review and adjust your goals quarterly as your life changes</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Goal Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md">
            <GoalForm
              goal={editingGoal}
              onSave={handleFormSaved}
              onCancel={() => {
                setShowForm(false);
                setEditingGoal(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Contribution Modal */}
      {showContributionModal && contributionGoal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Contribution</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowContributionModal(false)}
              >
                <ApperIcon name="X" size={18} />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Contributing to: {contributionGoal.name}</p>
                <p className="text-sm text-gray-500">
                  Current: {formatCurrency(contributionGoal.currentAmount)} / 
                  Target: {formatCurrency(contributionGoal.targetAmount)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contribution Amount
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="secondary" 
                  onClick={() => setShowContributionModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveContribution}>
                  Add Contribution
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Goals;