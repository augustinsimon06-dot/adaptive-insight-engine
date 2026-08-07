import { useState } from "react";
import { useLemScore } from "@/lib/lemscore/store";
import { channelLabel } from "@/lib/lemscore/benchmarks";
import { simulatedOutcomes, stepMetrics } from "@/lib/lemscore/data";
import type { VariantId } from "@/lib/lemscore/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DemoBadge, ScorePill, TrendIndicator } from "./shared";

export function PerformanceScreen() {
  const {
    perfView,
    update,
    launched,
    steps,
    messageScore,
    trendFor,
    variantScore,
    outcome,
    activeProspects,
    prospectsFor,
  } = useLemScore();
  const [stepId, setStepId] = useState("A1");
  const [range, setRange] = useState("last_30");
  const [channel, setChannel] = useState("all");

  if (!launched) {
    return (
      <div className="min-h-[calc(100vh-6.5rem)] bg-surface px-6 py-10">
        <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-6 text-center">
          <h2 className="text-base font-semibold">No results yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Launch the demo campaign to freeze the lemScore snapshots and unlock simulated outcomes.
          </p>
          <Button className="mt-4" onClick={() => update({ mainTab: "launch" })}>
            Go to Launch
          </Button>
        </div>
      </div>
    );
  }

  const contentSteps = [...steps("A"), ...steps("B")].filter(
    (s) => s.hasContent && (channel === "all" || s.channel === channel),
  );
  const selectedStep = contentSteps.find((s) => s.id === stepId) ?? contentSteps[0]!;
  const totals = Object.values(stepMetrics).reduce(
    (sum, metric) => ({
      sent: sum.sent + metric.sent,
      opened: sum.opened + metric.opened,
      clicked: sum.clicked + metric.clicked,
      replied: sum.replied + metric.replied,
    }),
    { sent: 0, opened: 0, clicked: 0, replied: 0 },
  );
  const emailSent = Object.entries(stepMetrics)
    .filter(([id]) => id.endsWith("1") || id.endsWith("5"))
    .reduce((sum, [, metric]) => sum + metric.sent, 0);

  const variantDetail = (v: VariantId) => {
    const current = variantScore(v);
    const t = trendFor(`variant:${v}`, current, v);
    const out = outcome(v)!;
    return {
      trend: t.trend,
      launchScore: t.snapshot?.score ?? null,
      currentScore: t.score,
      predictedPositive: t.snapshot?.predictedPositiveRate ?? 0,
      actualPositive: out.actualPositiveRate,
      predictedOpportunity: t.snapshot?.predictedOpportunityRate ?? 0,
      actualOpportunity: out.actualOpportunityRate,
      sends: out.sends,
      confidence: t.snapshot?.confidence ?? "Medium",
      explanation: t.explanation,
    };
  };

  return (
    <div className="min-h-[calc(100vh-6.5rem)] bg-surface">
      <div className="grid gap-0 lg:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="border-r border-border bg-background p-4">
          <nav className="space-y-1" aria-label="Performance views">
            {(["overview", "steps"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-current={perfView === v ? "page" : undefined}
                onClick={() => update({ perfView: v })}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  perfView === v
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {v === "overview" ? "Overview" : "Step details"}
              </button>
            ))}
          </nav>
        </aside>

        <div className="space-y-5 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Filter
              label="Date range"
              value={range}
              onChange={setRange}
              options={[
                ["last_7", "Last 7 days"],
                ["last_30", "Last 30 days"],
                ["all", "All time"],
              ]}
            />
            <Filter
              label="Sender"
              value="all"
              onChange={() => undefined}
              options={[["all", "All senders"]]}
            />
            <Filter
              label="Channel"
              value={channel}
              onChange={setChannel}
              options={[
                ["all", "All channels"],
                ["email", "Email"],
                ["linkedin_message", "LinkedIn message"],
              ]}
            />
            <DemoBadge />
          </div>

          {perfView === "overview" ? (
            <>
              <section>
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold">Campaign statistics</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Standard campaign KPIs remain visible alongside lemScore.
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Kpi label="Prospects" value={activeProspects.length} />
                  <Kpi
                    label="Prospects launched"
                    value={activeProspects.length}
                    helper={`${prospectsFor("A").length} A · ${prospectsFor("B").length} B`}
                  />
                  <Kpi
                    label="Prospects reached"
                    value={activeProspects.length - 1}
                    helper={`${Math.round(((activeProspects.length - 1) / activeProspects.length) * 100)}%`}
                  />
                  <Kpi label="Messages sent" value={totals.sent} />
                  <Kpi label="Messages not sent" value={0} />
                  <Kpi
                    label="Delivered"
                    value={totals.sent - 1}
                    helper={`${Math.round(((totals.sent - 1) / totals.sent) * 100)}%`}
                  />
                  <Kpi
                    label="Email opened"
                    value={`${Math.round((totals.opened / emailSent) * 100)}%`}
                    helper={`${totals.opened} of ${emailSent} emails`}
                  />
                  <Kpi
                    label="Email clicked"
                    value={`${Math.round((totals.clicked / emailSent) * 100)}%`}
                    helper={`${totals.clicked} of ${emailSent} emails`}
                  />
                  <Kpi
                    label="Replies"
                    value={totals.replied}
                    helper={`${Math.round((totals.replied / totals.sent) * 1000) / 10}% of messages`}
                  />
                </div>
              </section>

              <section className="rounded-2xl border-2 border-primary/50 bg-background p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-primary">
                      lemScore prediction tracking
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      The arrow compares post-launch outcomes with the score frozen at launch. It
                      does not replace A/B results.
                    </p>
                  </div>
                  <DemoBadge className="ml-auto" />
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {(["A", "B"] as VariantId[]).map((v) => {
                    const detail = variantDetail(v);
                    return (
                      <div
                        key={v}
                        className="rounded-xl border border-primary/25 bg-primary/[0.025] p-4"
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold">Sequence {v}</h3>
                          <TrendIndicator detail={detail} className="text-base" />
                          <span className="ml-auto text-xs text-muted-foreground">
                            {detail.sends} sends analyzed
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <MiniMetric
                            label="Predicted positive replies"
                            value={`${detail.predictedPositive}%`}
                          />
                          <MiniMetric
                            label="Actual positive replies"
                            value={`${detail.actualPositive}%`}
                          />
                          <MiniMetric
                            label="Predicted opportunities"
                            value={`${detail.predictedOpportunity}%`}
                          />
                          <MiniMetric
                            label="Actual opportunities"
                            value={`${detail.actualOpportunity}%`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section>
                <h2 className="text-sm font-semibold">Positive signals</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Kpi
                    label="Positive replies"
                    value={4}
                    helper={`${simulatedOutcomes.A.actualPositiveRate}% A · ${simulatedOutcomes.B.actualPositiveRate}% B`}
                  />
                  <Kpi
                    label="Meetings booked"
                    value={simulatedOutcomes.A.meetings + simulatedOutcomes.B.meetings}
                  />
                  <Kpi
                    label="Qualified opportunities"
                    value={simulatedOutcomes.A.opportunities + simulatedOutcomes.B.opportunities}
                  />
                  <Kpi
                    label="Closed Won"
                    value={simulatedOutcomes.A.closedWon + simulatedOutcomes.B.closedWon}
                  />
                </div>
              </section>
            </>
          ) : (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold">Step details</h2>
                <Select value={selectedStep.id} onValueChange={setStepId}>
                  <SelectTrigger className="w-72" aria-label="Select step">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentSteps.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        Sequence {s.variant} · {s.label.split("·")[1]?.trim()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {(() => {
                  const m = stepMetrics[selectedStep.id] ?? {
                    sent: 0,
                    opened: 0,
                    clicked: 0,
                    replied: 0,
                  };
                  return (
                    <>
                      <Kpi label="Channel" value={channelLabel(selectedStep.channel)} />
                      <Kpi label="Sent" value={m.sent} />
                      <Kpi
                        label="Opened"
                        value={selectedStep.channel === "email" ? m.opened : "N/A"}
                        helper={
                          selectedStep.channel === "email"
                            ? undefined
                            : "Not tracked for this channel"
                        }
                      />
                      <Kpi label="Replied" value={m.replied} />
                    </>
                  );
                })()}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {(["A", "B"] as VariantId[]).map((v) => {
                  const twin = contentSteps.find(
                    (s) => s.variant === v && s.position === selectedStep.position,
                  );
                  if (!twin) return null;
                  const current = messageScore(twin.id).score;
                  const t = trendFor(twin.id, current, v);
                  const out = outcome(v)!;
                  return (
                    <div key={v} className="rounded-xl border border-border bg-card p-4">
                      <h3 className="text-sm font-semibold">Sequence {v}</h3>
                      <p className="text-xs text-muted-foreground">
                        {channelLabel(twin.channel)} · position {twin.position}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">lemScore at launch:</span>
                        <span className="font-semibold tabular-nums">
                          {t.snapshot?.score ?? "—"}
                        </span>
                        <TrendIndicator
                          detail={{
                            trend: t.trend,
                            launchScore: t.snapshot?.score ?? null,
                            currentScore: t.score,
                            predictedPositive: t.snapshot?.predictedPositiveRate ?? 0,
                            actualPositive: out.actualPositiveRate,
                            predictedOpportunity: t.snapshot?.predictedOpportunityRate ?? 0,
                            actualOpportunity: out.actualOpportunityRate,
                            sends: out.sends,
                            confidence: t.snapshot?.confidence ?? "Medium",
                            explanation: t.explanation,
                          }}
                        />
                        <ScorePill score={t.score} suffix={false} className="ml-auto" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  helper,
}: {
  label: string;
  value: React.ReactNode;
  helper?: string | undefined;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold tabular-nums">{value}</div>
      {helper && <div className="mt-1 text-[11px] text-muted-foreground">{helper}</div>}
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background p-2.5">
      <div className="text-[10px] tracking-wide text-muted-foreground uppercase">{label}</div>
      <div className="mt-1 font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-44" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map(([v, l]) => (
          <SelectItem key={v} value={v}>
            {l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
