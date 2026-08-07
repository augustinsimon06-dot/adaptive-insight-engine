import { Loader2, PanelRightClose, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { channelLabel } from "@/lib/lemscore/benchmarks";
import { bandLabel } from "@/lib/lemscore/scoring";
import { useLemScore } from "@/lib/lemscore/store";
import type { ScoreFactor, SequenceStep } from "@/lib/lemscore/types";
import { cn } from "@/lib/utils";
import { DemoBadge, InfoPopover, LemMark, ScorePill, TrendIndicator, bandClasses } from "./shared";

export function ScorePanel({
  step,
  analyzing,
  onCollapse,
}: {
  step: SequenceStep;
  analyzing: boolean;
  onCollapse?: () => void;
}) {
  const { messageScore, prospectsFor, trendFor, launched, outcome } = useLemScore();
  const result = messageScore(step.id);
  const audience = prospectsFor(step.variant);
  const reference = audience[0];
  const trend = trendFor(step.id, result.score, step.variant);
  const out = outcome(step.variant);

  return (
    <aside
      className="flex h-full flex-col gap-4 overflow-y-auto border-l border-r border-border bg-lem-soft/40 p-4"
      aria-label="lemScore panel"
    >
      <div className="flex items-start gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-lem uppercase">
          <LemMark /> lemScore
        </div>
        <InfoPopover label="lemScore predicts and explains the commercial fit of this fixed message with the prospects assigned to this variant. It never rewrites your message." />
        {onCollapse && (
          <Button variant="ghost" size="sm" className="ml-auto h-7 px-2" onClick={onCollapse} aria-label="Collapse lemScore panel">
            <PanelRightClose className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-baseline gap-2">
          {launched && trend.recalibrated ? (
            <TrendIndicator
              className="text-3xl"
              detail={{
                trend: trend.trend,
                launchScore: trend.snapshot?.score ?? null,
                currentScore: trend.score,
                predictedPositive: trend.snapshot?.predictedPositiveRate ?? result.prediction.positiveReplyRate,
                actualPositive: out?.actualPositiveRate ?? null,
                predictedOpportunity: trend.snapshot?.predictedOpportunityRate ?? result.prediction.opportunityRate,
                actualOpportunity: out?.actualOpportunityRate ?? null,
                sends: out?.sends ?? 0,
                confidence: result.confidence,
                explanation: trend.explanation,
              }}
            />
          ) : (
            <span className="text-3xl font-semibold tabular-nums">{result.score}</span>
          )}
          <span className="text-sm text-muted-foreground">/100</span>
          {analyzing && (
            <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing…
            </span>
          )}
        </div>
        <p className={cn("mt-1 inline-flex rounded-full border px-2 py-0.5 text-xs font-medium", bandClasses(result.score))}>
          {bandLabel(result.score)}
        </p>

        <dl className="mt-3 space-y-1.5 text-xs">
          <Row label="Predicted positive reply rate" value={`${result.prediction.positiveReplyRate}%`} />
          <Row label="Predicted qualified opportunity rate" value={`${result.prediction.opportunityRate}%`} />
          <Row label="Workspace baseline" value={`${result.prediction.workspaceBaselineRate}%`} />
          <Row label="Confidence" value={result.confidence} />
          <Row label="Compared with" value={`${result.comparableMessages.toLocaleString()} similar messages`} />
        </dl>
        <p className="mt-2 text-[11px] text-muted-foreground">{result.calibrationSource}</p>
        <div className="mt-2 flex items-center gap-2">
          <DemoBadge />
          <span className="text-[11px] text-muted-foreground">
            Fit distribution: {result.distribution.strong}% strong · {result.distribution.medium}% medium ·{" "}
            {result.distribution.weak}% weak
          </span>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Active context</h3>
        <dl className="mt-2 space-y-1.5 text-xs">
          <Row label="Variant" value={`Sequence ${step.variant}`} />
          <Row label="Channel" value={channelLabel(step.channel)} />
          <Row label="Sequence position" value={step.position <= 1 ? "First contact" : `Follow-up #${step.position - 1}`} />
          <Row label="Prospects on this variant" value={audience.length} />
          <Row label="Dominant persona" value={reference?.context.persona ?? "—"} />
          <Row label="Industry" value={reference?.context.industry ?? "—"} />
          <Row label="Company size" value={reference?.context.companySizeBand ?? "—"} />
          <Row label="Intent signal" value={reference?.context.signal.label ?? "—"} />
        </dl>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Score factors</h3>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Diagnostic only. Use the lemlist AI control in the editor when you want to write or edit the message.
        </p>
        <ul className="mt-3 space-y-2.5">
          {result.factors.map((f) => (
            <FactorRow key={f.label} factor={f} />
          ))}
        </ul>
      </section>

      <p className="flex items-start gap-2 rounded-lg border border-border bg-card p-3 text-[11px] leading-relaxed text-muted-foreground">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lem" aria-hidden="true" />
        lemScore does not generate, rewrite or personalize messages, and does not change the A/B split. Actual results
        remain the final validation.
      </p>
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
      <p className="mt-1 text-[10px] text-muted-foreground">
        Source: {factor.source} · Comparable messages: {factor.sampleSize.toLocaleString()} · Confidence:{" "}
        {factor.confidence}
      </p>
    </li>
  );
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
  return <ScorePill score={messageScore(stepId).score} />;
}
