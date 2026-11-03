"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  ArrowRight,
  Receipt,
  Check,
  ShieldAlert,
} from "lucide-react";
import type {
  TravellerProfile,
  GroupExpenseItem,
  ExpenseCategory,
} from "@/lib/group/group-types";
import { calculateGroupExpenseSummary } from "@/lib/group/group-expenses";
import { useLanguage } from "@/lib/i18n";

interface ExpenseSplitterProps {
  travellers: TravellerProfile[];
  expenses: GroupExpenseItem[];
  onAddExpense: (expense: GroupExpenseItem) => void;
  onRemoveExpense: (expenseId: string) => void;
}

const EXPENSE_CATEGORIES: { id: ExpenseCategory; labelEn: string; labelKn: string }[] = [
  { id: "food", labelEn: "Food & Dining", labelKn: "ಆಹಾರ & ಊಟ" },
  { id: "transport", labelEn: "Transport & Fuel", labelKn: "ಸಾರಿಗೆ & ಇಂಧನ" },
  { id: "accommodation", labelEn: "Accommodation", labelKn: "ವಸತಿ" },
  { id: "activities", labelEn: "Sightseeing & Entry", labelKn: "ವೀಕ್ಷಣೆ & ಪ್ರವೇಶ" },
  { id: "permits", labelEn: "Safaris & Permits", labelKn: "ಸಫಾರಿ & ಅನುಮತಿ" },
  { id: "misc", labelEn: "Miscellaneous", labelKn: "ಇತರೆ" },
];

