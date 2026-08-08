import { useState, type ReactNode } from "react";
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
import type { VariantId } from "@/lib/lemscore/types";
import { DemoBadge, InfoPopover } from "./shared";

type CohortView = "all" | VariantId | "split";
type CohortPreset = "standard" | "detailed";
type CohortMetric =
  | "positiveReply"
  | "meeting"
  | "opportunity"
  | "closedWon"
  | "closedLost";

type DemoCohortSeed = {
  variant: VariantId;
  label: "90–100" | "80–89" | "60–79" | "Below 60";
  min: number;
  max: number;
  total: number;
  average: number;
  positiveReply: number;
  meeting: number;
  opportunity: number;
  closedWon: number;
  closedLost: number;
};

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

const LAUNCHED_PROSPECTS = 164;

const OVERALL_OUTCOMES: OutcomePoint[] = [
  { stage: "Positive reply", historical: 6.9, current: 8.8 },
  { stage: "Meeting", historical: 3.0, current: 4.4 },
  { stage: "Opportunity", historical: 1.7, current: 2.8 },
  { stage: "Won", historical: 0.6, current: 1.2 },
];

const STEP_PERFORMANCE: StepPerformance[] = [
  { step: "Email #1", metric: "Open rate", reached: 164, historical: 58.4, current: 66.5 },
  {
    step: "LinkedIn connection request",
    metric: "Acceptance rate",
    reached: 132,
    historical: 34.2,
    current: 37.9,
  },
  {
    step: "LinkedIn message",
    metric: "Engagement rate",
    reached: 108,
    historical: 20.6,
    current: 25.0,
  },
  {
    step: "Follow-up email",
    metric: "Open rate",
    reached: 71,
    historical: 47.8,
    current: 53.5,
  },
  {
    step: "Final email",
    metric: "Reply rate",
    reached: 46,
    historical: 6.8,
    current: 4.3,
  },
];

const DEMO_COHORTS: DemoCohortSeed[] = [
  {
    variant: "A",
    label: "90–100",
    min: 90,
    max: 100,
    total: 160,
    average: 93,
    positiveReply: 19,
    meeting: 12,
    opportunity: 8,
    closedWon: 5,
    closedLost: 2,
  },
  {
    variant: "A",
    label: "80–89",
    min: 80,
    max: 89,
    total: 220,
    average: 84,
    positiveReply: 20,
    meeting: 13,
    opportunity: 9,
    closedWon: 5,
    closedLost: 4,
  },
  {
    variant: "A",
    label: "60–79",
    min: 60,
    max: 79,
    total: 260,
    average: 69,
    positiveReply: 16,
    meeting: 9,
    opportunity: 6,
    closedWon: 2,
    closedLost: 7,
  },
  {
    variant: "A",
    label: "Below 60",
    min: 0,
    max: 59,
    total: 200,
    average: 51,
    positiveReply: 6,
    meeting: 2,
    opportunity: 1,
    closedWon: 0,
    closedLost: 6,
  },
  {
    variant: "B",
    label: "90–100",
    min: 90,
    max: 100,
    total: 120,
    average: 92,
    positiveReply: 12,
    meeting: 7,
    opportunity: 5,
    closedWon: 3,
    closedLost: 1,
  },
  {
    variant: "B",
    label: "80–89",
    min: 80,
    max: 89,
    total: 180,
    average: 83,
    positiveReply: 14,
    meeting: 8,
    opportunity: 5,
    closedWon: 3,
    closedLost: 3,
  },
  {
    variant: "B",
    label: "60–79",
    min: 60,
    max: 79,
    total: 240,
    average: 68,
    positiveReply: 12,
    meeting: 6,
    opportunity: 3,
    closedWon: 1,
    closedLost: 6,
  },
  {
    variant: "B",
    label: "Below 60",
    min: 0,
    max: 59,
    total: 170,
    average: 50,
    positiveReply: 4,
    meeting: 1,
    opportunity: 0,
    closedWon: 0,
    closedLost: 6,
  },
];

const THRESHOLDS: Record<CohortMetric, { good: number; medium: number }> = {
  positiveReply: { good: 8, medium: 5 },
  meeting: { good: 5, medium: 2.5 },
  opportunity: { good: 3, medium: 1.5 },
  closedWon: { good: 2, medium: 0.8 },
  closedLost: { good: 1.5, medium: 2.5 },
};

