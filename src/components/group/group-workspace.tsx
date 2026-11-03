"use client";

import { useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  RotateCcw,
  AlertCircle,
  Compass,
} from "lucide-react";
import type {
  TravellerProfile,
  GroupTripConfig,
  GroupDecisionStatus,
  GroupExpenseItem,
  GroupTripState,
} from "@/lib/group/group-types";
import type { OptimizedBudgetPlan, BudgetScenarioType } from "@/lib/budget/budget-types";
import { calculateGroupCompatibility } from "@/lib/group/group-compatibility";
import { analyzeGroupBudget } from "@/lib/group/group-budget";
import { generateGroupActivitySuggestions } from "@/lib/group/group-itinerary";
import { TravellerCard } from "./traveller-card";
import { TravellerModal } from "./traveller-modal";
import { GroupCompatibilityCard } from "./group-compatibility-card";
import { GroupBudgetSummary } from "./group-budget-summary";
import { ExpenseSplitter } from "./expense-splitter";
import { useLanguage } from "@/lib/i18n";

interface GroupWorkspaceProps {
  destinationIds: string[];
  budgetPlan: OptimizedBudgetPlan;
  activeBudgetScenario?: BudgetScenarioType;
  initialGroupState?: GroupTripState | null;
  onUpdateGroupState?: (state: GroupTripState) => void;
}

