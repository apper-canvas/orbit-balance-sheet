import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import FormField from "@/components/molecules/FormField";
import { transactionService } from "@/services/api/transactionService";
import { categoryService } from "@/services/api/categoryService";

const TransactionForm = ({ transaction, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category: "",
    date: format(new Date(), "yyyy-MM-dd"),
    description: ""
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount.toString(),
        category: transaction.category,
        date: format(new Date(transaction.date), "yyyy-MM-dd"),
        description: transaction.description
      });
    }
  }, [transaction]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
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

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString()
      };

      if (transaction) {
        await transactionService.update(transaction.Id, transactionData);
        toast.success("Transaction updated successfully");
      } else {
        await transactionService.create(transactionData);
        toast.success("Transaction added successfully");
      }

      onSave?.();
    } catch (error) {
      toast.error("Failed to save transaction");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {transaction ? "Edit Transaction" : "Add Transaction"}
        </h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ApperIcon name="X" size={18} />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Type" required>
          <Select
            value={formData.type}
            onChange={(e) => handleInputChange("type", e.target.value)}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Select>
        </FormField>

        <FormField label="Amount" required error={errors.amount}>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => handleInputChange("amount", e.target.value)}
          />
        </FormField>

        <FormField label="Category" required error={errors.category}>
          <Select
            value={formData.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
          >
            <option value="">Select a category</option>
            {filteredCategories.map((category) => (
              <option key={category.Id} value={category.name}>
                {category.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Date" required>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
          />
        </FormField>

        <FormField label="Description" required error={errors.description}>
          <Input
            placeholder="Enter transaction description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
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
              transaction ? "Update Transaction" : "Add Transaction"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default TransactionForm;