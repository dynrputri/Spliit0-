import { Expense, Member } from '../types';
import { calculateBalances } from './settlement';

export interface GroupStats {
  netBalance: number;       // you're owed (>0) or you owe (<0)
  totalGroupSpent: number;  // total amount of all expenses
  yourPaidAmount: number;   // amount logged by "you"
  yourActualShare: number;   // how much "you" actually owe of all bills combined
  categoryShares: Record<string, number>; // total amount spent per category
  activeDebtsCount: number; // how many transactions needed to settle
}

export function calculateGroupStats(members: Member[], expenses: Expense[]): GroupStats {
  const balances = calculateBalances(members, expenses);
  const netBalance = balances['you'] || 0;

  let totalGroupSpent = 0;
  let yourPaidAmount = 0;
  let yourActualShare = 0;
  const categoryShares: Record<string, number> = {};

  expenses.forEach(exp => {
    totalGroupSpent += exp.amount;
    
    if (exp.paidBy === 'you') {
      yourPaidAmount += exp.amount;
    }

    const youSplit = exp.splits.find(s => s.memberId === 'you');
    if (youSplit) {
      yourActualShare += youSplit.amount;
    }

    // Category aggregation
    if (!categoryShares[exp.category]) {
      categoryShares[exp.category] = 0;
    }
    categoryShares[exp.category] += exp.amount;
  });

  return {
    netBalance,
    totalGroupSpent: Math.round(totalGroupSpent * 100) / 100,
    yourPaidAmount: Math.round(yourPaidAmount * 100) / 100,
    yourActualShare: Math.round(yourActualShare * 100) / 100,
    categoryShares,
    activeDebtsCount: 0 // Will be handled on demand or dynamically
  };
}
