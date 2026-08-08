import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  MIN_OUTCOMES_FOR_RECALIBRATION,
  baseCampaign,
  prospects as allProspects,
  simulateProspectOutcome,
} from "./data";
import {
  aggregateMessageScore,
  aggregateProspectSequenceScore,
  aggregateVariantSequenceScore,
  recalibrateAfterOutcomes,
} from "./dynamic-scoring";
import type { CampaignOutcome, ScoreSnapshot, SequenceStep, VariantId } from "./types";

const STORAGE_KEY = "lemscore.beta.v4";

type Filters = {
  search: string;
  band: "all" | "strong" | "medium" | "weak";
  variant: "all" | VariantId;
  persona: string;
  channel: "all" | "email" | "linkedin_message";
};

type Persisted = {
  content: Record<string, { subject?: string; body?: string }>;
  selectedVariant: VariantId;
  selectedStepId: string;
  panelOpen: boolean;
  excluded: string[];
  moved: Record<string, string>;
  filters: Filters;
  sortDir: "asc" | "desc" | null;
  launched: boolean;
  launchedAt: string | null;
  launchSelection: string[];
  launchedProspectIds: string[];
  snapshots: Record<string, ScoreSnapshot>;
  mainTab: "sequence" | "prospects" | "launch" | "performance";
  perfView: "overview" | "steps";
};

const defaultState: Persisted = {
  content: {},
  selectedVariant: "A",
  selectedStepId: "A1",
  panelOpen: true,
  excluded: [],
  moved: {},
  filters: { search: "", band: "all", variant: "all", persona: "all", channel: "all" },
  sortDir: null,
  launched: false,
  launchedAt: null,
  launchSelection: allProspects.map((prospect) => prospect.id),
  launchedProspectIds: [],
  snapshots: {},
  mainTab: "sequence",
  perfView: "overview",
};

function load(): Persisted {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    const excluded = parsed.excluded ?? defaultState.excluded;
    const moved = parsed.moved ?? defaultState.moved;
    const eligibleIds = allProspects
      .filter((prospect) => !excluded.includes(prospect.id) && !moved[prospect.id])
      .map((prospect) => prospect.id);
    return {
      ...defaultState,
      ...parsed,
      filters: { ...defaultState.filters, ...parsed.filters },
      launchSelection: parsed.launchSelection ?? eligibleIds,
      launchedProspectIds:
        parsed.launchedProspectIds ??
        (parsed.launched ? eligibleIds : defaultState.launchedProspectIds),
    };
  } catch {
    return defaultState;
  }
}

type Store = Persisted & {
  update: (patch: Partial<Persisted>) => void;
  reset: () => void;
  steps: (variant: VariantId) => SequenceStep[];
  step: (id: string) => SequenceStep | undefined;
  setStepContent: (id: string, patch: { subject?: string; body?: string }) => void;
  activeProspects: typeof allProspects;
  launchedProspects: typeof allProspects;
  prospectsFor: (variant: VariantId) => typeof allProspects;
  launchedProspectsFor: (variant: VariantId) => typeof allProspects;
  messageScore: (stepId: string) => ReturnType<typeof aggregateMessageScore>;
  prospectScore: (prospectId: string) => ReturnType<typeof aggregateProspectSequenceScore>;
  prospectLaunchSnapshot: (prospectId: string) => ScoreSnapshot | null;
  variantResult: (variant: VariantId) => ReturnType<typeof aggregateVariantSequenceScore>;
  variantScore: (variant: VariantId) => number;
  outcome: (variant: VariantId) => CampaignOutcome | null;
  trendFor: (
    key: string,
    currentScore: number,
    variant: VariantId,
  ) => ReturnType<typeof recalibrateAfterOutcomes> & {
    snapshot: ScoreSnapshot | null;
  };
  launch: (prospectIds?: string[], nextTab?: Persisted["mainTab"]) => void;
  minOutcomes: number;
};

const Ctx = createContext<Store | null>(null);

