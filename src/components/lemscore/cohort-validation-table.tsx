import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { simulateProspectOutcome } from "@/lib/lemscore/data";
import { useLemScore } from "@/lib/lemscore/store";
import type { VariantId } from "@/lib/lemscore/types";
import { DemoBadge, InfoPopover } from "./shared";

type PerformanceScope = "all" | VariantId;
type CohortView = "all" | VariantId | "split";
type CohortPreset = "standard" | "detailed";
type CohortMetric =
  | "positiveReply"
  | "meeting"
  | "opportunity"
  | "closedWon"
  | "closedLost";

type OutcomePoint = {
  stage: string;
  historical: number;
  current: number;
};

type StepPerformance = {
  step: string;
  metric: string;
  reached: number;
  historical: number;
  current: number;
};

type StepTemplate = Omit<StepPerformance, "reached"> & { reachedShare: number };

const OVERALL_BENCHMARKS: Record<PerformanceScope, number[]> = {
  all: [6.9, 3.0, 1.7, 0.6],
  A: [7.1, 3.1, 1.8, 0.6],
  B: [6.7, 2.9, 1.6, 0.6],
};

const STEP_TEMPLATES: Record<PerformanceScope, StepTemplate[]> = {
  all: [
    { step: "Email #1", metric: "Opened", reachedShare: 1, historical: 58.4, current: 66.5 },
    { step: "LinkedIn connection request", metric: "Accepted", reachedShare: 0.805, historical: 34.2, current: 37.9 },
    { step: "LinkedIn message", metric: "Engaged", reachedShare: 0.659, historical: 20.6, current: 25.0 },
    { step: "Follow-up email", metric: "Opened", reachedShare: 0.433, historical: 47.8, current: 53.5 },
    { step: "Final email", metric: "Replied", reachedShare: 0.28, historical: 6.8, current: 4.3 },
  ],
  A: [
    { step: "Email #1", metric: "Opened", reachedShare: 1, historical: 58.4, current: 69.0 },
    { step: "LinkedIn connection request", metric: "Accepted", reachedShare: 0.829, historical: 34.2, current: 40.0 },
    { step: "LinkedIn message", metric: "Engaged", reachedShare: 0.707, historical: 20.6, current: 28.0 },
    { step: "Follow-up email", metric: "Opened", reachedShare: 0.476, historical: 47.8, current: 57.0 },
    { step: "Final email", metric: "Replied", reachedShare: 0.305, historical: 6.8, current: 6.0 },
  ],
  B: [
    { step: "Email #1", metric: "Opened", reachedShare: 1, historical: 58.4, current: 64.0 },
    { step: "LinkedIn connection request", metric: "Accepted", reachedShare: 0.78, historical: 34.2, current: 35.7 },
    { step: "LinkedIn message", metric: "Engaged", reachedShare: 0.61, historical: 20.6, current: 21.5 },
    { step: "Follow-up email", metric: "Opened", reachedShare: 0.39, historical: 47.8, current: 49.2 },
    { step: "Final email", metric: "Replied", reachedShare: 0.256, historical: 6.8, current: 2.3 },
  ],
};

const THRESHOLDS: Record<CohortMetric, { good: number; medium: number }> = {
  positiveReply: { good: 8, medium: 5 },
  meeting: { good: 5, medium: 2.5 },
  opportunity: { good: 3, medium: 1.5 },
  closedWon: { good: 2, medium: 0.8 },
  closedLost: { good: 1.5, medium: 2.5 },
};

function performanceScopeLabel(scope: PerformanceScope) {
  return scope === "all" ? "A + B combined" : `Sequence ${scope}`;
}

