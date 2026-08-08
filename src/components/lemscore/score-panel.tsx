import { AlertTriangle, ChevronDown, Loader2, PanelRightClose, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { channelLabel } from "@/lib/lemscore/benchmarks";
import { bandLabel } from "@/lib/lemscore/scoring";
import { useLemScore } from "@/lib/lemscore/store";
import { getIcpState, icpLabel } from "@/lib/lemscore/icp";
import type { ScoreFactor, SequenceStep } from "@/lib/lemscore/types";
import { cn } from "@/lib/utils";
import {
  DemoBadge,
  InfoPopover,
  ScorePill,
  bandClasses,
  bandFrameClasses,
  formatCount,
} from "./shared";

const ICP_TRAITS = [
  "are actively hiring sales reps",
  "changed their sales leadership in the last 90 days",
  "just raised a growth round",
  "recently rolled out a new sales enablement tool",
];

const WINNING_PATTERNS = [
  {
    name: "Won campaign · “Ramp time” · VP Sales 201–500",
    pattern: "Opened on the prospect's own hiring wave (job posts quoted by name)",
    result: "12 closed-won deals",
  },
  {
    name: "Won campaign · “New CRO playbook” · SaaS 250–500",
    pattern: "Referenced the new sales leader's first 90-day priorities",
    result: "9 opportunities, 4 won",
  },
  {
    name: "Won campaign · “Peer proof” · B2B SaaS",
    pattern: "One named peer company of the same size with a quantified outcome",
    result: "highest call-booking rate of the workspace",
  },
];

export function ScorePanel({
  step,
  analyzing,
  onCollapse,
}: {
  step: SequenceStep;
  analyzing: boolean;
  onCollapse?: () => void;
}) {
  const { messageScore } = useLemScore();
  const result = messageScore(step.id);
  const icp = getIcpState();
  const targetSegment = icpLabel(icp.context);
  const negative = [...result.factors]
    .filter((factor) => factor.contribution < 0)
    .sort((a, b) => a.contribution - b.contribution)
    .slice(0, 3);
  const priority = negative[0] ?? result.factors[0];
  const unavailable = result.validity !== "valid";

  const seed = step.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const icpTrait = ICP_TRAITS[seed % ICP_TRAITS.length]!;
  const winnerCallRate = Math.round(result.prediction.positiveReplyRate * 2.1 + 6);
  const yourCallRate = Math.max(
    1,
    Math.round((winnerCallRate * (55 + result.score * 0.4)) / 100),
  );
  const personalizationMatch = Math.min(96, Math.max(18, Math.round(result.score * 0.9)));
  const winningCampaigns = WINNING_PATTERNS.map((campaign, index) => ({
    ...campaign,
    similarity: 92 - index * 7 - (seed % 4),
  }));

  return (
    <aside
      className="m-3 flex h-[calc(100%-1.5rem)] flex-col gap-4 overflow-y-auto rounded-2xl border-2 border-primary/70 bg-background p-4 shadow-[0_12px_32px_-22px_rgba(37,99,235,0.75)]"
      aria-label="lemScore panel"
    >
      <div className="flex items-start gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Message optimization
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Sequence {step.variant} · {channelLabel(step.channel)}
          </p>
        </div>
        <InfoPopover
          className="w-96"
          label="This is not lemlist's generic writing or deliverability score. It evaluates the exact message against the confirmed Campaign ICP, channel, position and timing, then compares that context with commercially similar historical messages and outcomes. Individual prospect fit is calculated separately in Prospect list."
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

      <section
        className={cn(
          "rounded-xl border-2 p-4",
          unavailable ? "border-warning/60 bg-warning-soft/40" : bandFrameClasses(result.score),
        )}
      >
        <p className="mb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          Live message score
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tabular-nums">{result.score}</span>
          <span className="text-sm text-muted-foreground">/100</span>
          <InfoPopover label={`This 0–100 number is an optimization index, not a reply probability. It measures how closely this exact message matches outcome-winning patterns for the confirmed ICP: ${targetSegment}. Changing the selected prospects does not change it.`} />
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
              Exact copy × confirmed ICP × channel × position × timing × comparable commercial outcomes.
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
      </section>

      {priority && !unavailable && (
        <HoverCard openDelay={120} closeDelay={100}>
          <HoverCardTrigger asChild>
            <button
              type="button"
              className="w-full rounded-xl border border-warning/35 bg-warning-soft px-3 py-2.5 text-left text-xs transition-colors hover:border-warning/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                <span className="font-semibold text-foreground">Priority insight</span>
                <Sparkles className="ml-auto h-4 w-4 shrink-0 text-lem" aria-hidden="true" />
              </span>
              <span className="mt-1.5 block leading-relaxed text-foreground">
                Your confirmed ICP sits here: <strong>{targetSegment}</strong>. Companies that{" "}
                <strong>{icpTrait}</strong> booked{" "}
                <strong className="text-success">{winnerCallRate}% of calls</strong> with this
                channel, versus <strong>{yourCallRate}%</strong> for messages written like yours.
              </span>
              <span className="mt-1 block text-muted-foreground">
                Gap driver: {priority.label} · hover for the detail
              </span>
            </button>
          </HoverCardTrigger>
          <HoverCardContent align="start" side="right" className="w-96 text-xs leading-relaxed">
            <p className="font-semibold text-foreground">
              What the winning campaigns did differently
            </p>
            <p className="mt-1 text-muted-foreground">
              On {formatCount(result.comparableMessages)} comparable demo messages sent to{" "}
              {targetSegment}, the ones that {icpTrait} generated {winnerCallRate}% of calls.
              Messages sharing your current pattern generated {yourCallRate}%.
            </p>
            <p className="mt-2 font-medium text-foreground">
              {priority.label}: {priority.benchmark}
            </p>
            <p className="mt-1 text-muted-foreground">Your message today: {priority.observed}</p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Diagnostic only. Use lemlist AI if you want help rewriting the copy.
            </p>
          </HoverCardContent>
        </HoverCard>
      )}

      <section className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Sequence context
        </h3>
        <dl className="mt-2 space-y-1.5 text-xs">
          <Row label="Channel" value={channelLabel(step.channel)} />
          <Row label="Message position" value={`Content step ${step.position}`} />
          <Row label="Timing" value={step.timing} />
          <Row label="Confirmed ICP" value={targetSegment} />
          <Row label="Geography" value={icp.context.geography} />
        </dl>
      </section>

      {!unavailable && (
        <details className="group rounded-xl border border-border bg-card p-4">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Why this prediction
            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-3 rounded-lg bg-surface p-3 text-[11px] text-muted-foreground">
            Compared with {formatCount(result.comparableMessages)} context-, channel- and
            target-segment-matched demo messages for {targetSegment}. {result.calibrationSource}. Confidence:{" "}
            {result.confidence}.
          </div>

          <div className="mt-3 rounded-lg border-2 border-lem/45 bg-lem/[0.05] p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-lem uppercase">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Main driver ·
              personalization learned from winning lemlist campaigns
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-foreground">
              Personalization weighs the most in this score. It is not a generic “add a variable”
              rule: we compare your message with lemlist campaigns that actually closed deals on{" "}
              {targetSegment} and reuse their personalization patterns.
            </p>
            <ul className="mt-2 space-y-2">
              {winningCampaigns.map((campaign) => (
                <li key={campaign.name} className="rounded-md border border-border bg-background p-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold">{campaign.name}</span>
                    <span className="ml-auto rounded-full bg-success-soft px-1.5 py-0.5 text-[10px] font-semibold text-success tabular-nums">
                      {campaign.similarity}% similar
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {campaign.pattern} → {campaign.result}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Your message currently matches {personalizationMatch}% of these winning
              personalization patterns.
            </p>
          </div>

          <p className="mt-3 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Global metrics (intent, length, tone, proof, CTA)
          </p>
          <ul className="mt-2 space-y-2.5">
            {result.factors.map((factor) => (
              <FactorRow key={factor.label} factor={factor} />
            ))}
          </ul>
        </details>
      )}

      <p className="flex items-start gap-2 rounded-lg border border-border bg-card p-3 text-[11px] leading-relaxed text-muted-foreground">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
        This message score uses the confirmed Campaign ICP but stays independent from the selected
        prospect list. Prospect list then adds each real prospect's context to score the full assigned
        sequence. Launch freezes both predictions so actual outcomes can validate them later.
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
