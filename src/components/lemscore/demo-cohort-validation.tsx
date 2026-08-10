import { InfoPopover, DemoBadge } from "./shared";
import { cn } from "@/lib/utils";

type Metric = "positiveReply" | "meeting" | "opportunity" | "closedWon" | "closedLost";

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

const DEMO_ROWS: DemoRow[] = [
  {
    label: "90–100",
    total: 42,
    average: 94,
    positiveReply: 8,
    meeting: 4,
    opportunity: 2,
    closedWon: 1,
    closedLost: 0,
  },
  {
    label: "80–89",
    total: 68,
    average: 84,
    positiveReply: 8,
    meeting: 4,
    opportunity: 2,
    closedWon: 1,
    closedLost: 1,
  },
  {
    label: "60–79",
    total: 74,
    average: 71,
    positiveReply: 5,
    meeting: 2,
    opportunity: 1,
    closedWon: 0,
    closedLost: 1,
  },
  {
    label: "Below 60",
    total: 56,
    average: 52,
    positiveReply: 1,
    meeting: 0,
    opportunity: 0,
    closedWon: 0,
    closedLost: 2,
  },
];

const THRESHOLDS: Record<Metric, { good: number; medium: number; inverse?: boolean }> = {
  positiveReply: { good: 12, medium: 6 },
  meeting: { good: 6, medium: 3 },
  opportunity: { good: 3, medium: 1.5 },
  closedWon: { good: 1.5, medium: 0.5 },
  closedLost: { good: 1.5, medium: 3, inverse: true },
};

export function DemoCohortValidationTable() {
  return (
    <div className="grid bg-surface lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="hidden border-r border-border bg-background lg:block" aria-hidden="true" />
      <div className="px-6 pb-6">
        <section className="rounded-2xl border-2 border-primary/50 bg-background p-5 shadow-sm">
          <div className="flex flex-wrap items-start gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-primary">Prediction validation by cohort</h2>
                <InfoPopover label="Illustrative 14-day demo outcomes. Scores are assumed to have been frozen before launch, then compared with downstream outcomes to show how lemScore would be validated and recalibrated on real campaign data." />
              </div>
              <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
                Illustrative 14-day outcome simulation: do higher pre-send score bands actually produce stronger positive replies, meetings and downstream outcomes?
              </p>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium">
                A + B combined
              </div>
              <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium">
                4 score bands
              </div>
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
                {DEMO_ROWS.map((row) => (
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
            <span className="font-semibold text-foreground">Illustrative cohort sizes and outcomes — not real lemlist customer results.</span>
            <span className="rounded-md bg-success-soft px-2 py-0.5 font-semibold text-success">Higher score → stronger outcomes</span>
            <span>Scores are frozen at launch so later edits cannot rewrite the prediction being validated.</span>
          </div>
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
