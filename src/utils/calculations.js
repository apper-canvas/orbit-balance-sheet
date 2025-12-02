import { getCurrentMonth } from '@/utils/formatters';

export const calculateMonthlyTotals = (transactions, month = null, year = null) => {
  const targetMonth = month ?? getCurrentMonth().month;
  const targetYear = year ?? getCurrentMonth().year;
  
  const monthlyTransactions = transactions.filter(transaction => {
    const date = new Date(transaction.date);
    return date.getMonth() === targetMonth && date.getFullYear() === targetYear;
  });

  const income = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    income,
    expenses,
    balance: income - expenses,
    transactions: monthlyTransactions
  };
};

export const calculateBudgetProgress = (budgets, transactions) => {
  const currentMonth = getCurrentMonth();
  
  return budgets.map(budget => {
    const monthlySpent = transactions
      .filter(t => 
        t.type === 'expense' && 
        t.category === budget.category &&
        new Date(t.date).getMonth() === currentMonth.month &&
        new Date(t.date).getFullYear() === currentMonth.year
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const percentage = budget.monthlyLimit > 0 ? (monthlySpent / budget.monthlyLimit) * 100 : 0;
    const remaining = budget.monthlyLimit - monthlySpent;

    // Enhanced status calculation for alert system
    let status = 'good';
    if (percentage >= 100) {
      status = 'exceeded';
    } else if (percentage >= 80) {
      status = 'warning';
    }

    return {
      ...budget,
      spent: monthlySpent,
      percentage,
      remaining: Math.max(0, remaining),
      status,
      alertLevel: percentage >= 100 ? 'critical' : percentage >= 80 ? 'warning' : 'normal'
    };
  });
};

export const calculateCategoryBreakdown = (transactions, month = null, year = null) => {
  const targetMonth = month ?? getCurrentMonth().month;
  const targetYear = year ?? getCurrentMonth().year;
  
  const expenses = transactions.filter(t => {
    const date = new Date(t.date);
    return t.type === 'expense' && 
           date.getMonth() === targetMonth && 
           date.getFullYear() === targetYear;
  });

  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  
  const breakdown = expenses.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) {
      acc[category] = { amount: 0, count: 0 };
    }
    acc[category].amount += transaction.amount;
    acc[category].count += 1;
    return acc;
  }, {});

  return Object.entries(breakdown).map(([category, data]) => ({
    category,
    amount: data.amount,
    count: data.count,
    percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0
  })).sort((a, b) => b.amount - a.amount);
};

export const calculateSpendingTrend = (transactions, monthsBack = 6) => {
  const now = new Date();
  const trends = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = targetDate.getMonth();
    const year = targetDate.getFullYear();
    
    const monthlyData = calculateMonthlyTotals(transactions, month, year);
    
    trends.push({
      month: targetDate.toLocaleString('default', { month: 'short' }),
      year,
      income: monthlyData.income,
      expenses: monthlyData.expenses,
      balance: monthlyData.balance
    });
  }

  return trends;
};

export const calculateSavingsProgress = (goals, transactions) => {
  return goals.map(goal => {
    // Calculate current amount from transactions (could be deposits to savings)
    const savingsTransactions = transactions.filter(t => 
      t.description?.toLowerCase().includes(goal.name.toLowerCase()) ||
      t.category === 'Savings'
    );
    
    const currentFromTransactions = savingsTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const actualCurrent = Math.max(goal.currentAmount, currentFromTransactions);
    const percentage = goal.targetAmount > 0 ? (actualCurrent / goal.targetAmount) * 100 : 0;
    const remaining = Math.max(0, goal.targetAmount - actualCurrent);
    
    return {
      ...goal,
      currentAmount: actualCurrent,
      percentage: Math.min(100, percentage),
      remaining,
      status: percentage >= 100 ? 'completed' : percentage >= 75 ? 'close' : 'progress'
    };
  });
};