import { useMemo, useState } from "react";
import { InfoPopover, DemoBadge } from "./shared";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Metric = "positiveReply" | "meeting" | "opportunity" | "closedWon" | "closedLost";
type View = "all" | "A" | "B" | "split";
type Preset = "standard" | "detailed";

type DemoRow = {
  label: string;
  total: number;
  average: number;
  positiveReply: number;
  meeting: number;
  opportunity: number;
  closedWon: number;
  closedLost: number;
};

const A_ROWS: DemoRow[] = [
  { label: "90–100", total: 24, average: 93, positiveReply: 4, meeting: 2, opportunity: 1, closedWon: 1, closedLost: 0 },
  { label: "80–89", total: 31, average: 84, positiveReply: 3, meeting: 2, opportunity: 1, closedWon: 1, closedLost: 1 },
  { label: "60–79", total: 28, average: 68, positiveReply: 2, meeting: 1, opportunity: 0, closedWon: 0, closedLost: 1 },
  { label: "Below 60", total: 19, average: 54, positiveReply: 0, meeting: 0, opportunity: 0, closedWon: 0, closedLost: 1 },
];

const B_ROWS: DemoRow[] = [
  { label: "90–100", total: 18, average: 95, positiveReply: 4, meeting: 2, opportunity: 1, closedWon: 1, closedLost: 0 },
  { label: "80–89", total: 27, average: 85, positiveReply: 4, meeting: 2, opportunity: 1, closedWon: 1, closedLost: 1 },
  { label: "60–79", total: 34, average: 69, positiveReply: 3, meeting: 1, opportunity: 1, closedWon: 0, closedLost: 2 },
  { label: "Below 60", total: 22, average: 51, positiveReply: 1, meeting: 0, opportunity: 0, closedWon: 0, closedLost: 2 },
];

const THRESHOLDS: Record<Metric, { good: number; medium: number; inverse?: boolean }> = {
  positiveReply: { good: 12, medium: 6 },
  meeting: { good: 6, medium: 3 },
  opportunity: { good: 3, medium: 1.5 },
  closedWon: { good: 1.5, medium: 0.5 },
  closedLost: { good: 1.5, medium: 3, inverse: true },
};

function combineRows(a: DemoRow[], b: DemoRow[]): DemoRow[] {
  return a.map((row, index) => {
    const other = b[index]!;
    const total = row.total + other.total;
    return {
      label: row.label,
      total,
      average: Math.round((row.average * row.total + other.average * other.total) / total),
      positiveReply: row.positiveReply + other.positiveReply,
      meeting: row.meeting + other.meeting,
      opportunity: row.opportunity + other.opportunity,
      closedWon: row.closedWon + other.closedWon,
      closedLost: row.closedLost + other.closedLost,
    };
  });
}

function standardRows(rows: DemoRow[]): DemoRow[] {
  const high = rows.slice(0, 2);
  const total = high.reduce((sum, row) => sum + row.total, 0);
  const merged: DemoRow = {
    label: "80–100",
    total,
    average: Math.round(high.reduce((sum, row) => sum + row.average * row.total, 0) / total),
    positiveReply: high.reduce((sum, row) => sum + row.positiveReply, 0),
    meeting: high.reduce((sum, row) => sum + row.meeting, 0),
    opportunity: high.reduce((sum, row) => sum + row.opportunity, 0),
    closedWon: high.reduce((sum, row) => sum + row.closedWon, 0),
    closedLost: high.reduce((sum, row) => sum + row.closedLost, 0),
  };
  return [merged, ...rows.slice(2)];
}

function withVariant(rows: DemoRow[], variant: "A" | "B") {
  return rows.map((row) => ({ ...row, label: `${row.label} · ${variant}` }));
}

export function DemoCohortValidationTable() {
  const [view, setView] = useState<View>("all");
  const [preset, setPreset] = useState<Preset>("detailed");

  const rows = useMemo(() => {
    let selected: DemoRow[];
    if (view === "A") selected = A_ROWS;
    else if (view === "B") selected = B_ROWS;
    else if (view === "split") selected = [...withVariant(A_ROWS, "A"), ...withVariant(B_ROWS, "B")];
    else selected = combineRows(A_ROWS, B_ROWS);

    if (preset === "standard" && view !== "split") return standardRows(selected);
    if (preset === "standard" && view === "split") {
      return [...withVariant(standardRows(A_ROWS), "A"), ...withVariant(standardRows(B_ROWS), "B")];
    }
    return selected;
  }, [view, preset]);

  return (
    <div className="grid bg-surface lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="hidden border-r border-border bg-background lg:block" aria-hidden="true" />
      <div className="px-6 pb-6">
        <section className="rounded-2xl border-2 border-primary/50 bg-background p-5 shadow-sm">
          <div className="flex flex-wrap items-start gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-primary">Prediction validation by cohort</h2>
                <InfoPopover label="Illustrative demo outcomes. The layout and cohort logic stay the same; these values simply make the beta demo readable before real campaign data exists." />
              </div>
              <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
                Check whether higher pre-send score bands actually produced stronger replies, meetings and downstream outcomes.
              </p>
            </div>
            <div className="ml-auto flex flex-wrap gap-2">
              <Select value={view} onValueChange={(value) => setView(value as View)}>
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
              <Select value={preset} onValueChange={(value) => setPreset(value as Preset)}>
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

          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[780px] border-collapse text-left text-xs">
              <thead className="bg-surface text-[10px] tracking-wide text-muted-foreground uppercase">
                <tr>
                  <Head>Launch score</Head>
                  <Head>n</Head>
                  <Head>Mean</Head>
                  <Head>Positive replies</Head>
                  <Head>Meetings</Head>
                  <Head>Opportunities</Head>
                  <Head>Won</Head>
                  <Head>Lost</Head>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-t border-border bg-card align-top">
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
            <span className="font-semibold text-foreground">Base = illustrative launched prospects in each score cohort (n)</span>
            <span className="rounded-md bg-success-soft px-2 py-0.5 font-semibold text-success">Strong</span>
            <span className="rounded-md bg-warning-soft px-2 py-0.5 font-semibold text-warning">Medium</span>
            <span className="rounded-md bg-destructive/10 px-2 py-0.5 font-semibold text-destructive">Weak</span>
            <span>Won: higher is better · Lost: lower is better.</span>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Beta simulation only. Scores are frozen at launch so later edits cannot rewrite the prediction that is being validated.
          </p>
        </section>
      </div>
    </div>
  );
}

function Head({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2.5 font-semibold">{children}</th>;
}

function RateCell({
  count,
  denominator,
  metric,
}: {
  count: number;
  denominator: number;
  metric: Metric;
}) {
  const rate = denominator ? (count / denominator) * 100 : 0;
  const threshold = THRESHOLDS[metric];
  const strong = threshold.inverse ? rate <= threshold.good : rate >= threshold.good;
  const medium = threshold.inverse
    ? rate > threshold.good && rate <= threshold.medium
    : rate < threshold.good && rate >= threshold.medium;

  return (
    <td className="px-3 py-3">
      <span
        className={cn(
          "inline-flex min-w-[58px] justify-center rounded-md px-2 py-1 font-semibold tabular-nums",
          strong
            ? "bg-success-soft text-success"
            : medium
              ? "bg-warning-soft text-warning"
              : "bg-destructive/10 text-destructive",
        )}
      >
        {Math.round(rate)}% · {count}
      </span>
    </td>
  );
}
