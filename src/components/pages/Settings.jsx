import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import { categoryService } from "@/services/api/categoryService";

const Settings = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
    color: "#ef4444",
    icon: "ShoppingCart"
  });
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);

  const categoryIcons = [
    "ShoppingCart", "Car", "Home", "Utensils", "Coffee", "Gamepad2",
    "Plane", "Heart", "GraduationCap", "Smartphone", "Shirt", "Fuel",
    "Baby", "PawPrint", "Music", "Dumbbell", "BookOpen", "Briefcase",
    "CreditCard", "Gift", "Stethoscope", "Wrench", "Palette", "Camera"
  ];

  const categoryColors = [
    "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e",
    "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
    "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#64748b",
    "#6b7280", "#374151", "#1f2937", "#0f172a", "#7c2d12", "#92400e"
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      setError("Failed to load categories. Please try again.");
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Category name must be at least 2 characters";
    } else {
      // Check for duplicate names (excluding current category when editing)
      const existingCategory = categories.find(cat => 
        cat.name.toLowerCase() === formData.name.trim().toLowerCase() &&
        cat.Id !== editingCategory?.Id
      );
      if (existingCategory) {
        newErrors.name = "Category name already exists";
      }
    }

    if (!formData.type) {
      newErrors.type = "Category type is required";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setFormLoading(true);
    try {
      const categoryData = {
        ...formData,
        name: formData.name.trim()
      };

      if (editingCategory) {
        await categoryService.update(editingCategory.Id, categoryData);
        toast.success("Category updated successfully");
      } else {
        await categoryService.create(categoryData);
        toast.success("Category created successfully");
      }

      setShowForm(false);
      setEditingCategory(null);
      setFormData({
        name: "",
        type: "expense",
        color: "#ef4444",
        icon: "ShoppingCart"
      });
      loadCategories();
    } catch (error) {
      toast.error("Failed to save category");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon
    });
    setShowForm(true);
  };

  const handleDelete = async (category) => {
    if (!confirm(`Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await categoryService.delete(category.Id);
      toast.success("Category deleted successfully");
      loadCategories();
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      type: "expense",
      color: "#ef4444",
      icon: "ShoppingCart"
    });
    setFormErrors({});
  };

  const expenseCategories = categories.filter(cat => cat.type === "expense");
  const incomeCategories = categories.filter(cat => cat.type === "income");

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={loadCategories} />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your spending categories and preferences</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="mt-4 md:mt-0">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Category
        </Button>
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <ApperIcon name="TrendingDown" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Expense Categories</p>
              <p className="text-2xl font-bold text-gray-900">{expenseCategories.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <ApperIcon name="TrendingUp" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Income Categories</p>
              <p className="text-2xl font-bold text-gray-900">{incomeCategories.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
              <ApperIcon name="Settings" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Expense Categories</h3>
          <div className="text-sm text-gray-600">
            {expenseCategories.length} categories
          </div>
        </div>
        
        {expenseCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseCategories.map((category) => (
              <div key={category.Id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      <ApperIcon name={category.icon} size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{category.name}</h4>
                      <p className="text-sm text-gray-500 capitalize">{category.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                      className="text-gray-400 hover:text-primary-600"
                    >
                      <ApperIcon name="Edit2" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <ApperIcon name="TrendingDown" size={48} className="mx-auto text-gray-300 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No expense categories</h4>
            <p className="text-gray-500 mb-4">Create your first expense category to start tracking spending.</p>
            <Button onClick={() => setShowForm(true)}>
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Add Category
            </Button>
          </div>
        )}
      </div>

      {/* Income Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Income Categories</h3>
          <div className="text-sm text-gray-600">
            {incomeCategories.length} categories
          </div>
        </div>
        
        {incomeCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {incomeCategories.map((category) => (
              <div key={category.Id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      <ApperIcon name={category.icon} size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{category.name}</h4>
                      <p className="text-sm text-gray-500 capitalize">{category.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                      className="text-gray-400 hover:text-primary-600"
                    >
                      <ApperIcon name="Edit2" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <ApperIcon name="TrendingUp" size={48} className="mx-auto text-gray-300 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No income categories</h4>
            <p className="text-gray-500 mb-4">Create income categories to track your revenue sources.</p>
            <Button onClick={() => setShowForm(true)}>
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Add Category
            </Button>
          </div>
        )}
      </div>

      {/* Category Tips */}
      <div className="bg-gradient-to-r from-primary-50 to-teal-50 rounded-xl p-6 border border-primary-100">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
            <ApperIcon name="Lightbulb" size={20} />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Category Tips</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Create specific categories for better expense tracking</li>
              <li>• Use colors and icons to easily identify categories</li>
              <li>• Keep category names simple and descriptive</li>
              <li>• Regular categories help maintain consistent budget tracking</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCategory ? "Edit Category" : "Add Category"}
                </h3>
                <Button variant="ghost" size="sm" onClick={handleCancelForm}>
                  <ApperIcon name="X" size={18} />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField label="Category Name" required error={formErrors.name}>
                  <Input
                    type="text"
                    placeholder="Enter category name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </FormField>

                <FormField label="Type" required error={formErrors.type}>
                  <Select
                    value={formData.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </Select>
                </FormField>

                <FormField label="Color">
                  <div className="grid grid-cols-8 gap-2">
                    {categoryColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${
                          formData.color === color 
                            ? 'border-gray-400 scale-110' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => handleInputChange("color", color)}
                      />
                    ))}
                  </div>
                </FormField>

                <FormField label="Icon">
                  <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {categoryIcons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        className={`w-8 h-8 rounded-lg border transition-all flex items-center justify-center ${
                          formData.icon === icon 
                            ? 'border-primary-500 bg-primary-50 text-primary-600' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                        onClick={() => handleInputChange("icon", icon)}
                      >
                        <ApperIcon name={icon} size={16} />
                      </button>
                    ))}
                  </div>
                </FormField>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="secondary" onClick={handleCancelForm}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={formLoading}>
                    {formLoading ? (
                      <>
                        <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingCategory ? "Update Category" : "Add Category"
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;