export function CohortValidationTable() {
  const {
    launchedProspects,
    launchedProspectsFor,
    prospectLaunchSnapshot,
    prospectScore,
  } = useLemScore();
  const hasA = launchedProspectsFor("A").length > 0;
  const hasB = launchedProspectsFor("B").length > 0;
  const hasBoth = hasA && hasB;
  const fallbackScope: PerformanceScope = hasBoth ? "all" : hasA ? "A" : "B";

  const [performanceScope, setPerformanceScope] = useState<PerformanceScope>(fallbackScope);
  const [view, setView] = useState<CohortView>(fallbackScope);
  const [preset, setPreset] = useState<CohortPreset>("detailed");

  useEffect(() => {
    if ((!hasBoth && performanceScope === "all") || (performanceScope === "A" && !hasA) || (performanceScope === "B" && !hasB)) {
      setPerformanceScope(fallbackScope);
    }
    if ((!hasBoth && (view === "all" || view === "split")) || (view === "A" && !hasA) || (view === "B" && !hasB)) {
      setView(fallbackScope);
    }
  }, [fallbackScope, hasA, hasB, hasBoth, performanceScope, view]);

  const observations = useMemo(
    () =>
      launchedProspects.map((prospect) => {
        const snapshot = prospectLaunchSnapshot(prospect.id);
        const score = snapshot?.score ?? prospectScore(prospect.id).score;
        return {
          prospect,
          score,
          frozen: Boolean(snapshot),
          result: simulateProspectOutcome(prospect, score),
        };
      }),
    [launchedProspects, prospectLaunchSnapshot, prospectScore],
  );

  const scopeObservations = observations.filter(
    ({ prospect }) => performanceScope === "all" || prospect.variant === performanceScope,
  );
  const launchedCount = scopeObservations.length;
  if (!launchedCount) return null;

  const rate = (key: "positiveReply" | "meeting" | "opportunity" | "closedWon") =>
    (scopeObservations.filter(({ result }) => result[key]).length / launchedCount) * 100;
  const benchmark = OVERALL_BENCHMARKS[performanceScope];
  const outcomeData: OutcomePoint[] = [
    { stage: "Positive reply", historical: benchmark[0]!, current: rate("positiveReply") },
    { stage: "Meeting", historical: benchmark[1]!, current: rate("meeting") },
    { stage: "Opportunity", historical: benchmark[2]!, current: rate("opportunity") },
    { stage: "Won", historical: benchmark[3]!, current: rate("closedWon") },
  ];
  const stepRows: StepPerformance[] = STEP_TEMPLATES[performanceScope].map((row) => ({
    ...row,
    reached: Math.min(launchedCount, Math.round(launchedCount * row.reachedShare)),
  }));

  const bands =
    preset === "detailed"
      ? [
          { label: "90–100", min: 90, max: 100 },
          { label: "80–89", min: 80, max: 89 },
          { label: "60–79", min: 60, max: 79 },
          { label: "Below 60", min: 0, max: 59 },
        ]
      : [
          { label: "80–100", min: 80, max: 100 },
          { label: "60–79", min: 60, max: 79 },
          { label: "Below 60", min: 0, max: 59 },
        ];

  const variants: Array<VariantId | "all"> =
    view === "split" ? ["A", "B"] : view === "A" || view === "B" ? [view] : ["all"];

  const cohortRows = variants.flatMap((variant) =>
    bands.flatMap((band) => {
      const members = observations.filter(
        ({ prospect, score, frozen }) =>
          frozen &&
          (variant === "all" || prospect.variant === variant) &&
          score >= band.min &&
          score <= band.max,
      );
      if (!members.length) return [];
      const count = (key: CohortMetric) => members.filter(({ result }) => result[key]).length;
      return [
        {
          key: `${variant}-${band.label}`,
          label: `${band.label}${variant === "all" ? "" : ` · ${variant}`}`,
          total: members.length,
          average: Math.round(members.reduce((sum, item) => sum + item.score, 0) / members.length),
          positiveReply: count("positiveReply"),
          meeting: count("meeting"),
          opportunity: count("opportunity"),
          closedWon: count("closedWon"),
          closedLost: count("closedLost"),
        },
      ];
    }),
  );

  const frozenCount = observations.filter(({ frozen }) => frozen).length;

  return (
    <div className="grid bg-surface lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="hidden border-r border-border bg-background lg:block" aria-hidden="true" />
      <div className="space-y-5 px-6 pb-6">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/25 bg-primary/[0.035] px-4 py-3">
          <div>
            <p className="text-[10px] font-semibold tracking-wide text-primary uppercase">Performance scope</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Only variants with prospects actually launched are available here.
            </p>
          </div>
          <Select value={performanceScope} onValueChange={(value) => setPerformanceScope(value as PerformanceScope)}>
            <SelectTrigger className="ml-auto w-44 bg-background" aria-label="Performance A/B scope">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {hasBoth && <SelectItem value="all">A + B combined</SelectItem>}
              {hasA && <SelectItem value="A">Sequence A</SelectItem>}
              {hasB && <SelectItem value="B">Sequence B</SelectItem>}
            </SelectContent>
          </Select>
        </div>

        <OverallOutcomesChart scope={performanceScope} data={outcomeData} launched={launchedCount} />
        <StepPerformanceTable scope={performanceScope} rows={stepRows} launched={launchedCount} />

        <section className="rounded-2xl border-2 border-primary/50 bg-background p-5 shadow-sm">
          <div className="flex flex-wrap items-start gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-primary">Prediction validation by cohort</h2>
                <InfoPopover label="Cohorts are built only from prospects that were actually launched with a lemScore snapshot frozen before sending. No unlaunched A/B variant is injected into this table." />
              </div>
              <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
                Check whether higher pre-send score bands actually produced stronger replies, meetings and downstream outcomes.
              </p>
            </div>
            <div className="ml-auto flex flex-wrap gap-2">
              <Select value={view} onValueChange={(value) => setView(value as CohortView)}>
                <SelectTrigger className="w-40 bg-background" aria-label="A/B cohort view">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hasBoth && <SelectItem value="all">A + B combined</SelectItem>}
                  {hasBoth && <SelectItem value="split">Split A/B</SelectItem>}
                  {hasA && <SelectItem value="A">Sequence A only</SelectItem>}
                  {hasB && <SelectItem value="B">Sequence B only</SelectItem>}
                </SelectContent>
              </Select>
              <Select value={preset} onValueChange={(value) => setPreset(value as CohortPreset)}>
                <SelectTrigger className="w-40 bg-background" aria-label="Score bands">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">3 score bands</SelectItem>
                  <SelectItem value="detailed">4 score bands</SelectItem>
                </SelectContent>
              </Select>
              <DemoBadge />
            </div>
          </div>

          {frozenCount === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-border bg-surface p-5 text-sm text-muted-foreground">
              No pre-send lemScore snapshot exists for the prospects already launched. Activate lemScore before the next launch to validate predictions by cohort.
            </div>
          ) : cohortRows.length ? (
            <>
              <div className="mt-4 overflow-x-auto rounded-xl border border-border">
                <table className="w-full min-w-[780px] border-collapse text-left text-xs">
                  <thead className="bg-surface text-[10px] tracking-wide text-muted-foreground uppercase">
                    <tr>
                      <CohortHead>Launch score</CohortHead>
                      <CohortHead>n</CohortHead>
                      <CohortHead>Mean</CohortHead>
                      <CohortHead>Positive replies</CohortHead>
                      <CohortHead>Meetings</CohortHead>
                      <CohortHead>Opportunities</CohortHead>
                      <CohortHead>Won</CohortHead>
                      <CohortHead>Lost</CohortHead>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortRows.map((row) => (
                      <tr key={row.key} className="border-t border-border bg-card align-top">
                        <td className="whitespace-nowrap px-3 py-3 font-semibold">{row.label}</td>
                        <td className="px-3 py-3 font-semibold tabular-nums">{row.total}</td>
                        <td className="px-3 py-3 tabular-nums">{row.average}</td>
                        <RateCell count={row.positiveReply} denominator={row.total} metric="positiveReply" />
                        <RateCell count={row.meeting} denominator={row.total} metric="meeting" />
                        <RateCell count={row.opportunity} denominator={row.total} metric="opportunity" />
                        <RateCell count={row.closedWon} denominator={row.total} metric="closedWon" />
                        <RateCell count={row.closedLost} denominator={row.total} metric="closedLost" />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">Base = prospects actually launched in each score cohort (n)</span>
                <span className="rounded-md bg-success-soft px-2 py-0.5 font-semibold text-success">Strong</span>
                <span className="rounded-md bg-warning-soft px-2 py-0.5 font-semibold text-warning">Medium</span>
                <span className="rounded-md bg-destructive/10 px-2 py-0.5 font-semibold text-destructive">Weak</span>
                <span>Won: higher is better · Lost: lower is better.</span>
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-border bg-surface p-5 text-sm text-muted-foreground">
              No launched prospects fall inside the selected score bands and A/B scope.
            </div>
          )}

          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            Beta simulation only. Scores are frozen at launch so later edits cannot rewrite the prediction that is being validated.
          </p>
        </section>
      </div>
    </div>
  );
}

