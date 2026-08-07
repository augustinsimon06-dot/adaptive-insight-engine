import { AlertTriangle, ChevronDown, Loader2, PanelRightClose, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { channelLabel } from "@/lib/lemscore/benchmarks";
import { bandLabel } from "@/lib/lemscore/scoring";
import { useLemScore } from "@/lib/lemscore/store";
import type { Prospect, ScoreFactor, SequenceStep } from "@/lib/lemscore/types";
import { cn } from "@/lib/utils";
import { DemoBadge, InfoPopover, ScorePill, bandClasses } from "./shared";

export function ScorePanel({
  step,
  analyzing,
  onCollapse,
}: {
  step: SequenceStep;
  analyzing: boolean;
  onCollapse?: () => void;
}) {
  const { messageScore, prospectsFor } = useLemScore();
  const result = messageScore(step.id);
  const audience = prospectsFor(step.variant);
  const negative = [...result.factors]
    .filter((factor) => factor.contribution < 0)
    .sort((a, b) => a.contribution - b.contribution)
    .slice(0, 3);
  const priority = negative[0] ?? result.factors[0];
  const unavailable = result.validity !== "valid";

  return (
    <aside
      className="m-3 flex h-[calc(100%-1.5rem)] flex-col gap-4 overflow-y-auto rounded-2xl border-2 border-primary/70 bg-background p-4 shadow-[0_12px_32px_-22px_rgba(37,99,235,0.75)]"
      aria-label="lemScore panel"
    >
      <div className="flex items-start gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Audience prediction
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Sequence {step.variant} · {channelLabel(step.channel)}
          </p>
        </div>
        <InfoPopover
          className="w-96"
          label="This is a commercial outcome prediction, not a generic copywriting grade. It crosses the exact fixed message with each assigned prospect, comparable lemlist patterns, workspace history and CRM won/lost outcomes. It never rewrites the message or changes the A/B split."
        />
        {onCollapse && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 px-2"
            onClick={onCollapse}
            aria-label="Collapse lemScore panel"
          >
            <PanelRightClose className="h-4 w-4" />
          </Button>
        )}
      </div>

      <section className="rounded-xl border-2 border-primary/50 bg-primary/[0.025] p-4">
        <p className="mb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          Live outcome prediction
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tabular-nums">{result.score}</span>
          <span className="text-sm text-muted-foreground">/100</span>
          <InfoPopover label="This is a prediction, not a guaranteed result. The number is the mean of the personalized predictions for every prospect currently assigned to this variant." />
          {analyzing && (
            <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating…
            </span>
          )}
        </div>
        {unavailable ? (
          <div className="mt-2 rounded-lg border border-warning/35 bg-warning-soft p-2.5 text-xs text-warning">
            <strong>{result.score}/100 · Prediction paused</strong>
            <p className="mt-1 leading-relaxed text-foreground">{result.validityReason}</p>
          </div>
        ) : (
          <>
            <p
              className={cn(
                "mt-1 inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
                bandClasses(result.score),
              )}
            >
              {bandLabel(result.score)}
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Mean of {result.audienceSize} personalized message × prospect prediction
              {result.audienceSize === 1 ? "" : "s"}.
            </p>
          </>
        )}

        <dl className={cn("mt-3 space-y-1.5 text-xs", unavailable && "opacity-55")}>
          <Row
            label="Predicted positive replies"
            value={`${result.prediction.positiveReplyRate}%`}
          />
          <Row label="Predicted opportunities" value={`${result.prediction.opportunityRate}%`} />
          <Row label="Workspace baseline" value={`${result.prediction.workspaceBaselineRate}%`} />
          <Row label="Confidence" value={result.confidence} />
        </dl>
        <div
          className={cn(
            "mt-3 grid grid-cols-3 gap-1 text-center text-[10px]",
            unavailable && "opacity-55",
          )}
        >
          <FitCell label="Strong" value={result.distribution.strong} className="text-success" />
          <FitCell label="Medium" value={result.distribution.medium} className="text-warning" />
          <FitCell label="Weak" value={result.distribution.weak} className="text-destructive" />
        </div>
      </section>

      {priority && !unavailable && (
        <HoverCard openDelay={120} closeDelay={100}>
          <HoverCardTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-xl border border-warning/35 bg-warning-soft px-3 py-2.5 text-left text-xs transition-colors hover:border-warning/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-foreground">Priority insight</span>
                <span className="block truncate text-muted-foreground">
                  {priority.label} · hover for the outcome-linked recommendation
                </span>
              </span>
              <Sparkles className="h-4 w-4 shrink-0 text-lem" aria-hidden="true" />
            </button>
          </HoverCardTrigger>
          <HoverCardContent align="start" side="right" className="w-96 text-xs leading-relaxed">
            <p className="font-semibold text-foreground">One evidence-backed improvement</p>
            <p className="mt-1 text-muted-foreground">
              Your message is usable, but comparable message × prospect pairs produced better
              commercial outcomes when this element was closer to the winning pattern:
            </p>
            <p className="mt-2 font-medium text-foreground">
              {priority.label}: {priority.benchmark}
            </p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Diagnostic only. Use lemlist AI if you want help rewriting the copy.
            </p>
          </HoverCardContent>
        </HoverCard>
      )}

      <section className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Audience evaluated
        </h3>
        <dl className="mt-2 space-y-1.5 text-xs">
          <Row label="Assigned prospects" value={audience.length} />
          <Row label="Main persona" value={mode(audience, (p) => p.context.persona)} />
          <Row label="Main industry" value={mode(audience, (p) => p.context.industry)} />
          <Row label="Most common signal" value={mode(audience, (p) => p.context.signal.label)} />
        </dl>
      </section>

      {!unavailable && (
        <details className="group rounded-xl border border-border bg-card p-4">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Why this prediction
            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-3 rounded-lg bg-surface p-3 text-[11px] text-muted-foreground">
            Compared with {result.comparableMessages.toLocaleString()} channel- and persona-matched
            demo messages. {result.calibrationSource}. Confidence: {result.confidence}.
          </div>
          <ul className="mt-3 space-y-2.5">
            {result.factors.map((factor) => (
              <FactorRow key={factor.label} factor={factor} />
            ))}
          </ul>
        </details>
      )}

      <p className="flex items-start gap-2 rounded-lg border border-border bg-card p-3 text-[11px] leading-relaxed text-muted-foreground">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
        One fixed message is crossed with every assigned prospect. Launch freezes this prediction;
        actual positive replies, opportunities and won/lost outcomes remain the final validation.
      </p>
      <DemoBadge className="w-fit" />
    </aside>
  );
}

