import { AlertTriangle, ChevronDown, Loader2, PanelRightClose, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    name: "Campaign · “Ramp time” · VP Sales 201–500",
    pattern: "Opened on the prospect's own hiring wave (job posts quoted by name)",
    result: "12.4% positive replies · 6.1% meetings",
  },
  {
    name: "Campaign · “New CRO playbook” · SaaS 250–500",
    pattern: "Referenced the new sales leader's first 90-day priorities",
    result: "9.8% positive replies · 4.7% meetings",
  },
  {
    name: "Campaign · “Peer proof” · B2B SaaS",
    pattern: "One named peer company of the same size with a quantified outcome",
    result: "highest meeting-booking rate in the comparable sample",
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

  const decision =
    step.variant === "B"
      ? {
          action: "Switch angle",
          current: "Broad onboarding suite / productivity",
          recommended: "Ramp-time during active sales hiring",
          reason:
            "For VP Sales in growing B2B SaaS accounts, comparable campaigns tied to an active hiring wave outperformed broad product-suite pitches on positive replies and meetings.",
          expectedScore: Math.min(94, result.score + 17),
        }
      : {
          action: "Keep angle · change CTA",
          current: "Ramp-time during active sales hiring",
          recommended: "Keep the ramp-time angle; replace the 15-minute ask with a low-friction question",
          reason:
            "The angle already matches a strong historical pattern for this audience. The largest remaining gap is the CTA: comparable first touches performed better with a soft question before asking for a meeting.",
          expectedScore: Math.min(96, result.score + 6),
        };

  return (
    <aside
      className="m-3 flex h-[calc(100%-1.5rem)] flex-col gap-4 overflow-y-auto rounded-2xl border-2 border-primary/70 bg-background p-4 shadow-[0_12px_32px_-22px_rgba(37,99,235,0.75)]"
      aria-label="lemScore panel"
    >
      <div className="flex items-start gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Outcome-based decision layer
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Sequence {step.variant} · {channelLabel(step.channel)}
          </p>
        </div>
        <InfoPopover
          className="w-96"
          label="lemScore does not replace lemlist AI generation. lemlist AI can write or personalize the copy; lemScore estimates which angle, CTA, proof, channel, order and timing are most consistent with historically successful outcomes for this client context and audience. Individual sequence-to-prospect fit is calculated separately in Prospect list."
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
          Live sequence score
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tabular-nums">{result.score}</span>
          <span className="text-sm text-muted-foreground">/100</span>
          <InfoPopover label={`This 0–100 number is an optimization index, not a reply probability. It measures how closely this exact strategy matches outcome-winning patterns for the client context and ICP stored in lemlist: ${targetSegment}. Changing the selected prospects does not change this sequence-level score.`} />
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
              Client context × exact angle/copy/CTA × ICP/persona × channel/order/timing × comparable historical outcomes.
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

      {!unavailable && (
        <section className="rounded-xl border-2 border-lem/45 bg-lem/[0.05] p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-lem" aria-hidden="true" />
            <div>
              <p className="text-[10px] font-semibold tracking-wide text-lem uppercase">
                Highest-impact decision
              </p>
              <p className="text-xs font-semibold text-foreground">{decision.action}</p>
            </div>
            <span className="ml-auto rounded-full border border-lem/25 bg-background px-2 py-1 text-[10px] font-semibold text-lem">
              Demo recommendation
            </span>
          </div>

          <div className="mt-3 grid gap-2 text-xs">
            <div className="rounded-lg border border-border bg-background p-2.5">
              <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                Current strategy
              </p>
              <p className="mt-1 font-medium">{decision.current}</p>
            </div>
            <div className="rounded-lg border border-success/30 bg-success-soft/40 p-2.5">
              <p className="text-[10px] font-semibold tracking-wide text-success uppercase">
                Historically stronger fit
              </p>
              <p className="mt-1 font-semibold text-foreground">{decision.recommended}</p>
            </div>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-foreground">
            <strong>Why:</strong> {decision.reason}
          </p>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-background px-3 py-2 text-xs">
            <span className="text-muted-foreground">Estimated score after change</span>
            <span className="font-semibold tabular-nums">
              {result.score} → <span className="text-success">{decision.expectedScore}</span>
            </span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            lemScore recommends <strong>what to change and why</strong>. lemlist AI can then generate or rewrite the copy; lemScore remains the decision and validation layer.
          </p>
        </section>
      )}

      {priority && !unavailable && (
        <section className="rounded-xl border border-warning/35 bg-warning-soft px-3 py-2.5 text-xs">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
            <span className="font-semibold text-foreground">Evidence behind the recommendation</span>
          </span>
          <p className="mt-1.5 leading-relaxed text-foreground">
            lemlist context: <strong>{targetSegment}</strong>. Comparable prospects that{" "}
            <strong>{icpTrait}</strong> generated{" "}
            <strong className="text-success">{winnerCallRate}% positive engagement</strong> with
            the stronger pattern, versus <strong>{yourCallRate}%</strong> for messages sharing your current pattern.
          </p>
          <p className="mt-1 text-muted-foreground">
            Main gap driver: {priority.label} · {priority.benchmark}
          </p>
        </section>
      )}

      <section className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Inputs used for this score
        </h3>
        <dl className="mt-2 space-y-1.5 text-xs">
          <Row label="Client / ICP context" value={targetSegment} />
          <Row label="Geography" value={icp.context.geography} />
          <Row label="Channel" value={channelLabel(step.channel)} />
          <Row label="Message position" value={`Content step ${step.position}`} />
          <Row label="Timing" value={step.timing} />
          <Row label="Strategy features" value="Angle · CTA · proof · length · tone" />
          <Row label="Outcome targets" value="Positive replies · meetings" />
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
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Patterns learned from comparable lemlist campaigns
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-foreground">
              The demo compares strategy features and prospect context with historically similar campaigns and uses downstream outcomes such as positive replies and meetings to estimate fit. It is not a generic “add a variable” rule.
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
              Your message currently matches {personalizationMatch}% of these historically effective patterns.
            </p>
          </div>

          <p className="mt-3 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Model factors in this demo
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
        Sequence score evaluates the strategy against the client context and target audience. Prospect list then adds each real prospect's company, persona and intent signals to answer a second question: is this exact sequence a strong fit for this specific qualified prospect?
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