function OverallOutcomesChart({
  scope,
  data,
  launched,
}: {
  scope: PerformanceScope;
  data: OutcomePoint[];
  launched: number;
}) {
  const scopeText = performanceScopeLabel(scope);
  const yMax = Math.max(10, Math.ceil(Math.max(...data.map((point) => point.current), 8) + 2));

  return (
    <section className="rounded-2xl border border-border bg-background p-5 shadow-sm">
      <div className="flex flex-wrap items-start gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">Overall outcomes vs benchmark</h2>
            <span className="rounded-full border border-primary/25 bg-primary/[0.04] px-2 py-0.5 text-[11px] font-semibold text-primary">{scopeText}</span>
            <InfoPopover label="Overall business outcomes use only prospects actually launched in the selected A/B scope." />
          </div>
          <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
            {scopeText} vs comparable historical lemlist campaigns. Every current percentage uses the {launched} actually launched prospects in this scope.
          </p>
        </div>
        <DemoBadge className="ml-auto" />
      </div>

      <div className="mt-4 rounded-xl border border-border bg-card p-3">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 12, right: 18, left: 0, bottom: 18 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} interval={0} />
              <YAxis domain={[0, yMax]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={40} />
              <RechartsTooltip
                formatter={(value, name) => [
                  `${Number(value).toFixed(1)}% of launched prospects`,
                  name === "historical" ? "Historical benchmark" : scopeText,
                ]}
                contentStyle={{ borderRadius: 10, borderColor: "var(--border)", background: "var(--background)", fontSize: 12 }}
              />
              <Legend formatter={(value) => (value === "historical" ? "Historical benchmark" : scopeText)} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Line type="monotone" dataKey="historical" stroke="var(--muted-foreground)" strokeWidth={2.5} strokeDasharray="7 5" dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="current" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        Base = {launched} actually launched prospects in {scopeText}. Closed Won remains a downstream outcome influenced by sales execution and product fit.
      </p>
    </section>
  );
}