export function ExpenseSplitter({
  travellers,
  expenses,
  onAddExpense,
  onRemoveExpense,
}: ExpenseSplitterProps) {
  const { isKn } = useLanguage();

  const [showAddForm, setShowAddForm] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [amountStr, setAmountStr] = useState("");
  const [paidBy, setPaidBy] = useState(travellers[0]?.id || "");
  const [splitMode, setSplitMode] = useState<"equal" | "custom">("equal");
  const [customShares, setCustomShares] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const summary = calculateGroupExpenseSummary(expenses, travellers);
  const travellerMap = new Map(travellers.map((t) => [t.id, t.name]));

  const handleCustomShareChange = (travellerId: string, value: string) => {
    setCustomShares((prev) => ({
      ...prev,
      [travellerId]: value,
    }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(amountStr.replace(/[^0-9]/g, ""), 10);
    if (!description.trim()) {
      setError(isKn ? "ದಯವಿಟ್ಟು ವಿವರಣೆ ನಮೂದಿಸಿ." : "Please enter a description.");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setError(isKn ? "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಮೊತ್ತವನ್ನು ನಮೂದಿಸಿ." : "Please enter a valid amount.");
      return;
    }
    if (!paidBy) {
      setError(isKn ? "ಪಾವತಿಸಿದ ವ್ಯಕ್ತಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ." : "Please select who paid.");
      return;
    }

    let parsedCustomShares: Record<string, number> | undefined;
    if (splitMode === "custom") {
      parsedCustomShares = {};
      let totalCustom = 0;
      for (const t of travellers) {
        const shareVal = parseInt((customShares[t.id] || "0").replace(/[^0-9]/g, ""), 10) || 0;
        parsedCustomShares[t.id] = shareVal;
        totalCustom += shareVal;
      }
      if (totalCustom !== amount) {
        setError(
          isKn
            ? `ವೈಯಕ್ತಿಕ ಪಾಲಿನ ಮೊತ್ತ (₹${totalCustom}) ಒಟ್ಟು ಮೊತ್ತಕ್ಕೆ (₹${amount}) ಸಮನಾಗಿರಬೇಕು.`
            : `Custom shares sum (₹${totalCustom}) must equal total amount (₹${amount}).`
        );
        return;
      }
    }

    const newExpense: GroupExpenseItem = {
      id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      description: description.trim(),
      category,
      amountInr: amount,
      paidByTravellerId: paidBy,
      splitMode,
      customShares: parsedCustomShares,
      createdAt: new Date().toISOString(),
    };

    onAddExpense(newExpense);
    setDescription("");
    setAmountStr("");
    setCustomShares({});
    setError(null);
    setShowAddForm(false);
  };

  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-white p-6 sm:p-8 shadow-card space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Receipt size={20} className="text-forest" />
            <h3 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-bold text-forest-dark">
              {isKn ? "ತಂಡದ ವೆಚ್ಚ ಹಂಚಿಕೆ & ಲೆಕ್ಕಾಚಾರ" : "Group Expense Splitter & Settlement"}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1 leading-relaxed">
            {isKn
              ? "ನಿಜವಾದ ವೆಚ್ಚಗಳನ್ನು ದಾಖಲಿಸಿ, ಸಮಾನವಾಗಿ ಅಥವಾ ಕಸ್ಟಮ್ ಆಗಿ ಹಂಚಿ ಮತ್ತು ಯಾರು ಯಾರಿಗೆ ಹಣ ನೀಡಬೇಕೆಂದು ತಕ್ಷಣ ನೋಡಿ."
              : "Track group expenses, split equally or with custom shares, and resolve balances with zero rounding errors."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-md)] bg-forest text-white text-xs font-semibold hover:bg-forest-light transition-colors cursor-pointer self-start sm:self-auto shadow-subtle"
        >
          <Plus size={14} />
          <span>{showAddForm ? (isKn ? "ಮುಚ್ಚಿ" : "Cancel") : isKn ? "ವೆಚ್ಚ ಸೇರಿಸಿ" : "Add Expense"}</span>
        </button>
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="p-5 rounded-[var(--radius-lg)] bg-ivory-warm border border-border text-xs space-y-4 animate-fade-in"
        >
          <h4 className="font-bold text-forest-dark text-sm">
            {isKn ? "ಹೊಸ ವೆಚ್ಚವನ್ನು ನಮೂದಿಸಿ" : "Log a Shared Expense"}
          </h4>

          {error && (
            <div className="p-2.5 rounded-[var(--radius-md)] bg-error/10 border border-error/20 text-error font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-charcoal block">
                {isKn ? "ವಿವರಣೆ *" : "Description *"}
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isKn ? "ಉದಾ: ಮೈಸೂರು ಅರಮನೆ ಪ್ರವೇಶ ಶುಲ್ಕ" : "e.g., Mysuru Palace Entry Tickets"}
                className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-border bg-white text-charcoal text-xs focus:outline-forest"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-charcoal block">
                {isKn ? "ಮೊತ್ತ (₹) *" : "Amount (₹) *"}
              </label>
              <input
                type="text"
                required
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="e.g., 2400"
                className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-border bg-white text-charcoal text-xs focus:outline-forest font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-charcoal block">
                {isKn ? "ವಿಭಾಗ" : "Category"}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-border bg-white text-charcoal text-xs focus:outline-forest"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {isKn ? cat.labelKn : cat.labelEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-charcoal block">
                {isKn ? "ಪಾವತಿಸಿದವರು *" : "Paid By *"}
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-border bg-white text-charcoal text-xs focus:outline-forest"
              >
                {travellers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-charcoal block">
                {isKn ? "ಹಂಚಿಕೆ ವಿಧಾನ" : "Split Mode"}
              </label>
              <select
                value={splitMode}
                onChange={(e) => setSplitMode(e.target.value as "equal" | "custom")}
                className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-border bg-white text-charcoal text-xs focus:outline-forest"
              >
                <option value="equal">{isKn ? "ಸಮಾನ ಹಂಚಿಕೆ (Equal Split)" : "Equal Split"}</option>
                <option value="custom">{isKn ? "ಕಸ್ಟಮ್ ಮೊತ್ತ (Custom Split)" : "Custom Split"}</option>
              </select>
            </div>
          </div>

          {/* Custom Shares Inputs if selected */}
          {splitMode === "custom" && (
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="font-semibold text-charcoal block">
                {isKn ? "ಪ್ರತಿ ಪ್ರಯಾಣಿಕರ ಪಾಲು ನಮೂದಿಸಿ (₹)" : "Enter Share per Traveller (₹)"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {travellers.map((t) => (
                  <div key={t.id} className="space-y-1">
                    <span className="text-[11px] text-charcoal-muted truncate block">
                      {t.name}
                    </span>
                    <input
                      type="text"
                      placeholder="0"
                      value={customShares[t.id] || ""}
                      onChange={(e) => handleCustomShareChange(t.id, e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-border bg-white text-charcoal text-xs font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-[var(--radius-md)] bg-forest text-white font-semibold text-xs hover:bg-forest-light transition-colors cursor-pointer"
            >
              {isKn ? "ವೆಚ್ಚ ದಾಖಲಿಸಿ" : "Save Expense"}
            </button>
          </div>
        </form>
      )}

      {/* Expenses List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
          {isKn ? `ದಾಖಲಾದ ವೆಚ್ಚಗಳು (${expenses.length})` : `Logged Expenses (${expenses.length})`}
        </h4>

        {expenses.length === 0 ? (
          <div className="p-6 rounded-[var(--radius-lg)] border border-dashed border-border text-center text-xs text-charcoal-muted">
            <Receipt size={24} className="mx-auto mb-2 text-charcoal-muted opacity-40" />
            <p>
              {isKn
                ? "ಯಾವುದೇ ವೆಚ್ಚ ದಾಖಲಾಗಿಲ್ಲ. ನಿಮ್ಮ ಪ್ರವಾಸದ ವೆಚ್ಚಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಲು 'ವೆಚ್ಚ ಸೇರಿಸಿ' ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ."
                : "No expenses logged yet. Tap 'Add Expense' above to start tracking shared group payments."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border border border-border rounded-[var(--radius-lg)] overflow-hidden bg-white text-xs">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-ivory-warm/40 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal">{exp.description}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-forest/10 text-forest font-semibold">
                      {exp.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-charcoal-muted mt-0.5">
                    {isKn ? "ಪಾವತಿಸಿದವರು: " : "Paid by: "}
                    <strong className="text-charcoal font-medium">
                      {travellerMap.get(exp.paidByTravellerId) || exp.paidByTravellerId}
                    </strong>{" "}
                    · {exp.splitMode === "equal" ? (isKn ? "ಸಮಾನ ಹಂಚಿಕೆ" : "Equal split") : (isKn ? "ಕಸ್ಟಮ್ ಹಂಚಿಕೆ" : "Custom split")}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-sm text-forest-dark">
                    ₹{exp.amountInr.toLocaleString("en-IN")}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveExpense(exp.id)}
                    className="p-1 text-charcoal-muted hover:text-error transition-colors cursor-pointer"
                    aria-label={isKn ? "ಅಳಿಸಿ" : "Delete expense"}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settlement Transfers ("Who Owes Whom") */}
      {summary.settlementTransfers.length > 0 && (
        <div className="p-5 rounded-[var(--radius-lg)] bg-ivory-warm border border-border space-y-3">
          <h4 className="text-xs font-bold text-forest-dark uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Check size={14} className="text-forest" />
            <span>{isKn ? "ಖಾತೆ ಇತ್ಯರ್ಥ ವಿವರ (Settlement Transfers)" : "Settlement Transfers (Who Owes Whom)"}</span>
          </h4>
          <p className="text-[11px] text-charcoal-muted">
            {isKn
              ? "ಕನಿಷ್ಠ ವರ್ಗಾವಣೆಗಳೊಂದಿಗೆ ಎಲ್ಲಾ ಸಾಲಗಳನ್ನು ಸರಳವಾಗಿ ಇತ್ಯರ್ಥಗೊಳಿಸಲು ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮ:"
              : "Minimal transfer calculations to settle all outstanding balances without round-off errors:"}
          </p>

          <div className="space-y-2 pt-1">
            {summary.settlementTransfers.map((transfer, idx) => (
              <div
                key={idx}
                className="p-3 rounded-[var(--radius-md)] bg-white border border-border flex items-center justify-between text-xs font-medium text-charcoal"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-error">{transfer.fromTravellerName}</span>
                  <span className="text-charcoal-muted">{isKn ? "ಇವರಿಗೆ ನೀಡಬೇಕು:" : "pays"}</span>
                  <span className="font-bold text-forest">{transfer.toTravellerName}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono font-bold text-sm text-forest-dark">
                  <ArrowRight size={13} className="text-charcoal-muted" />
                  <span>₹{transfer.amountInr.toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informational Tool Disclaimer */}
      <div className="flex items-start gap-2 text-[11px] text-charcoal-muted border-t border-border/60 pt-3">
        <ShieldAlert size={13} className="text-forest shrink-0 mt-0.5" />
        <p>
          {isKn
            ? "ಗಮನಿಸಿ: ಇದು ಪ್ರವಾಸ ಯೋಜನೆ ಮತ್ತು ವೆಚ್ಚ ಹಂಚಿಕೆಯ ಲೆಕ್ಕಾಚಾರದ ಸಾಧನ ಮಾತ್ರ. ಯಾವುದೇ ನೈಜ ಬ್ಯಾಂಕ್ ಅಥವಾ ಹಣಕಾಸು ವಹಿವಾಟುಗಳನ್ನು ಇದು ಮಾಡುವುದಿಲ್ಲ."
            : "Notice: This is a planning and settlement calculation tool only. Zero real bank transfers, payments, or third-party financial accounts are accessed."}
        </p>
      </div>
    </div>
  );
}