export function LemScoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }, [state, hydrated]);

  const update = useCallback((patch: Partial<Persisted>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const steps = useCallback(
    (variant: VariantId): SequenceStep[] => {
      const v = baseCampaign.variants.find((x) => x.id === variant)!;
      return v.steps.map((s) => {
        const override = state.content[s.id];
        if (!override) return s;
        return {
          ...s,
          ...(override.subject !== undefined ? { subject: override.subject } : {}),
          ...(override.body !== undefined ? { body: override.body } : {}),
        };
      });
    },
    [state.content],
  );

  const step = useCallback(
    (id: string) => [...steps("A"), ...steps("B")].find((s) => s.id === id),
    [steps],
  );

  const setStepContent = useCallback((id: string, patch: { subject?: string; body?: string }) => {
    setState((prev) => ({
      ...prev,
      content: { ...prev.content, [id]: { ...prev.content[id], ...patch } },
    }));
  }, []);

  const activeProspects = useMemo(
    () => allProspects.filter((p) => !state.excluded.includes(p.id) && !state.moved[p.id]),
    [state.excluded, state.moved],
  );

  const launchedProspects = useMemo(
    () =>
      state.launched
        ? allProspects.filter((prospect) => state.launchedProspectIds.includes(prospect.id))
        : [],
    [state.launched, state.launchedProspectIds],
  );

  const prospectsFor = useCallback(
    (variant: VariantId) => activeProspects.filter((p) => p.variant === variant),
    [activeProspects],
  );

  const launchedProspectsFor = useCallback(
    (variant: VariantId) => launchedProspects.filter((prospect) => prospect.variant === variant),
    [launchedProspects],
  );

  const messageScore = useCallback(
    (stepId: string) => {
      const s = step(stepId)!;
      return aggregateMessageScore(s, prospectsFor(s.variant));
    },
    [step, prospectsFor],
  );

  const prospectScore = useCallback(
    (prospectId: string) => {
      const p = allProspects.find((x) => x.id === prospectId)!;
      return aggregateProspectSequenceScore(steps(p.variant), p);
    },
    [steps],
  );

  const prospectLaunchSnapshot = useCallback(
    (prospectId: string) => state.snapshots[`prospect:${prospectId}`] ?? null,
    [state.snapshots],
  );

  const variantResult = useCallback(
    (variant: VariantId) => {
      const list = state.launched ? launchedProspectsFor(variant) : prospectsFor(variant);
      return aggregateVariantSequenceScore(steps(variant), list);
    },
    [state.launched, prospectsFor, launchedProspectsFor, steps],
  );

  const variantScore = useCallback(
    (variant: VariantId) => variantResult(variant).score,
    [variantResult],
  );

  const outcome = useCallback(
    (variant: VariantId): CampaignOutcome | null => {
      if (!state.launched) return null;
      const variantProspects = launchedProspectsFor(variant);
      const observed = variantProspects.map((prospect) => {
        const frozen = state.snapshots[`prospect:${prospect.id}`];
        const score =
          frozen?.score ?? aggregateProspectSequenceScore(steps(variant), prospect).score;
        return simulateProspectOutcome(prospect, score);
      });
      const count = (key: keyof (typeof observed)[number]) =>
        observed.filter((result) => result[key]).length;
      const denominator = variantProspects.length;
      const positiveReplies = count("positiveReply");
      const opportunities = count("opportunity");
      const contentSteps = steps(variant).filter((item) => item.hasContent).length;
      return {
        variant,
        sends: denominator * contentSteps,
        positiveReplies,
        actualPositiveRate: denominator
          ? Math.round((positiveReplies / denominator) * 1000) / 10
          : 0,
        actualOpportunityRate: denominator
          ? Math.round((opportunities / denominator) * 1000) / 10
          : 0,
        meetings: count("meeting"),
        opportunities,
        closedWon: count("closedWon"),
        closedLost: count("closedLost"),
      };
    },
    [state.launched, state.snapshots, launchedProspectsFor, steps],
  );

  const trendFor = useCallback(
    (key: string, currentScore: number, variant: VariantId) => {
      const snapshot = state.snapshots[key] ?? null;
      if (!snapshot || !state.launched) {
        return {
          score: currentScore,
          trend: "flat" as const,
          explanation: "Not enough outcomes to recalibrate yet.",
          recalibrated: false,
          snapshot,
        };
      }
      return {
        ...recalibrateAfterOutcomes(
          snapshot,
          currentScore,
          outcome(variant),
          MIN_OUTCOMES_FOR_RECALIBRATION,
        ),
        snapshot,
      };
    },
    [state.snapshots, state.launched, outcome],
  );

  const launch = useCallback(
    (prospectIds?: string[], nextTab: Persisted["mainTab"] = "performance") => {
      const selectedIds = prospectIds ?? state.launchSelection;
      const launchList = activeProspects.filter(
        (prospect) =>
          selectedIds.includes(prospect.id) && !state.launchedProspectIds.includes(prospect.id),
      );
      if (!launchList.length) return;
      const snapshots: Record<string, ScoreSnapshot> = {};
      const capturedAt = new Date().toISOString();
      (["A", "B"] as VariantId[]).forEach((variant) => {
        const variantSteps = steps(variant);
        const list = launchList.filter((prospect) => prospect.variant === variant);
        variantSteps
          .filter((s) => s.hasContent)
          .forEach((s) => {
            const r = aggregateMessageScore(s, list);
            snapshots[s.id] = {
              score: r.score,
              predictedPositiveRate: r.prediction.positiveReplyRate,
              predictedOpportunityRate: r.prediction.opportunityRate,
              confidence: r.confidence,
              capturedAt,
            };
          });
        const sequenceResult = aggregateVariantSequenceScore(variantSteps, list);
        snapshots[`variant:${variant}`] = {
          score: sequenceResult.score,
          predictedPositiveRate: sequenceResult.prediction.positiveReplyRate,
          predictedOpportunityRate: sequenceResult.prediction.opportunityRate,
          confidence: sequenceResult.confidence,
          capturedAt,
        };
      });
      launchList.forEach((prospect) => {
        const result = aggregateProspectSequenceScore(steps(prospect.variant), prospect);
        snapshots[`prospect:${prospect.id}`] = {
          score: result.score,
          predictedPositiveRate: result.prediction.positiveReplyRate,
          predictedOpportunityRate: result.prediction.opportunityRate,
          confidence: result.confidence,
          capturedAt,
        };
      });
      const newlyLaunchedIds = launchList.map((prospect) => prospect.id);
      setState((prev) => ({
        ...prev,
        launched: true,
        launchedAt: prev.launchedAt ?? capturedAt,
        launchSelection: prev.launchSelection.filter((id) => !newlyLaunchedIds.includes(id)),
        launchedProspectIds: Array.from(
          new Set([...prev.launchedProspectIds, ...newlyLaunchedIds]),
        ),
        snapshots: { ...prev.snapshots, ...snapshots },
        mainTab: nextTab,
      }));
    },
    [steps, activeProspects, state.launchSelection, state.launchedProspectIds],
  );

  const value = useMemo<Store>(
    () => ({
      ...state,
      update,
      reset: () => {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
          window.localStorage.removeItem("lemscore.beta.v2");
          window.localStorage.removeItem("lemscore.beta.v1");
          window.localStorage.removeItem("lemscore.icp.v1");
        } catch {
          /* localStorage may be unavailable in private browsing */
        }
        setState({ ...defaultState });
      },
      steps,
      step,
      setStepContent,
      activeProspects,
      launchedProspects,
      prospectsFor,
      launchedProspectsFor,
      messageScore,
      prospectScore,
      prospectLaunchSnapshot,
      variantResult,
      variantScore,
      outcome,
      trendFor,
      launch,
      minOutcomes: MIN_OUTCOMES_FOR_RECALIBRATION,
    }),
    [
      state,
      update,
      steps,
      step,
      setStepContent,
      activeProspects,
      launchedProspects,
      prospectsFor,
      launchedProspectsFor,
      messageScore,
      prospectScore,
      prospectLaunchSnapshot,
      variantResult,
      variantScore,
      outcome,
      trendFor,
      launch,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLemScore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLemScore must be used inside LemScoreProvider");
  return ctx;
}

export type { Filters };
