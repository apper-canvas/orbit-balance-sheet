import accounts from "@/services/mockData/accounts.json";

class AccountService {
  constructor() {
    this.data = [...accounts];
  }

  async getAll() {
    await this.delay();
    return [...this.data];
  }

  async getById(id) {
    await this.delay();
    const account = this.data.find(item => item.Id === parseInt(id));
    if (!account) {
      throw new Error("Account not found");
    }
    return { ...account };
  }

  async create(accountData) {
    await this.delay();
    const newId = Math.max(...this.data.map(item => item.Id), 0) + 1;
    const newAccount = {
      Id: newId,
      ...accountData,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    this.data.push(newAccount);
    return { ...newAccount };
  }

  async update(id, updateData) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Account not found");
    }
    this.data[index] = { ...this.data[index], ...updateData };
    return { ...this.data[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Account not found");
    }
    const deletedAccount = this.data.splice(index, 1)[0];
    return { ...deletedAccount };
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }
}

export const accountService = new AccountService();