export function FactorRow({ factor }: { factor: ScoreFactor }) {
  const positive = factor.contribution >= 0;
  return (
    <li className="rounded-lg border border-border bg-surface p-2.5">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium">{factor.label}</span>
        <span
          className={cn(
            "ml-auto rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
            positive ? "bg-success-soft text-success" : "bg-destructive/10 text-destructive",
          )}
        >
          {positive ? "+" : "−"}
          {Math.abs(factor.contribution)}
        </span>
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-foreground">{factor.observed}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{factor.benchmark}</p>
    </li>
  );
}

function FitCell({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className="rounded-lg border border-border bg-background px-1 py-2">
      <div className={cn("font-semibold tabular-nums", className)}>{value}%</div>
      <div className="mt-0.5 text-muted-foreground">{label}</div>
    </div>
  );
}

function mode(list: Prospect[], select: (prospect: Prospect) => string) {
  if (!list.length) return "—";
  const counts = new Map<string, number>();
  list.forEach((item) => counts.set(select(item), (counts.get(select(item)) ?? 0) + 1));
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

export function ScorePillForStep({ stepId }: { stepId: string }) {
  const { messageScore } = useLemScore();
  const result = messageScore(stepId);
  return <ScorePill score={result.score} validity={result.validity} />;
}
