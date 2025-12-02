import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import FormField from "@/components/molecules/FormField";
import { budgetService } from "@/services/api/budgetService";
import { categoryService } from "@/services/api/categoryService";
import { getCurrentMonth } from "@/utils/formatters";

const BudgetForm = ({ budget, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    category: "",
    monthlyLimit: "",
    month: getCurrentMonth().monthName,
    year: getCurrentMonth().year
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category,
        monthlyLimit: budget.monthlyLimit.toString(),
        month: budget.month,
        year: budget.year
      });
    }
  }, [budget]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data.filter(cat => cat.type === "expense"));
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (!formData.monthlyLimit || parseFloat(formData.monthlyLimit) <= 0) {
      newErrors.monthlyLimit = "Monthly limit must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const budgetData = {
        ...formData,
        monthlyLimit: parseFloat(formData.monthlyLimit),
        currentSpent: budget?.currentSpent || 0
      };

      if (budget) {
        await budgetService.update(budget.Id, budgetData);
        toast.success("Budget updated successfully");
      } else {
        await budgetService.create(budgetData);
        toast.success("Budget created successfully");
      }

      onSave?.();
    } catch (error) {
      toast.error("Failed to save budget");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {budget ? "Edit Budget" : "Create Budget"}
        </h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ApperIcon name="X" size={18} />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Category" required error={errors.category}>
          <Select
            value={formData.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.Id} value={category.name}>
                {category.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Monthly Limit" required error={errors.monthlyLimit}>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.monthlyLimit}
            onChange={(e) => handleInputChange("monthlyLimit", e.target.value)}
          />
        </FormField>

        <FormField label="Month">
          <Select
            value={formData.month}
            onChange={(e) => handleInputChange("month", e.target.value)}
          >
            {[
              "January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"
            ].map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Year">
          <Select
            value={formData.year}
            onChange={(e) => handleInputChange("year", parseInt(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i - 2).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
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
              budget ? "Update Budget" : "Create Budget"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default BudgetForm;