export function CohortValidationTable() {
  const [view, setView] = useState<CohortView>("all");
  const [preset, setPreset] = useState<CohortPreset>("detailed");
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
  const sum = (items: DemoCohortSeed[], key: keyof DemoCohortSeed) =>
    items.reduce((total, item) => total + Number(item[key]), 0);

  const rows = variants.flatMap((variant) =>
    bands.map((band) => {
      const members = DEMO_COHORTS.filter(
        (item) =>
          (variant === "all" || item.variant === variant) &&
          item.min >= band.min &&
          item.max <= band.max,
      );
      const total = sum(members, "total");
      return {
        key: `${variant}-${band.label}`,
        label: `${band.label}${variant === "all" ? "" : ` · ${variant}`}`,
        total,
        average: total
          ? Math.round(
              members.reduce((score, item) => score + item.average * item.total, 0) / total,
            )
          : null,
        positiveReply: sum(members, "positiveReply"),
        meeting: sum(members, "meeting"),
        opportunity: sum(members, "opportunity"),
        closedWon: sum(members, "closedWon"),
        closedLost: sum(members, "closedLost"),
      };
    }),
  );

  return (
    <div className="grid bg-surface lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="hidden border-r border-border bg-background lg:block" aria-hidden="true" />
      <div className="space-y-5 px-6 pb-6">
        <OverallOutcomesChart />
        <StepPerformanceTable />

        <section className="rounded-2xl border-2 border-primary/50 bg-background p-5 shadow-sm">
          <div className="flex flex-wrap items-start gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-primary">
                  Prediction validation by cohort
                </h2>
                <InfoPopover label="This table validates lemScore on business outcomes only. Each percentage uses the score cohort size n as its denominator. Delivery, opens and channel engagement are assessed separately in Step performance because not every prospect reaches every automated step." />
              </div>
              <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
                Do higher pre-send score bands produce more positive replies, meetings,
                opportunities and wins? These outcomes use the cohort size as one common base.
              </p>
            </div>
            <div className="ml-auto flex flex-wrap gap-2">
              <Select value={view} onValueChange={(value) => setView(value as CohortView)}>
                <SelectTrigger className="w-40 bg-background" aria-label="A/B cohort view">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">A + B combined</SelectItem>
                  <SelectItem value="split">Split A/B</SelectItem>
                  <SelectItem value="A">Sequence A only</SelectItem>
                  <SelectItem value="B">Sequence B only</SelectItem>
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

          <div className="mt-4 rounded-lg border border-success/30 bg-success-soft px-3 py-2 text-xs font-medium text-success">
            Demo takeaway: higher pre-send score cohorts consistently generate stronger downstream outcomes.
          </div>

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
                {rows.map((row) => (
                  <tr key={row.key} className="border-t border-border bg-card align-top">
                    <td className="whitespace-nowrap px-3 py-3 font-semibold">{row.label}</td>
                    <td className="px-3 py-3 font-semibold tabular-nums">{row.total}</td>
                    <td className="px-3 py-3 tabular-nums">{row.average ?? "—"}</td>
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
            <span className="font-semibold text-foreground">Base = prospects in each score cohort (n)</span>
            <span className="rounded-md bg-success-soft px-2 py-0.5 font-semibold text-success">Strong</span>
            <span className="rounded-md bg-warning-soft px-2 py-0.5 font-semibold text-warning">Medium</span>
            <span className="rounded-md bg-destructive/10 px-2 py-0.5 font-semibold text-destructive">Weak</span>
            <span>Won: higher is better · Lost: lower is better.</span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            Demo data only. Step-level metrics are deliberately kept out of this validation table so
            a strong early message is not penalized simply because fewer prospects need later steps.
            Closed Won is a downstream business outcome and is also influenced by sales execution and product fit.
          </p>
        </section>
      </div>
    </div>
  );
}

function OverallOutcomesChart() {
  return (
    <section className="rounded-2xl border border-border bg-background p-5 shadow-sm">
      <div className="flex flex-wrap items-start gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">Overall outcomes vs benchmark</h2>
            <InfoPopover label="Overall business outcomes always use the prospects launched at the start as the denominator. It does not matter whether a prospect replied by email, LinkedIn or after a follow-up." />
          </div>
          <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
            Current campaign vs comparable historical lemlist campaigns. Every percentage is based
            on the initial launched prospects.
          </p>
        </div>
        <DemoBadge className="ml-auto" />
      </div>

      <div className="mt-4 rounded-xl border border-border bg-card p-3">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={OVERALL_OUTCOMES} margin={{ top: 12, right: 18, left: 0, bottom: 18 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="stage"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
                interval={0}
              />
              <YAxis
                domain={[0, 10]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <RechartsTooltip
                formatter={(value, name) => [
                  `${Number(value).toFixed(1)}% of launched prospects`,
                  name === "historical" ? "Historical benchmark" : "Current campaign",
                ]}
                contentStyle={{
                  borderRadius: 10,
                  borderColor: "var(--border)",
                  background: "var(--background)",
                  fontSize: 12,
                }}
              />
              <Legend
                formatter={(value) =>
                  value === "historical" ? "Historical benchmark" : "Current campaign"
                }
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              <Line
                type="monotone"
                dataKey="historical"
                stroke="var(--muted-foreground)"
                strokeWidth={2.5}
                strokeDasharray="7 5"
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="current"
                stroke="var(--primary)"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        Base = initial launched prospects. A prospect counts in the outcome regardless of which
        message or channel produced it. Closed Won is also influenced by sales execution and product fit,
        so it should be read as a final business outcome rather than a pure outreach-quality metric.
      </p>
    </section>
  );
}

function StepPerformanceTable() {
  return (
    <section className="rounded-2xl border border-border bg-background p-5 shadow-sm">
      <div className="flex flex-wrap items-start gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">Step performance vs benchmark</h2>
            <InfoPopover label="Exposed share tells you how much of the launched audience actually reached the step. Performance is then calculated only among those exposed prospects, so later steps are not penalized when earlier steps already converted or stopped some prospects." />
          </div>
          <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
            Separate how many prospects reached each touch from how well that touch performed once reached.
          </p>
        </div>
        <DemoBadge className="ml-auto" />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[1040px] border-collapse text-left text-xs">
          <thead className="bg-surface text-[10px] tracking-wide text-muted-foreground uppercase">
            <tr>
              <CohortHead>Step</CohortHead>
              <CohortHead>Metric</CohortHead>
              <CohortHead>Prospects exposed</CohortHead>
              <CohortHead>Share of launched</CohortHead>
              <CohortHead>Performance on exposed prospects</CohortHead>
              <CohortHead>Historical benchmark</CohortHead>
              <CohortHead>Difference</CohortHead>
            </tr>
          </thead>
          <tbody>
            {STEP_PERFORMANCE.map((row) => {
              const delta = row.current - row.historical;
              const exposedShare = (row.reached / LAUNCHED_PROSPECTS) * 100;
              return (
                <tr key={row.step} className="border-t border-border bg-card">
                  <td className="px-3 py-3 font-semibold">{row.step}</td>
                  <td className="px-3 py-3 text-muted-foreground">{row.metric}</td>
                  <td className="px-3 py-3 font-semibold tabular-nums">{row.reached}</td>
                  <td className="px-3 py-3 tabular-nums">{exposedShare.toFixed(1)}%</td>
                  <td className="px-3 py-3 font-semibold tabular-nums">{row.current.toFixed(1)}%</td>
                  <td className="px-3 py-3 tabular-nums text-muted-foreground">
                    {row.historical.toFixed(1)}%
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-md px-2 py-1 font-semibold tabular-nums",
                        delta >= 0
                          ? "bg-success-soft text-success"
                          : "bg-destructive/10 text-destructive",
                      )}
                    >
                      {delta >= 0 ? "+" : ""}
                      {delta.toFixed(1)} pp
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 rounded-lg border border-border bg-surface px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
        <strong className="text-foreground">How to read it:</strong> LinkedIn message reached 108 of the 164 launched prospects
        (65.9%). Its 25.0% performance is calculated only among those 108 exposed prospects, not among all 164.
        Sample size is therefore dynamic: n = prospects exposed to each step, and confidence improves as that n grows.
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

function RateCell({
  count,
  denominator,
  metric,
}: {
  count: number;
  denominator: number;
  metric: CohortMetric;
}) {
  if (!denominator) {
    return <td className="whitespace-nowrap px-3 py-3 tabular-nums text-muted-foreground">—</td>;
  }
  const actual = (count / denominator) * 100;
  return (
    <td className="px-3 py-3">
      <span
        className={cn(
          "inline-flex rounded-md px-2 py-1 font-semibold tabular-nums",
          performanceClasses(metric, actual),
        )}
      >
        {Math.round(actual)}% · {count}
      </span>
    </td>
  );
}