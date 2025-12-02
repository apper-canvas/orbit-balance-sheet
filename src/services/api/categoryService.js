import categories from "@/services/mockData/categories.json";

class CategoryService {
  constructor() {
    this.data = [...categories];
  }

  async getAll() {
    await this.delay();
    return [...this.data];
  }

  async getById(id) {
    await this.delay();
    const category = this.data.find(item => item.Id === parseInt(id));
    if (!category) {
      throw new Error("Category not found");
    }
    return { ...category };
  }

  async create(categoryData) {
    await this.delay();
    const newId = Math.max(...this.data.map(item => item.Id), 0) + 1;
    const newCategory = {
      Id: newId,
      ...categoryData
    };
    this.data.push(newCategory);
    return { ...newCategory };
  }

  async update(id, updateData) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Category not found");
    }
    this.data[index] = { ...this.data[index], ...updateData };
    return { ...this.data[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Category not found");
    }
    const deletedCategory = this.data.splice(index, 1)[0];
    return { ...deletedCategory };
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }
}

export const categoryService = new CategoryService();