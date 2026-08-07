import { useState, type ReactNode } from "react";
import {
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
import { simulatedOutcomes, stepMetrics } from "@/lib/lemscore/data";
import { useLemScore } from "@/lib/lemscore/store";
import type { VariantId } from "@/lib/lemscore/types";
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
  const reached = Math.max(0, activeProspects.length - 1);

  const variantDetail = (variant: VariantId) => {
    const current = variantScore(variant);
    const trend = trendFor(`variant:${variant}`, current, variant);
    const result = outcome(variant)!;
    return {
      trend: trend.trend,
      launchScore: trend.snapshot?.score ?? null,
      currentScore: trend.score,
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
              <Funnel prospectCount={activeProspects.length} />

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
                    value={`${activeProspects.length}`}
                    helper={`${prospectsFor("A").length} in A · ${prospectsFor("B").length} in B`}
                  />
                  <MetricCard
                    icon={<UserCheck />}
                    label="Prospects reached"
                    value={`${Math.round((reached / activeProspects.length) * 100)}%`}
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
                    value={4}
                    helper={`${simulatedOutcomes.A.actualPositiveRate}% A · ${simulatedOutcomes.B.actualPositiveRate}% B`}
                  />
                  <MetricCard
                    icon={<CalendarCheck />}
                    label="Meetings booked"
                    value={simulatedOutcomes.A.meetings + simulatedOutcomes.B.meetings}
                  />
                  <MetricCard
                    icon={<Heart />}
                    label="Qualified opportunities"
                    value={simulatedOutcomes.A.opportunities + simulatedOutcomes.B.opportunities}
                  />
                </MetricSection>
              </section>

              <section className="rounded-2xl border-2 border-primary/50 bg-background p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-primary">lemScore tracking</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Prediction quality is added to Performance without replacing the A/B test or
                      lemlist metrics.
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
                  const current = messageScore(twin.id).score;
                  const trend = trendFor(twin.id, current, variant);
                  const result = outcome(variant)!;
                  return (
                    <div key={variant} className="rounded-xl border border-border bg-card p-4">
                      <h3 className="text-sm font-semibold">Sequence {variant}</h3>
                      <p className="text-xs text-muted-foreground">
                        {channelLabel(twin.channel)} · position {twin.position}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">lemScore at launch</span>
                        <TrendIndicator
                          detail={{
                            trend: trend.trend,
                            launchScore: trend.snapshot?.score ?? null,
                            currentScore: trend.score,
                            predictedPositive: trend.snapshot?.predictedPositiveRate ?? 0,
                            actualPositive: result.actualPositiveRate,
                            predictedOpportunity: trend.snapshot?.predictedOpportunityRate ?? 0,
                            actualOpportunity: result.actualOpportunityRate,
                            sends: result.sends,
                            confidence: trend.snapshot?.confidence ?? "Medium",
                            explanation: trend.explanation,
                          }}
                        />
                        <ScorePill score={trend.score} suffix={false} className="ml-auto" />
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