export function GroupWorkspace({
  destinationIds,
  budgetPlan,
  activeBudgetScenario = "balanced",
  initialGroupState,
  onUpdateGroupState,
}: GroupWorkspaceProps) {
  const { isKn } = useLanguage();

  // ── 1. Initial State Setup ──
  const [groupConfig, setGroupConfig] = useState<GroupTripConfig>(() => {
    if (initialGroupState?.config) return initialGroupState.config;
    return {
      groupName: isKn ? "ನಮ್ಮ ಕರ್ನಾಟಕ ಪ್ರವಾಸ ಗುಂಪು" : "Karnataka Explorer Group",
      organizerName: isKn ? "ರಮೇಶ್" : "Ramesh",
      travellers: [
        {
          id: "trv-organizer",
          name: isKn ? "ರಮೇಶ್" : "Ramesh",
          type: "adult",
          interests: ["heritage", "nature", "food"],
          preferredPace: "balanced",
          individualBudgetLimit: 25000,
          foodPreference: "veg",
          accessibilityRequirements: ["none"],
          notes: isKn ? "ಪ್ರವಾಸ ಆಯೋಜಕ" : "Trip organizer",
        },
        {
          id: "trv-member-2",
          name: isKn ? "ಪ್ರಿಯಾ" : "Priya",
          type: "adult",
          interests: ["adventure", "nature", "hills"],
          preferredPace: "packed",
          individualBudgetLimit: 20000,
          foodPreference: "any",
          accessibilityRequirements: ["none"],
        },
        {
          id: "trv-member-3",
          name: isKn ? "ಸುರೇಶ್" : "Suresh",
          type: "adult",
          interests: ["spiritual", "nature", "heritage"],
          preferredPace: "relaxed",
          individualBudgetLimit: 18000,
          foodPreference: "veg",
          accessibilityRequirements: ["step_free"],
          notes: isKn ? "ಮೆಟ್ಟಿಲು-ರಹಿತ ನಡಿಗೆ ಆದ್ಯತೆ" : "Prefers gentle walks",
        },
      ],
    };
  });

  const [decisions, setDecisions] = useState<Record<string, GroupDecisionStatus>>(
    () => initialGroupState?.decisions || {}
  );
  const [expenses, setExpenses] = useState<GroupExpenseItem[]>(
    () => initialGroupState?.expenses || []
  );

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTraveller, setEditingTraveller] = useState<TravellerProfile | null>(null);

  // ── 2. Derived Calculations ──
  const compatibilityReport = useMemo(() => {
    return calculateGroupCompatibility(groupConfig.travellers);
  }, [groupConfig.travellers]);

  const budgetAnalysis = useMemo(() => {
    return analyzeGroupBudget({
      travellers: groupConfig.travellers,
      budgetPlan,
      activeScenarioKey: activeBudgetScenario,
    });
  }, [groupConfig.travellers, budgetPlan, activeBudgetScenario]);

  const activitySuggestions = useMemo(() => {
    return generateGroupActivitySuggestions({
      destinationIds,
      travellers: groupConfig.travellers,
      existingDecisions: decisions,
    });
  }, [destinationIds, groupConfig.travellers, decisions]);

  // Sync to parent/storage
  const notifyUpdate = (
    nextConfig: GroupTripConfig,
    nextDecisions: Record<string, GroupDecisionStatus>,
    nextExpenses: GroupExpenseItem[]
  ) => {
    const updatedState: GroupTripState = {
      version: 1,
      config: nextConfig,
      decisions: nextDecisions,
      expenses: nextExpenses,
      updatedAt: new Date().toISOString(),
    };
    onUpdateGroupState?.(updatedState);
  };

  // ── 3. Handlers ──
  const handleSaveTraveller = (traveller: TravellerProfile) => {
    let updatedTravellers: TravellerProfile[];
    const exists = groupConfig.travellers.some((t) => t.id === traveller.id);
    if (exists) {
      updatedTravellers = groupConfig.travellers.map((t) =>
        t.id === traveller.id ? traveller : t
      );
    } else {
      updatedTravellers = [...groupConfig.travellers, traveller];
    }

    const nextConfig = { ...groupConfig, travellers: updatedTravellers };
    setGroupConfig(nextConfig);
    notifyUpdate(nextConfig, decisions, expenses);
  };

  const handleRemoveTraveller = (travellerId: string) => {
    if (groupConfig.travellers.length <= 1) {
      alert(
        isKn
          ? "ಕನಿಷ್ಠ ಒಬ್ಬ ಪ್ರಯಾಣಿಕರು ಇರಬೇಕು."
          : "Group must have at least one traveller."
      );
      return;
    }
    const updatedTravellers = groupConfig.travellers.filter(
      (t) => t.id !== travellerId
    );
    const nextConfig = { ...groupConfig, travellers: updatedTravellers };
    setGroupConfig(nextConfig);
    notifyUpdate(nextConfig, decisions, expenses);
  };

  const handleDecisionChange = (activityId: string, status: GroupDecisionStatus) => {
    const nextDecisions = {
      ...decisions,
      [activityId]: status,
    };
    setDecisions(nextDecisions);
    notifyUpdate(groupConfig, nextDecisions, expenses);
  };

  const handleAddExpense = (expense: GroupExpenseItem) => {
    const nextExpenses = [expense, ...expenses];
    setExpenses(nextExpenses);
    notifyUpdate(groupConfig, decisions, nextExpenses);
  };

  const handleRemoveExpense = (expenseId: string) => {
    const nextExpenses = expenses.filter((e) => e.id !== expenseId);
    setExpenses(nextExpenses);
    notifyUpdate(groupConfig, decisions, nextExpenses);
  };

  const handleResetDecisions = () => {
    const confirmMsg = isKn
      ? "ಎಲ್ಲಾ ಚಟುವಟಿಕೆಗಳ ನಿರ್ಧಾರಗಳನ್ನು ಮೂಲ ಶಿಫಾರಸುಗಳಿಗೆ ಮರುಹೊಂದಿಸಬೇಕೇ?"
      : "Reset all activity decision tags back to algorithmic baseline?";
    if (typeof window !== "undefined" && window.confirm(confirmMsg)) {
      setDecisions({});
      notifyUpdate(groupConfig, {}, expenses);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── SECTION 1: GROUP HEADER & OVERVIEW ── */}
      <div className="rounded-[var(--radius-xl)] border border-border bg-white p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users size={22} className="text-forest" />
              <h3 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-bold text-forest-dark">
                {isKn
                  ? "ತಂಡದ ಪ್ರವಾಸ ಯೋಜನೆ & ಸಹಯೋಗ ನಿರ್ಧಾರ ಎಂಜಿನ್"
                  : "Group Trip Planner & Collaborative Decision Engine"}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1 leading-relaxed">
              {isKn
                ? "ಒಂದೇ ಸಾಧನದಲ್ಲಿ ಪ್ರತಿಯೊಬ್ಬ ಪ್ರಯಾಣಿಕರ ಪ್ರತ್ಯೇಕ ಆದ್ಯತೆಗಳನ್ನು ಸಂಯೋಜಿಸಿ, ಸರ್ವಾನುಮತ ಮತ್ತು ಪ್ರಾಯೋಗಿಕ ಹೊಂದಾಣಿಕೆಗಳನ್ನು ನಿರ್ಧರಿಸಿ."
                : "Plan group travel on a single device: combine individual preferences, detect conflicts, and reach transparent group consensus."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingTraveller(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-md)] bg-forest text-white text-xs font-semibold hover:bg-forest-light transition-colors cursor-pointer shadow-subtle"
            >
              <UserPlus size={15} />
              <span>{isKn ? "ಪ್ರಯಾಣಿಕರನ್ನು ಸೇರಿಸಿ" : "Add Traveller"}</span>
            </button>
          </div>
        </div>

        {/* Group Name & Organizer Bar */}
        <div className="p-4 rounded-[var(--radius-lg)] bg-ivory-warm/60 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-charcoal">
              {isKn ? "ತಂಡದ ಹೆಸರು:" : "Group Name:"}
            </span>
            <input
              type="text"
              value={groupConfig.groupName}
              onChange={(e) => {
                const next = { ...groupConfig, groupName: e.target.value };
                setGroupConfig(next);
                notifyUpdate(next, decisions, expenses);
              }}
              className="px-3 py-1.5 rounded-[var(--radius-sm)] border border-border bg-white text-charcoal font-semibold text-xs focus:outline-forest"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="font-semibold text-charcoal">
              {isKn ? "ಆಯೋಜಕರು:" : "Organizer:"}
            </span>
            <span className="font-mono font-bold text-forest-dark">
              {groupConfig.organizerName}
            </span>
            <span className="text-charcoal-muted font-mono">
              ({groupConfig.travellers.length} {isKn ? "ಪ್ರಯಾಣಿಕರು" : "travellers"})
            </span>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: TRAVELLER PROFILE ROSTER ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-charcoal text-base flex items-center gap-2">
            <Users size={18} className="text-forest" />
            <span>
              {isKn ? "ಪ್ರಯಾಣಿಕರ ವೈಯಕ್ತಿಕ ಪ್ರೊಫೈಲ್‌ಗಳು" : "Individual Traveller Profiles"}
            </span>
            <span className="text-xs font-mono font-normal text-charcoal-muted">
              ({groupConfig.travellers.length})
            </span>
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {groupConfig.travellers.map((traveller, index) => (
            <TravellerCard
              key={traveller.id}
              traveller={traveller}
              isOrganizer={index === 0}
              onEdit={(t) => {
                setEditingTraveller(t);
                setIsModalOpen(true);
              }}
              onRemove={handleRemoveTraveller}
            />
          ))}
        </div>
      </div>

      {/* ── SECTION 3: GROUP COMPATIBILITY & DECISION CARD ── */}
      <GroupCompatibilityCard report={compatibilityReport} />

      {/* ── SECTION 4: GROUP BUDGET ANALYSIS ── */}
      <GroupBudgetSummary
        analysis={budgetAnalysis}
        travellerCount={groupConfig.travellers.length}
      />

      {/* ── SECTION 5: GROUP ACTIVITY DECISION WORKSPACE ── */}
      <div className="rounded-[var(--radius-xl)] border border-border bg-white p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <Compass size={20} className="text-forest" />
              <h3 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-bold text-forest-dark">
                {isKn
                  ? "ತಂಡದ ಚಟುವಟಿಕೆಗಳ ನಿರ್ಧಾರ ವೇದಿಕೆ"
                  : "Group Activity Decision Workspace"}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1 leading-relaxed">
              {isKn
                ? "ತಂಡದ ಬಹುಮತ, ರಾಜಿ ಸಂಧಾನ ಮತ್ತು ವೈಯಕ್ತಿಕ ಇಷ್ಟಗಳನ್ನು ಆಧರಿಸಿ ಚಟುವಟಿಕೆಗಳನ್ನು ಒಪ್ಪಿಕೊಳ್ಳಿ ಅಥವಾ ಐಚ್ಛಿಕವಾಗಿರಿಸಿ."
                : "Tag and confirm activities as group decisions, subgroup optionals, or compromises."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetDecisions}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] border border-border text-charcoal text-xs font-medium hover:bg-ivory-warm transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw size={13} />
            <span>{isKn ? "ನಿರ್ಧಾರ ಮರುಹೊಂದಿಸಿ" : "Reset Decisions"}</span>
          </button>
        </div>

        {/* Suggested Activities Grid */}
        <div className="space-y-3">
          {activitySuggestions.length === 0 ? (
            <div className="p-6 text-center text-xs text-charcoal-muted">
              {isKn
                ? "ಈ ತಾಣಗಳಿಗೆ ಯಾವುದೇ ಚಟುವಟಿಕೆಗಳು ಲಭ್ಯವಿಲ್ಲ."
                : "No activities found for the selected destinations."}
            </div>
          ) : (
            activitySuggestions.map((act) => {
              const tagBadge = {
                group_consensus: {
                  labelEn: "Group Consensus",
                  labelKn: "ತಂಡದ ಒಮ್ಮತ",
                  cls: "bg-forest/15 text-forest border-forest/30",
                },
                compromise: {
                  labelEn: "Smart Compromise",
                  labelKn: "ಹೊಂದಾಣಿಕೆ",
                  cls: "bg-gold/20 text-gold-dark border-gold/40",
                },
                subgroup_optional: {
                  labelEn: "Subgroup Optional",
                  labelKn: "ಐಚ್ಛಿಕ ಚಟುವಟಿಕೆ",
                  cls: "bg-charcoal/10 text-charcoal border-border",
                },
                individual_preference: {
                  labelEn: "Individual Preference",
                  labelKn: "ವೈಯಕ್ತಿಕ ಆಸಕ್ತಿ",
                  cls: "bg-ivory-warm text-charcoal-muted border-border",
                },
              }[act.decisionTag];

              return (
                <div
                  key={act.id}
                  className={`p-4 rounded-[var(--radius-lg)] border transition-all text-xs space-y-3 ${
                    act.status === "accepted"
                      ? "border-forest/40 bg-forest/5"
                      : act.status === "rejected"
                      ? "border-border bg-charcoal/5 opacity-60"
                      : "border-border bg-white"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-charcoal">
                        {isKn ? act.titleKn : act.titleEn}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${tagBadge.cls}`}
                      >
                        {isKn ? tagBadge.labelKn : tagBadge.labelEn}
                      </span>
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleDecisionChange(act.id, "accepted")}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                          act.status === "accepted"
                            ? "bg-forest text-white shadow-subtle"
                            : "bg-ivory-warm text-charcoal hover:bg-cream border border-border"
                        }`}
                      >
                        {isKn ? "ತಂಡದ ನಿರ್ಧಾರ (Accept)" : "Group Decision"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDecisionChange(act.id, "optional")}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                          act.status === "optional"
                            ? "bg-gold-dark text-white shadow-subtle"
                            : "bg-ivory-warm text-charcoal hover:bg-cream border border-border"
                        }`}
                      >
                        {isKn ? "ಐಚ್ಛಿಕ (Optional)" : "Keep Optional"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDecisionChange(act.id, "rejected")}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                          act.status === "rejected"
                            ? "bg-charcoal text-white shadow-subtle"
                            : "bg-ivory-warm text-charcoal hover:bg-cream border border-border"
                        }`}
                      >
                        {isKn ? "ತಿರಸ್ಕರಿಸಿ (Reject)" : "Reject"}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-charcoal-muted leading-relaxed">
                    {isKn ? act.reasonKn : act.reasonEn}
                  </p>

                  {/* Accessibility Advisory if any */}
                  {!act.isAccessibleForGroup && act.accessibilityNotesEn && (
                    <div className="p-2 rounded bg-error/10 border border-error/20 text-error text-[11px] flex items-start gap-1.5">
                      <AlertCircle size={13} className="shrink-0 mt-0.5" />
                      <span>{isKn ? act.accessibilityNotesKn : act.accessibilityNotesEn}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── SECTION 6: GROUP EXPENSE SPLITTER ── */}
      <ExpenseSplitter
        travellers={groupConfig.travellers}
        expenses={expenses}
        onAddExpense={handleAddExpense}
        onRemoveExpense={handleRemoveExpense}
      />

      {/* Modal Dialog for Traveller Add / Edit */}
      <TravellerModal
        key={editingTraveller ? editingTraveller.id : isModalOpen ? "new" : "closed"}
        isOpen={isModalOpen}
        initialData={editingTraveller}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTraveller(null);
        }}
        onSave={handleSaveTraveller}
      />
    </div>
  );
}