function StepPerformanceTable({
  scope,
  rows,
  launched,
}: {
  scope: PerformanceScope;
  rows: StepPerformance[];
  launched: number;
}) {
  const scopeText = performanceScopeLabel(scope);
  const example = rows.find((row) => row.step === "LinkedIn message" && row.reached > 0) ?? rows[0]!;
  const exampleShare = launched ? (example.reached / launched) * 100 : 0;

  return (
    <section className="rounded-2xl border border-border bg-background p-5 shadow-sm">
      <div className="flex flex-wrap items-start gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">Step results vs benchmark</h2>
            <span className="rounded-full border border-primary/25 bg-primary/[0.04] px-2 py-0.5 text-[11px] font-semibold text-primary">{scopeText}</span>
            <InfoPopover label="The exposed counts are scoped to the prospects actually launched in this A/B variant. Later steps naturally contain fewer prospects because replies and conditions can stop a sequence earlier." />
          </div>
          <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
            See what happened at each touch for the launched prospects in {scopeText}.
          </p>
        </div>
        <DemoBadge className="ml-auto" />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[1040px] border-collapse text-left text-xs">
          <thead className="bg-surface text-[10px] tracking-wide text-muted-foreground uppercase">
            <tr>
              <CohortHead>Step</CohortHead>
              <CohortHead>Result measured</CohortHead>
              <CohortHead>Prospects exposed</CohortHead>
              <CohortHead>Share of launched</CohortHead>
              <CohortHead>Current result among exposed</CohortHead>
              <CohortHead>Historical benchmark</CohortHead>
              <CohortHead>Difference</CohortHead>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const delta = row.current - row.historical;
              const exposedShare = launched ? (row.reached / launched) * 100 : 0;
              const resultLabel = row.metric.toLowerCase();
              return (
                <tr key={row.step} className="border-t border-border bg-card">
                  <td className="px-3 py-3 font-semibold">{row.step}</td>
                  <td className="px-3 py-3 text-muted-foreground">{row.metric}</td>
                  <td className="px-3 py-3 font-semibold tabular-nums">{row.reached}</td>
                  <td className="px-3 py-3 tabular-nums">{exposedShare.toFixed(1)}%</td>
                  <td className="px-3 py-3 font-semibold tabular-nums">{row.current.toFixed(1)}% {resultLabel}</td>
                  <td className="px-3 py-3 tabular-nums text-muted-foreground">{row.historical.toFixed(1)}% {resultLabel}</td>
                  <td className="px-3 py-3">
                    <span className={cn("inline-flex rounded-md px-2 py-1 font-semibold tabular-nums", delta >= 0 ? "bg-success-soft text-success" : "bg-destructive/10 text-destructive")}>
                      {delta >= 0 ? "+" : ""}{delta.toFixed(1)} pp
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 rounded-lg border border-border bg-surface px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
        <strong className="text-foreground">How to read it:</strong> In {scopeText}, {example.step} reached {example.reached} of the {launched} launched prospects ({exampleShare.toFixed(1)}%). Among those exposed prospects, {example.current.toFixed(1)}% {example.metric.toLowerCase()}.
      </div>
    </section>
  );
}

function CohortHead({ children }: { children: ReactNode }) {
  return <th className="whitespace-nowrap px-3 py-2.5 font-semibold">{children}</th>;
}

function performanceClasses(metric: CohortMetric, actual: number) {
  const threshold = THRESHOLDS[metric];
  if (metric === "closedLost") {
    if (actual <= threshold.good) return "bg-success-soft text-success";
    if (actual <= threshold.medium) return "bg-warning-soft text-warning";
    return "bg-destructive/10 text-destructive";
  }
  if (actual >= threshold.good) return "bg-success-soft text-success";
  if (actual >= threshold.medium) return "bg-warning-soft text-warning";
  return "bg-destructive/10 text-destructive";
}

function RateCell({ count, denominator, metric }: { count: number; denominator: number; metric: CohortMetric }) {
  if (!denominator) {
    return <td className="whitespace-nowrap px-3 py-3 tabular-nums text-muted-foreground">—</td>;
  }
  const actual = (count / denominator) * 100;
  return (
    <td className="px-3 py-3">
      <span className={cn("inline-flex rounded-md px-2 py-1 font-semibold tabular-nums", performanceClasses(metric, actual))}>
        {Math.round(actual)}% · {count}
      </span>
    </td>
  );
}
