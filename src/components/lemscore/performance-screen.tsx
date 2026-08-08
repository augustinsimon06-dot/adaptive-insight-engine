import { useState, type ReactNode } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarCheck,
  CalendarDays,
  Download,
  Eye,
  Flag,
  Heart,
  MailCheck,
  MailX,
  MessageCircleReply,
  MousePointerClick,
  Send,
  UserCheck,
  Users,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { channelLabel } from "@/lib/lemscore/benchmarks";
import { simulateProspectOutcome, stepMetrics } from "@/lib/lemscore/data";
import { useLemScore } from "@/lib/lemscore/store";
import type { Prospect, ProspectOutcome, ScoreSnapshot, VariantId } from "@/lib/lemscore/types";
import { DemoBadge, InfoPopover, ScorePill, TrendArrow } from "./shared";

export function PerformanceScreen() {
  const {
    perfView,
    update,
    launched,
    steps,
    messageScore,
    trendFor,
    variantResult,
    outcome,
    activeProspects,
    launchedProspects,
    launchedProspectsFor,
    prospectScore,
    prospectLaunchSnapshot,
  } = useLemScore();
  const [stepId, setStepId] = useState("A1");
  const [range, setRange] = useState("last_30");
  const [channel, setChannel] = useState("all");

  if (!launched) {
    return (
      <div className="min-h-[calc(100vh-6.5rem)] bg-surface px-6 py-10">
        <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-6 text-center">
          <BarChart3 className="mx-auto h-8 w-8 text-primary" />
          <h2 className="mt-3 text-base font-semibold">No campaign results yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Launch the demo campaign to display the standard lemlist performance view and lemScore
            tracking.
          </p>
          <Button className="mt-4" onClick={() => update({ mainTab: "launch" })}>
            Go to Launch
          </Button>
        </div>
      </div>
    );
  }

  const observedA = outcome("A")!;
  const observedB = outcome("B")!;

  const contentSteps = [...steps("A"), ...steps("B")].filter(
    (step) => step.hasContent && (channel === "all" || step.channel === channel),
  );
  const selectedStep = contentSteps.find((step) => step.id === stepId) ?? contentSteps[0]!;
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
  const delivered = Math.max(0, totals.sent - 3);
  const reached = Math.max(0, launchedProspects.length - 1);

  const variantDetail = (variant: VariantId) => {
    const currentPrediction = variantResult(variant);
    const current = currentPrediction.score;
    const trend = trendFor(`variant:${variant}`, current, variant);
    const result = outcome(variant)!;
    return {
      trend: trend.trend,
      launchScore: trend.snapshot?.score ?? null,
      currentScore: current,
      currentValidity: currentPrediction.validity,
      currentPredictedPositive: currentPrediction.prediction.positiveReplyRate,
      currentPredictedOpportunity: currentPrediction.prediction.opportunityRate,
      predictedPositive: trend.snapshot?.predictedPositiveRate ?? 0,
      actualPositive: result.actualPositiveRate,
      predictedOpportunity: trend.snapshot?.predictedOpportunityRate ?? 0,
      actualOpportunity: result.actualOpportunityRate,
      sends: result.sends,
      confidence: trend.snapshot?.confidence ?? "Medium",
      explanation: trend.explanation,
    };
  };

  return (
    <div className="min-h-[calc(100vh-6.5rem)] bg-surface">
      <div className="grid min-h-[calc(100vh-6.5rem)] lg:grid-cols-[300px_minmax(0,1fr)]">
        <PerformanceSidebar
          perfView={perfView}
          onViewChange={(view) => update({ perfView: view })}
          range={range}
          onRangeChange={setRange}
          channel={channel}
          onChannelChange={setChannel}
        />

        <main className="min-w-0 space-y-5 overflow-hidden p-6">
          {perfView === "overview" ? (
            <>
              <Funnel prospectCount={launchedProspects.length} />

              <section className="rounded-2xl border border-border bg-background p-5 shadow-sm">
                <h2 className="text-base font-semibold">Campaign statistics</h2>

                <MetricSection title="Prospect statistics">
                  <MetricCard
                    icon={<Users />}
                    label="Prospects in campaign"
                    value={activeProspects.length}
                  />
                  <MetricCard
                    icon={<Flag />}
                    label="Prospects launched"
                    value={`${launchedProspects.length}`}
                    helper={`${launchedProspectsFor("A").length} in A · ${launchedProspectsFor("B").length} in B`}
                  />
                  <MetricCard
                    icon={<UserCheck />}
                    label="Prospects reached"
                    value={`${launchedProspects.length ? Math.round((reached / launchedProspects.length) * 100) : 0}%`}
                    helper={`${reached} prospects`}
                  />
                </MetricSection>

                <MetricSection title="Deliverability statistics">
                  <MetricCard icon={<Send />} label="Messages sent" value={totals.sent} />
                  <MetricCard icon={<MailX />} label="Messages not sent" value={3} />
                  <MetricCard
                    icon={<MailCheck />}
                    label="Delivered"
                    value={`${Math.round((delivered / totals.sent) * 100)}%`}
                    helper={`${delivered} messages`}
                  />
                </MetricSection>

                <MetricSection title="Engagement statistics">
                  <MetricCard
                    icon={<Eye />}
                    label="Email open rate"
                    value={`${Math.round((totals.opened / emailSent) * 100)}%`}
                    helper={`${totals.opened} opens`}
                  />
                  <MetricCard
                    icon={<MousePointerClick />}
                    label="Click rate"
                    value={`${Math.round((totals.clicked / emailSent) * 100)}%`}
                    helper={`${totals.clicked} clicks`}
                  />
                  <MetricCard
                    icon={<MessageCircleReply />}
                    label="Reply rate"
                    value={`${Math.round((totals.replied / totals.sent) * 1000) / 10}%`}
                    helper={`${totals.replied} replies`}
                  />
                </MetricSection>

                <MetricSection title="Positive signals">
                  <MetricCard
                    icon={<MessageCircleReply />}
                    label="Positive replies"
                    value={observedA.positiveReplies + observedB.positiveReplies}
                    helper={`${observedA.actualPositiveRate}% A · ${observedB.actualPositiveRate}% B`}
                  />
                  <MetricCard
                    icon={<CalendarCheck />}
                    label="Meetings booked"
                    value={observedA.meetings + observedB.meetings}
                  />
                  <MetricCard
                    icon={<Heart />}
                    label="Qualified opportunities"
                    value={observedA.opportunities + observedB.opportunities}
                  />
                </MetricSection>
              </section>

              <section className="rounded-2xl border-2 border-primary/50 bg-background p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-primary">lemScore tracking</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      The score frozen at launch validates the sent version. The latest estimate
                      shows how the current draft would score now; actual outcomes validate the
                      original forecast.
                    </p>
                  </div>
                  <DemoBadge className="ml-auto" />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {(["A", "B"] as VariantId[]).map((variant) => {
                    const detail = variantDetail(variant);
                    return (
                      <div
                        key={variant}
                        className="rounded-xl border border-primary/25 bg-primary/[0.025] p-4"
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold">Sequence {variant}</h3>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {detail.sends} sends analyzed
                          </span>
                        </div>
                        <div className="mt-3 rounded-lg border border-primary/30 bg-background p-3">
                          <p className="text-[10px] font-semibold tracking-wide text-primary uppercase">
                            Latest sequence estimate
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <ScorePill
                              score={detail.currentScore}
                              validity={detail.currentValidity}
                            />
                            <span className="text-[11px] text-muted-foreground">
                              Current draft · mean of its message optimization scores
                            </span>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            <MiniMetric
                              label="Estimated positive replies"
                              value={`${detail.currentPredictedPositive}%`}
                            />
                            <MiniMetric
                              label="Estimated opportunities"
                              value={`${detail.currentPredictedOpportunity}%`}
                            />
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                          {steps(variant)
                            .filter((step) => step.hasContent)
                            .map((step) => (
                              <span
                                key={step.id}
                                className="rounded-full border border-border bg-background px-2 py-1 text-muted-foreground"
                              >
                                {step.label.split("·")[1]?.trim()}: {messageScore(step.id).score}
                              </span>
                            ))}
                        </div>
                        <div className="mt-3 rounded-lg border border-border bg-background p-3">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-semibold">Score frozen at launch</span>
                            <strong className="tabular-nums">
                              {detail.launchScore ?? "—"}/100
                            </strong>
                            <span className="text-muted-foreground">Frozen when sent</span>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            <MiniMetric
                              label="Estimated positive replies"
                              value={`${detail.predictedPositive}%`}
                            />
                            <MiniMetric
                              label="Estimated opportunities"
                              value={`${detail.predictedOpportunity}%`}
                            />
                          </div>
                        </div>
                        <div className="mt-3 rounded-lg border border-border bg-background p-3">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-semibold">Actual outcome</span>
                            <OutcomeSignal detail={detail} />
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            <MiniMetric
                              label="Positive replies"
                              value={`${detail.actualPositive}%`}
                            />
                            <MiniMetric
                              label="Qualified opportunities"
                              value={`${detail.actualOpportunity}%`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <LaunchCohortValidation
                prospects={launchedProspects}
                prospectScore={(id) => prospectScore(id).score}
                launchSnapshot={prospectLaunchSnapshot}
              />
            </>
          ) : (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-base font-semibold">Step details</h2>
                <Select value={selectedStep.id} onValueChange={setStepId}>
                  <SelectTrigger className="w-80 bg-background" aria-label="Select step">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentSteps.map((step) => (
                      <SelectItem key={step.id} value={step.id}>
                        Sequence {step.variant} · {step.label.split("·")[1]?.trim()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DemoBadge />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {(() => {
                  const metric = stepMetrics[selectedStep.id] ?? {
                    sent: 0,
                    opened: 0,
                    clicked: 0,
                    replied: 0,
                  };
                  return (
                    <>
                      <MetricCard
                        icon={<Workflow />}
                        label="Channel"
                        value={channelLabel(selectedStep.channel)}
                      />
                      <MetricCard icon={<Send />} label="Sent" value={metric.sent} />
                      <MetricCard
                        icon={<Eye />}
                        label="Opened"
                        value={selectedStep.channel === "email" ? metric.opened : "N/A"}
                      />
                      <MetricCard
                        icon={<MessageCircleReply />}
                        label="Replied"
                        value={metric.replied}
                      />
                    </>
                  );
                })()}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {(["A", "B"] as VariantId[]).map((variant) => {
                  const twin = contentSteps.find(
                    (step) => step.variant === variant && step.position === selectedStep.position,
                  );
                  if (!twin) return null;
                  const currentResult = messageScore(twin.id);
                  const current = currentResult.score;
                  const trend = trendFor(twin.id, current, variant);
                  const result = outcome(variant)!;
                  const detail = {
                    trend: trend.trend,
                    launchScore: trend.snapshot?.score ?? null,
                    currentScore: current,
                    predictedPositive: trend.snapshot?.predictedPositiveRate ?? 0,
                    actualPositive: result.actualPositiveRate,
                    predictedOpportunity: trend.snapshot?.predictedOpportunityRate ?? 0,
                    actualOpportunity: result.actualOpportunityRate,
                    sends: result.sends,
                    confidence: trend.snapshot?.confidence ?? "Medium",
                    explanation: trend.explanation,
                  };
                  return (
                    <div key={variant} className="rounded-xl border border-border bg-card p-4">
                      <h3 className="text-sm font-semibold">Sequence {variant}</h3>
                      <p className="text-xs text-muted-foreground">
                        {channelLabel(twin.channel)} · position {twin.position}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                        <ScorePill score={current} validity={currentResult.validity} />
                        <span className="text-xs text-muted-foreground">
                          Current message optimization score
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3 text-xs">
                        <span className="text-muted-foreground">Score frozen at launch</span>
                        <strong>{trend.snapshot?.score ?? "—"}/100</strong>
                        <OutcomeSignal detail={detail} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

type CohortView = "all" | VariantId | "split";
type CohortPreset = "standard" | "detailed";

function LaunchCohortValidation({
  prospects,
  prospectScore,
  launchSnapshot,
}: {
  prospects: Prospect[];
  prospectScore: (id: string) => number;
  launchSnapshot: (id: string) => ScoreSnapshot | null;
}) {
  const [view, setView] = useState<CohortView>("all");
  const [preset, setPreset] = useState<CohortPreset>("standard");
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

  const scored = prospects.map((prospect) => {
    const snapshot = launchSnapshot(prospect.id);
    return {
      prospect,
      score: snapshot?.score ?? prospectScore(prospect.id),
      frozen: Boolean(snapshot),
    };
  });
  const allFrozen = scored.every((item) => item.frozen);
  const variants: Array<VariantId | "all"> =
    view === "split" ? ["A", "B"] : view === "A" || view === "B" ? [view] : ["all"];
  const rows = variants.flatMap((variant) =>
    bands.map((band) => {
      const members = scored.filter(
        (item) =>
          (variant === "all" || item.prospect.variant === variant) &&
          item.score >= band.min &&
          item.score <= band.max,
      );
      const outcomes = members.map((item) => simulateProspectOutcome(item.prospect, item.score));
      const total = members.length;
      const count = (key: keyof ProspectOutcome) =>
        outcomes.filter((outcome) => outcome[key]).length;
      const delivered = count("delivered");
      return {
        key: `${variant}-${band.label}`,
        label: `${band.label}${variant === "all" ? "" : ` · ${variant}`}`,
        total,
        average: total
          ? Math.round(members.reduce((sum, item) => sum + item.score, 0) / total)
          : null,
        delivered,
        opened: count("opened"),
        clicked: count("clicked"),
        linkedinEngaged: count("linkedinEngaged"),
        positiveReply: count("positiveReply"),
        meeting: count("meeting"),
        opportunity: count("opportunity"),
        closedWon: count("closedWon"),
        closedLost: count("closedLost"),
      };
    }),
  );

  return (
    <section className="rounded-2xl border-2 border-primary/50 bg-background p-5 shadow-sm">
      <div className="flex flex-wrap items-start gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-primary">
              Prediction validation by cohort
            </h2>
            <InfoPopover label="Prospects are grouped by their individual Prospect Prediction Score frozen at launch. This table tests whether higher-scored prospects actually produced better commercial outcomes. It does not alter the A/B split." />
          </div>
          <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
            Score bands use the prospect prediction frozen before sending. Delivered uses launched
            prospects as denominator; opens and clicks use delivered prospects; every downstream
            commercial metric uses launched prospects.
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

      {!allFrozen && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-warning/40 bg-warning-soft p-3 text-xs">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p>
            This saved demo predates prospect snapshots. The table temporarily uses current scores;
            reset and relaunch once to freeze a clean pre-send baseline.
          </p>
        </div>
      )}

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
                <td className="whitespace-nowrap px-3 py-3 font-semibold">
                  {row.label}
                  {row.total > 0 && row.total < 5 && (
                    <span className="mt-1 flex items-center gap-1 text-[10px] font-normal text-warning">
                      <AlertTriangle className="h-3 w-3" /> Low sample
                    </span>
                  )}
                </td>
                <td className="px-3 py-3 font-semibold tabular-nums">{row.total}</td>
                <td className="px-3 py-3 tabular-nums">{row.average ?? "—"}</td>
                <RateCell
                  count={row.delivered}
                  denominator={row.total}
                  metric="delivered"
                  meanScore={row.average}
                />
                <RateCell
                  count={row.opened}
                  denominator={row.delivered}
                  metric="opened"
                  meanScore={row.average}
                />
                <RateCell
                  count={row.clicked}
                  denominator={row.delivered}
                  metric="clicked"
                  meanScore={row.average}
                />
                <RateCell
                  count={row.linkedinEngaged}
                  denominator={row.total}
                  metric="linkedinEngaged"
                  meanScore={row.average}
                />
                <RateCell
                  count={row.positiveReply}
                  denominator={row.total}
                  metric="positiveReply"
                  meanScore={row.average}
                />
                <RateCell
                  count={row.meeting}
                  denominator={row.total}
                  metric="meeting"
                  meanScore={row.average}
                />
                <RateCell
                  count={row.opportunity}
                  denominator={row.total}
                  metric="opportunity"
                  meanScore={row.average}
                />
                <RateCell
                  count={row.closedWon}
                  denominator={row.total}
                  metric="closedWon"
                  meanScore={row.average}
                />
                <RateCell
                  count={row.closedLost}
                  denominator={row.total}
                  metric="closedLost"
                  meanScore={row.average}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        Beta interpretation: this is predictive validation, not causal proof. Compare bands only
        when their samples are large enough; otherwise use the trend as directional evidence.
      </p>
    </section>
  );
}

function CohortHead({ children }: { children: ReactNode }) {
  return <th className="whitespace-nowrap px-3 py-2.5 font-semibold">{children}</th>;
}

/** Metric keys used for expected-vs-actual colouring. */
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

/** Expected rate (%) for a cohort, given its mean predicted score. Demo model. */
const EXPECTED_AT_70: Record<CohortMetric, number> = {
  delivered: 96,
  opened: 54,
  clicked: 11,
  linkedinEngaged: 17,
  positiveReply: 6,
  meeting: 3.4,
  opportunity: 2.2,
  closedWon: 0.9,
  closedLost: 1.5,
};

function expectedRate(metric: CohortMetric, meanScore: number | null) {
  const base = EXPECTED_AT_70[metric];
  if (meanScore === null) return base;
  const lift = 1 + (meanScore - 70) * 0.02;
  const inverse = metric === "closedLost";
  const factor = Math.max(0.35, inverse ? 2 - lift : lift);
  return Math.max(0.2, base * factor);
}

/** Colour is relative to expectation, never to the absolute value. */
function performanceClasses(actual: number, expected: number, inverse: boolean) {
  const ratio = expected > 0 ? actual / expected : 1;
  const adjusted = inverse ? (ratio > 0 ? 1 / ratio : 2) : ratio;
  if (adjusted >= 1.1) return "bg-success-soft text-success";
  if (adjusted <= 0.9) return "bg-destructive/10 text-destructive";
  return "bg-warning-soft text-warning";
}

function RateCell({
  count,
  denominator,
  metric,
  meanScore,
}: {
  count: number;
  denominator: number;
  metric: CohortMetric;
  meanScore: number | null;
}) {
  if (!denominator) {
    return <td className="whitespace-nowrap px-3 py-3 tabular-nums text-muted-foreground">—</td>;
  }
  const actual = (count / denominator) * 100;
  const expected = expectedRate(metric, meanScore);
  const inverse = metric === "closedLost";
  return (
    <td className="px-3 py-3">
      <span
        className={cn(
          "inline-flex flex-col rounded-md px-2 py-1 font-semibold tabular-nums",
          performanceClasses(actual, expected, inverse),
        )}
        title={`Expected ≈ ${Math.round(expected)}% for this score band`}
      >
        {Math.round(actual)}% · {count}
        <span className="text-[10px] font-normal opacity-80">
          exp. {Math.round(expected)}%
        </span>
      </span>
    </td>
  );
}

type OutcomeSignalDetail = {
  trend: "up" | "down" | "flat";
  launchScore: number | null;
  currentScore: number;
  predictedPositive: number;
  actualPositive: number;
  predictedOpportunity: number;
  actualOpportunity: number;
  sends: number;
  confidence: string;
  explanation: string;
};

function OutcomeSignal({ detail }: { detail: OutcomeSignalDetail }) {
  const label =
    detail.trend === "up"
      ? "Results above prediction"
      : detail.trend === "down"
        ? "Results below prediction"
        : "Results match prediction";

  return (
    <InfoPopover
      className="w-80"
      trigger={
        <button
          type="button"
          className="ml-auto inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <TrendArrow trend={detail.trend} /> {label}
        </button>
      }
    >
      <div className="space-y-2">
        <p className="font-semibold text-foreground">Outcome of the version sent at launch</p>
        <div className="grid grid-cols-2 gap-2">
          <MiniMetric label="Score at launch" value={detail.launchScore ?? "—"} />
          <MiniMetric label="Current live score" value={detail.currentScore} />
          <MiniMetric label="Predicted replies" value={`${detail.predictedPositive}%`} />
          <MiniMetric label="Actual replies" value={`${detail.actualPositive}%`} />
          <MiniMetric label="Predicted opportunities" value={`${detail.predictedOpportunity}%`} />
          <MiniMetric label="Actual opportunities" value={`${detail.actualOpportunity}%`} />
        </div>
        <p className="text-muted-foreground">
          {detail.explanation} Current edits never rewrite historical launch results.
        </p>
        <p className="text-muted-foreground">
          {detail.sends} sends analyzed · Confidence {detail.confidence}
        </p>
        <DemoBadge />
      </div>
    </InfoPopover>
  );
}

function PerformanceSidebar({
  perfView,
  onViewChange,
  range,
  onRangeChange,
  channel,
  onChannelChange,
}: {
  perfView: "overview" | "steps";
  onViewChange: (view: "overview" | "steps") => void;
  range: string;
  onRangeChange: (value: string) => void;
  channel: string;
  onChannelChange: (value: string) => void;
}) {
  return (
    <aside className="border-r border-border bg-background p-5">
      <div className="grid grid-cols-2 gap-3">
        <ViewCard
          active={perfView === "overview"}
          icon={<BarChart3 />}
          label="Overview"
          onClick={() => onViewChange("overview")}
        />
        <ViewCard
          active={perfView === "steps"}
          icon={<Workflow />}
          label="Step details"
          onClick={() => onViewChange("steps")}
        />
      </div>

      <div className="mt-6 space-y-5">
        <SidebarFilter label="Time period">
          <Select value={range} onValueChange={onRangeChange}>
            <SelectTrigger className="w-full">
              <CalendarDays className="h-4 w-4" /> <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_7">Last 7 days</SelectItem>
              <SelectItem value="last_30">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </SidebarFilter>
        <SidebarFilter label="Senders">
          <Select value="all" onValueChange={() => undefined}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All campaign senders</SelectItem>
            </SelectContent>
          </Select>
        </SidebarFilter>
        <SidebarFilter label="Channels">
          <Select value={channel} onValueChange={onChannelChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All channels</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="linkedin_message">LinkedIn message</SelectItem>
            </SelectContent>
          </Select>
        </SidebarFilter>
      </div>

      <Button variant="outline" className="mt-8 w-full" onClick={() => undefined}>
        <Download className="h-4 w-4" /> Export campaign
      </Button>
    </aside>
  );
}

function ViewCard({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-36 flex-col items-center justify-center gap-3 rounded-xl border p-3 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary/5 text-primary"
          : "border-transparent bg-muted/20 text-muted-foreground hover:border-border",
      )}
    >
      <span className="[&_svg]:h-10 [&_svg]:w-10">{icon}</span>
      {label}
    </button>
  );
}

function SidebarFilter({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold">{label}</p>
      {children}
    </div>
  );
}

function Funnel({ prospectCount }: { prospectCount: number }) {
  const items = [
    { label: "Contacted", value: prospectCount, color: "bg-primary/45", height: 126 },
    {
      label: "Opened",
      value: Math.round(prospectCount * 0.72),
      color: "bg-primary/30",
      height: 96,
    },
    {
      label: "Interaction",
      value: Math.round(prospectCount * 0.38),
      color: "bg-lem/25",
      height: 68,
    },
    { label: "Replied", value: Math.round(prospectCount * 0.22), color: "bg-lem/40", height: 52 },
    {
      label: "Interested",
      value: Math.round(prospectCount * 0.12),
      color: "bg-success/35",
      height: 36,
    },
    { label: "Stopped", value: Math.round(prospectCount * 0.08), color: "bg-muted", height: 24 },
  ];
  return (
    <section className="rounded-2xl border border-border bg-background p-5 shadow-sm">
      <h2 className="text-base font-semibold">Prospect funnel</h2>
      <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {items.map((item) => (
          <div key={item.label} className="flex min-w-0 flex-col">
            <p className="truncate text-xs font-medium text-muted-foreground">{item.label}</p>
            <div className="mt-3 flex h-32 items-end">
              <div
                className={cn("w-full rounded-t-lg", item.color)}
                style={{ height: item.height }}
              />
            </div>
            <p className="mt-2 text-sm font-semibold tabular-nums">
              {item.value}{" "}
              <span className="font-normal text-muted-foreground">
                {Math.round((item.value / prospectCount) * 100)}%
              </span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MetricSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  helper?: string;
}) {
  return (
    <div className="flex min-h-28 items-center gap-4 rounded-xl border border-border bg-card p-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/5 text-primary [&_svg]:h-5 [&_svg]:w-5">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-xl font-semibold tabular-nums">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
        {helper && (
          <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{helper}</div>
        )}
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background p-2.5">
      <div className="text-[10px] tracking-wide text-muted-foreground uppercase">{label}</div>
      <div className="mt-1 font-semibold tabular-nums">{value}</div>
    </div>
  );
}
