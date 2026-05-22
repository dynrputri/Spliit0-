import { Member, Expense, Settlement } from '../types';

/**
 * Calculates the net balance of each group member in USD.
 * A positive value means the member is owed money.
 * A negative value means the member owes money.
 */
export function calculateBalances(members: Member[], expenses: Expense[]): Record<string, number> {
  const balances: Record<string, number> = {};

  // Initialize balances with 0 for all active members
  members.forEach((m) => {
    balances[m.id] = 0;
  });

  // Calculate net balances based on expenses
  expenses.forEach((expense) => {
    const totalAmount = expense.amount;
    const paidBy = expense.paidBy;

    // Credit the payer
    if (balances[paidBy] !== undefined) {
      balances[paidBy] += totalAmount;
    }

    // Debit each member based on their split share
    expense.splits.forEach((split) => {
      if (balances[split.memberId] !== undefined) {
        balances[split.memberId] -= split.amount;
      }
    });
  });

  // To avoid floating point issues (e.g. -0.00000001)
  Object.keys(balances).forEach((key) => {
    balances[key] = Math.round(balances[key] * 100) / 100;
  });

  return balances;
}

/**
 * Calculates the minimal set of transactions needed to settle all debts.
 * Greedily matches the largest debtor with the largest creditor.
 */
export function calculateSettlements(members: Member[], expenses: Expense[]): Settlement[] {
  const balances = calculateBalances(members, expenses);
  
  // Create mutable creditor and debtor arrays
  const debtors: { memberId: string; amount: number }[] = [];
  const creditors: { memberId: string; amount: number }[] = [];

  Object.entries(balances).forEach(([memberId, balance]) => {
    if (balance < -0.01) {
      debtors.push({ memberId, amount: Math.abs(balance) });
    } else if (balance > 0.01) {
      creditors.push({ memberId, amount: balance });
    }
  });

  // Sort: largest first
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let dIdx = 0;
  let cIdx = 0;

  // Clone list items to mutate values during matching
  const dList = debtors.map(d => ({ ...d }));
  const cList = creditors.map(c => ({ ...c }));

  while (dIdx < dList.length && cIdx < cList.length) {
    const debtor = dList[dIdx];
    const creditor = cList[cIdx];

    const amount = Math.min(debtor.amount, creditor.amount);
    
    if (amount > 0.01) {
      settlements.push({
        id: `settle-${debtor.memberId}-${creditor.memberId}-${amount.toFixed(2)}-${Date.now()}`,
        from: debtor.memberId,
        to: creditor.memberId,
        amount: Math.round(amount * 100) / 100
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount <= 0.01) {
      dIdx++;
    }
    if (creditor.amount <= 0.01) {
      cIdx++;
    }
  }

  return settlements;
}
