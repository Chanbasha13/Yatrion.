import type {
  TravellerProfile,
  GroupExpenseItem,
  GroupExpenseSummary,
  SettlementTransfer,
} from "./group-types";

/**
 * Calculates fair share splits for an individual expense item.
 * Guarantees zero rounding error: remainder rupees are deterministically assigned.
 */
export function calculateExpenseShares(
  expense: GroupExpenseItem,
  travellers: TravellerProfile[]
): Record<string, number> {
  const shares: Record<string, number> = {};
  const travellerIds = travellers.map((t) => t.id);
  const count = travellerIds.length;

  if (count === 0) return shares;

  if (expense.splitMode === "custom" && expense.customShares) {
    // Custom split provided by user
    let customSum = 0;
    for (const id of travellerIds) {
      const s = Math.max(0, Math.round(expense.customShares[id] || 0));
      shares[id] = s;
      customSum += s;
    }

    // If custom sum doesn't match total, balance the difference with the payer
    if (customSum !== expense.amountInr) {
      const diff = expense.amountInr - customSum;
      const payerId = expense.paidByTravellerId || travellerIds[0];
      shares[payerId] = Math.max(0, (shares[payerId] || 0) + diff);
    }
    return shares;
  }

  // Equal split mode
  const baseShare = Math.floor(expense.amountInr / count);
  const remainder = expense.amountInr - baseShare * count;

  travellerIds.forEach((id, index) => {
    // Distribute remainder rupees to first few travellers
    shares[id] = baseShare + (index < remainder ? 1 : 0);
  });

  return shares;
}

/**
 * Computes complete group expense summary, individual balances,
 * and minimal debt settlement transfers ("who owes whom").
 */
export function calculateGroupExpenseSummary(
  expenses: GroupExpenseItem[],
  travellers: TravellerProfile[]
): GroupExpenseSummary {
  const perTravellerSpent: Record<string, number> = {};
  const perTravellerFairShare: Record<string, number> = {};
  const netBalances: Record<string, number> = {};
  let totalExpenses = 0;

  // Initialize all travellers with 0
  for (const t of travellers) {
    perTravellerSpent[t.id] = 0;
    perTravellerFairShare[t.id] = 0;
    netBalances[t.id] = 0;
  }

  // Accumulate spent and owed
  for (const exp of expenses) {
    totalExpenses += exp.amountInr;
    perTravellerSpent[exp.paidByTravellerId] =
      (perTravellerSpent[exp.paidByTravellerId] || 0) + exp.amountInr;

    const itemShares = calculateExpenseShares(exp, travellers);
    for (const [travellerId, share] of Object.entries(itemShares)) {
      perTravellerFairShare[travellerId] =
        (perTravellerFairShare[travellerId] || 0) + share;
    }
  }

  // Calculate net balances (positive = owed money, negative = owes money)
  for (const t of travellers) {
    const spent = perTravellerSpent[t.id] || 0;
    const share = perTravellerFairShare[t.id] || 0;
    netBalances[t.id] = spent - share;
  }

  // Greedy Debt Simplification Algorithm
  // Creditors (net > 0) and Debtors (net < 0)
  const settlementTransfers: SettlementTransfer[] = [];
  const debtors: { id: string; name: string; amount: number }[] = [];
  const creditors: { id: string; name: string; amount: number }[] = [];

  const travellerMap = new Map(travellers.map((t) => [t.id, t.name]));

  for (const [id, balance] of Object.entries(netBalances)) {
    const name = travellerMap.get(id) || id;
    if (balance < -0.01) {
      debtors.push({ id, name, amount: Math.abs(balance) });
    } else if (balance > 0.01) {
      creditors.push({ id, name, amount: balance });
    }
  }

  // Sort descending by amount for greedy resolution
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const transferAmount = Math.min(debtor.amount, creditor.amount);

    if (transferAmount > 0) {
      settlementTransfers.push({
        fromTravellerId: debtor.id,
        fromTravellerName: debtor.name,
        toTravellerId: creditor.id,
        toTravellerName: creditor.name,
        amountInr: Math.round(transferAmount),
      });

      debtor.amount -= transferAmount;
      creditor.amount -= transferAmount;
    }

    if (debtor.amount <= 0.01) dIdx++;
    if (creditor.amount <= 0.01) cIdx++;
  }

  return {
    totalExpenses,
    perTravellerSpent,
    perTravellerFairShare,
    netBalances,
    settlementTransfers,
  };
}

