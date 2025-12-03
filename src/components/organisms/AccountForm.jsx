import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import { accountService } from "@/services/api/accountService";

const AccountForm = ({ account, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "checking",
    accountNumber: "",
    balance: "",
    bank: "",
    description: "",
    creditLimit: "",
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || "",
        type: account.type || "checking",
        accountNumber: account.accountNumber || "",
        balance: account.balance?.toString() || "",
        bank: account.bank || "",
        description: account.description || "",
        creditLimit: account.creditLimit?.toString() || "",
        isActive: account.isActive ?? true
      });
    }
  }, [account]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Account name is required";
    }

    if (!formData.type) {
      newErrors.type = "Account type is required";
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    }

    if (!formData.balance.trim()) {
      newErrors.balance = "Balance is required";
    } else if (isNaN(parseFloat(formData.balance))) {
      newErrors.balance = "Balance must be a valid number";
    }

    if (!formData.bank.trim()) {
      newErrors.bank = "Bank name is required";
    }

    if (formData.type === "credit" && formData.creditLimit.trim()) {
      if (isNaN(parseFloat(formData.creditLimit)) || parseFloat(formData.creditLimit) <= 0) {
        newErrors.creditLimit = "Credit limit must be a positive number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    
    try {
      const accountData = {
        name: formData.name.trim(),
        type: formData.type,
        accountNumber: formData.accountNumber.trim(),
        balance: parseFloat(formData.balance),
        bank: formData.bank.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive
      };

      if (formData.type === "credit" && formData.creditLimit.trim()) {
        accountData.creditLimit = parseFloat(formData.creditLimit);
      }

      if (account) {
        await accountService.update(account.Id, accountData);
        toast.success("Account updated successfully");
      } else {
        await accountService.create(accountData);
        toast.success("Account created successfully");
      }
      
      onSave();
    } catch (error) {
      toast.error(error.message || "Failed to save account");
    } finally {
      setLoading(false);
    }
  };

  const accountTypes = [
    { value: "checking", label: "Checking" },
    { value: "savings", label: "Savings" },
    { value: "credit", label: "Credit Card" },
    { value: "investment", label: "Investment" }
  ];

  return (
    <Card className="w-full">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {account ? "Edit Account" : "Add New Account"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ApperIcon name="X" size={20} />
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Account Name"
            error={errors.name}
            required
          >
            <Input
              placeholder="e.g., Primary Checking"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={errors.name ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
            />
          </FormField>

          <FormField
            label="Account Type"
            error={errors.type}
            required
          >
            <Select
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className={errors.type ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
            >
              {accountTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            label="Account Number"
            error={errors.accountNumber}
            required
          >
            <Input
              placeholder="e.g., ****1234"
              value={formData.accountNumber}
              onChange={(e) => handleChange("accountNumber", e.target.value)}
              className={errors.accountNumber ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
            />
          </FormField>

          <FormField
            label="Bank/Institution"
            error={errors.bank}
            required
          >
            <Input
              placeholder="e.g., Chase Bank"
              value={formData.bank}
              onChange={(e) => handleChange("bank", e.target.value)}
              className={errors.bank ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
            />
          </FormField>

          <FormField
            label={formData.type === "credit" ? "Current Balance" : "Balance"}
            error={errors.balance}
            required
          >
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.balance}
              onChange={(e) => handleChange("balance", e.target.value)}
              className={errors.balance ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
            />
          </FormField>

          {formData.type === "credit" && (
            <FormField
              label="Credit Limit"
              error={errors.creditLimit}
            >
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.creditLimit}
                onChange={(e) => handleChange("creditLimit", e.target.value)}
                className={errors.creditLimit ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
              />
            </FormField>
          )}
        </div>

        <FormField
          label="Description (Optional)"
        >
          <Input
            placeholder="Brief description of this account"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </FormField>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => handleChange("isActive", e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Account is active
          </label>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                {account ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <ApperIcon name="Save" size={16} className="mr-2" />
                {account ? "Update Account" : "Create Account"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AccountForm;