import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";
import FormField from "@/components/molecules/FormField";
import { savingsGoalService } from "@/services/api/savingsGoalService";

const GoalForm = ({ goal, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
        targetDate: goal.targetDate ? format(new Date(goal.targetDate), "yyyy-MM-dd") : ""
      });
    }
  }, [goal]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Goal name is required";
    }

    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      newErrors.targetAmount = "Target amount must be greater than 0";
    }

    if (formData.currentAmount && parseFloat(formData.currentAmount) < 0) {
      newErrors.currentAmount = "Current amount cannot be negative";
    }

    if (formData.targetDate && new Date(formData.targetDate) <= new Date()) {
      newErrors.targetDate = "Target date must be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const goalData = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount || 0),
        targetDate: formData.targetDate ? new Date(formData.targetDate).toISOString() : null
      };

      if (goal) {
        await savingsGoalService.update(goal.Id, goalData);
        toast.success("Goal updated successfully");
      } else {
        await savingsGoalService.create(goalData);
        toast.success("Goal created successfully");
      }

      onSave?.();
    } catch (error) {
      toast.error("Failed to save goal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {goal ? "Edit Goal" : "Create Savings Goal"}
        </h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ApperIcon name="X" size={18} />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Goal Name" required error={errors.name}>
          <Input
            placeholder="Emergency Fund, Vacation, Car..."
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
        </FormField>

        <FormField label="Target Amount" required error={errors.targetAmount}>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.targetAmount}
            onChange={(e) => handleInputChange("targetAmount", e.target.value)}
          />
        </FormField>

        <FormField label="Current Amount" error={errors.currentAmount}>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.currentAmount}
            onChange={(e) => handleInputChange("currentAmount", e.target.value)}
          />
        </FormField>

        <FormField label="Target Date (Optional)" error={errors.targetDate}>
          <Input
            type="date"
            value={formData.targetDate}
            onChange={(e) => handleInputChange("targetDate", e.target.value)}
          />
        </FormField>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              goal ? "Update Goal" : "Create Goal"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default GoalForm;