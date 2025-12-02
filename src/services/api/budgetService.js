import budgets from "@/services/mockData/budgets.json";

class BudgetService {
  constructor() {
    this.data = [...budgets];
  }

  async getAll() {
    await this.delay();
    return [...this.data];
  }

  async getById(id) {
    await this.delay();
    const budget = this.data.find(item => item.Id === parseInt(id));
    if (!budget) {
      throw new Error("Budget not found");
    }
    return { ...budget };
  }

  async create(budgetData) {
    await this.delay();
    const newId = Math.max(...this.data.map(item => item.Id), 0) + 1;
    const newBudget = {
      Id: newId,
      ...budgetData,
      currentSpent: 0
    };
    this.data.push(newBudget);
    return { ...newBudget };
  }

  async update(id, updateData) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Budget not found");
    }
    this.data[index] = { ...this.data[index], ...updateData };
    return { ...this.data[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Budget not found");
    }
    const deletedBudget = this.data.splice(index, 1)[0];
    return { ...deletedBudget };
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }
}

export const budgetService = new BudgetService();