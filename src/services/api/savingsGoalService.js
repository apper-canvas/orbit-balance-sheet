import savingsGoals from "@/services/mockData/savingsGoals.json";

class SavingsGoalService {
  constructor() {
    this.data = [...savingsGoals];
  }

  async getAll() {
    await this.delay();
    return [...this.data];
  }

  async getById(id) {
    await this.delay();
    const goal = this.data.find(item => item.Id === parseInt(id));
    if (!goal) {
      throw new Error("Savings goal not found");
    }
    return { ...goal };
  }

  async create(goalData) {
    await this.delay();
    const newId = Math.max(...this.data.map(item => item.Id), 0) + 1;
    const newGoal = {
      Id: newId,
      ...goalData,
      createdAt: new Date().toISOString()
    };
    this.data.push(newGoal);
    return { ...newGoal };
  }

  async update(id, updateData) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Savings goal not found");
    }
    this.data[index] = { ...this.data[index], ...updateData };
    return { ...this.data[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Savings goal not found");
    }
    const deletedGoal = this.data.splice(index, 1)[0];
    return { ...deletedGoal };
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }
}

export const savingsGoalService = new SavingsGoalService();