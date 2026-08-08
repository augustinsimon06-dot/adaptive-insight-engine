import { useState, type ReactNode } from "react";
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
  | "delivered"
  | "opened"
  | "clicked"
  | "linkedinEngaged"
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
  delivered: number;
  opened: number;
  clicked: number;
  linkedinEngaged: number;
  positiveReply: number;
  meeting: number;
  opportunity: number;
  closedWon: number;
  closedLost: number;
};

const DEMO_COHORTS: DemoCohortSeed[] = [
  { variant: "A", label: "90–100", min: 90, max: 100, total: 160, average: 93, delivered: 157, opened: 118, clicked: 30, linkedinEngaged: 43, positiveReply: 19, meeting: 12, opportunity: 8, closedWon: 5, closedLost: 2 },
  { variant: "A", label: "80–89", min: 80, max: 89, total: 220, average: 84, delivered: 214, opened: 148, clicked: 34, linkedinEngaged: 50, positiveReply: 20, meeting: 13, opportunity: 9, closedWon: 5, closedLost: 4 },
  { variant: "A", label: "60–79", min: 60, max: 79, total: 260, average: 69, delivered: 246, opened: 139, clicked: 27, linkedinEngaged: 45, positiveReply: 16, meeting: 9, opportunity: 6, closedWon: 2, closedLost: 7 },
  { variant: "A", label: "Below 60", min: 0, max: 59, total: 200, average: 51, delivered: 184, opened: 81, clicked: 12, linkedinEngaged: 20, positiveReply: 6, meeting: 2, opportunity: 1, closedWon: 0, closedLost: 6 },
  { variant: "B", label: "90–100", min: 90, max: 100, total: 120, average: 92, delivered: 117, opened: 85, clicked: 21, linkedinEngaged: 30, positiveReply: 12, meeting: 7, opportunity: 5, closedWon: 3, closedLost: 1 },
  { variant: "B", label: "80–89", min: 80, max: 89, total: 180, average: 83, delivered: 174, opened: 115, clicked: 25, linkedinEngaged: 37, positiveReply: 14, meeting: 8, opportunity: 5, closedWon: 3, closedLost: 3 },
  { variant: "B", label: "60–79", min: 60, max: 79, total: 240, average: 68, delivered: 226, opened: 121, clicked: 21, linkedinEngaged: 34, positiveReply: 12, meeting: 6, opportunity: 3, closedWon: 1, closedLost: 6 },
  { variant: "B", label: "Below 60", min: 0, max: 59, total: 170, average: 50, delivered: 155, opened: 65, clicked: 9, linkedinEngaged: 16, positiveReply: 4, meeting: 1, opportunity: 0, closedWon: 0, closedLost: 6 },
];

const THRESHOLDS: Record<CohortMetric, { good: number; medium: number }> = {
  delivered: { good: 97, medium: 94 },
  opened: { good: 65, medium: 50 },
  clicked: { good: 14, medium: 9 },
  linkedinEngaged: { good: 20, medium: 14 },
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
        delivered: sum(members, "delivered"),
        opened: sum(members, "opened"),
        clicked: sum(members, "clicked"),
        linkedinEngaged: sum(members, "linkedinEngaged"),
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
      <div className="px-6 pb-6">
        <section className="rounded-2xl border-2 border-primary/50 bg-background p-5 shadow-sm">
          <div className="flex flex-wrap items-start gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-primary">
                  Prediction validation by cohort
                </h2>
                <InfoPopover label="Prospects are grouped by the score frozen before launch. If lemScore is useful, higher-score cohorts should produce stronger real business outcomes after sending." />
              </div>
              <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
                The client-facing test is simple: do higher pre-send score bands actually generate
                stronger outcomes? Colours represent actual performance, not whether the model beat
                its own forecast.
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
            <table className="w-full min-w-[1180px] border-collapse text-left text-xs">
              <thead className="bg-surface text-[10px] tracking-wide text-muted-foreground uppercase">
                <tr>
                  <CohortHead>Launch score</CohortHead>
                  <CohortHead>n</CohortHead>
                  <CohortHead>Mean</CohortHead>
                  <CohortHead>Delivered</CohortHead>
                  <CohortHead>Opened</CohortHead>
                  <CohortHead>Clicked</CohortHead>
                  <CohortHead>LinkedIn engaged</CohortHead>
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
                    <RateCell count={row.delivered} denominator={row.total} metric="delivered" />
                    <RateCell count={row.opened} denominator={row.delivered} metric="opened" />
                    <RateCell count={row.clicked} denominator={row.delivered} metric="clicked" />
                    <RateCell count={row.linkedinEngaged} denominator={row.total} metric="linkedinEngaged" />
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
            <span className="font-semibold text-foreground">Colour = actual performance</span>
            <span className="rounded-md bg-success-soft px-2 py-0.5 font-semibold text-success">Strong</span>
            <span className="rounded-md bg-warning-soft px-2 py-0.5 font-semibold text-warning">Medium</span>
            <span className="rounded-md bg-destructive/10 px-2 py-0.5 font-semibold text-destructive">Weak</span>
            <span>Won: higher is better · Lost: lower is better.</span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            Demo data only. In production, model calibration can still compare predicted vs actual
            outcomes in the background, while the salesperson sees the simpler business result.
          </p>
        </section>
      </div>
    </div>
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
