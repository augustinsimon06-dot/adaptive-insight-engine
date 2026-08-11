import { ChevronDown, Loader2, PanelRightClose, Sparkles } from "lucide-react";
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
} from "./shared";

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
  const unavailable = result.validity !== "valid";

  const decision =
    step.variant === "B"
      ? {
          action: "Switch angle",
          current: "Cost-reduction angle",
          recommended: "Time-saving angle",
          reason:
            "For this audience, comparable campaigns using a time-saving angle generated stronger positive replies and meetings than cost-reduction pitches.",
          expectedScore: Math.min(94, result.score + 17),
        }
      : {
          action: "Keep angle · soften CTA",
          current: "Time-saving angle + 15-minute meeting ask",
          recommended: "Keep the time-saving angle; replace the meeting ask with a low-friction question",
          reason:
            "The angle already matches a strong historical pattern for this audience. The clearest remaining weakness is the CTA: comparable first touches performed better with a soft question before asking for a meeting.",
          expectedScore: Math.min(96, result.score + 6),
        };

  const drivers =
    step.variant === "B"
      ? [
          {
            label: "Audience fit",
            status: "Strong",
            detail: targetSegment,
            tone: "good" as const,
          },
          {
            label: "Angle",
            status: "Main gap",
            detail: "Cost reduction underperformed time-saving in comparable campaigns.",
            tone: "bad" as const,
          },
          {
            label: "CTA",
            status: "Neutral",
            detail: "No major issue compared with the angle choice.",
            tone: "neutral" as const,
          },
        ]
      : [
          {
            label: "Audience fit",
            status: "Strong",
            detail: targetSegment,
            tone: "good" as const,
          },
          {
            label: "Angle",
            status: "Strong",
            detail: "Time-saving matches a strong historical pattern for this audience.",
            tone: "good" as const,
          },
          {
            label: "CTA",
            status: "Main gap",
            detail: "A soft question historically outperformed a direct meeting ask on comparable first touches.",
            tone: "bad" as const,
          },
        ];

  return (
    <aside
      className="m-3 flex h-[calc(100%-1.5rem)] flex-col gap-4 overflow-y-auto rounded-2xl border-2 border-primary/70 bg-background p-4 shadow-[0_12px_32px_-22px_rgba(37,99,235,0.75)]"
      aria-label="lemScore panel"
    >
      <div className="flex items-start gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> lemScore · Sequence
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Sequence {step.variant} · {channelLabel(step.channel)}
          </p>
        </div>
        <InfoPopover
          className="w-96"
          label="Sequence lemScore answers one question: how well does this campaign strategy fit the target audience, based on comparable historical outcomes? Prospect-level fit is handled separately in Prospect list."
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
        <div className="flex items-start gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
              1 · Score
            </p>
            <p className="mt-1 text-xs font-semibold text-foreground">
              Campaign ↔ audience fit
            </p>
          </div>
          {analyzing && (
            <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating…
            </span>
          )}
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-semibold tabular-nums">{result.score}</span>
          <span className="text-sm text-muted-foreground">/100</span>
          {!unavailable && (
            <span
              className={cn(
                "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
                bandClasses(result.score),
              )}
            >
              {bandLabel(result.score)}
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
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              How well this exact campaign strategy fits the target audience, using comparable historical outcomes.
            </p>
            <div className="mt-3 rounded-lg border border-border bg-background px-3 py-2 text-xs">
              <span className="text-muted-foreground">Audience being evaluated</span>
              <strong className="ml-2 text-foreground">{targetSegment}</strong>
            </div>
          </>
        )}
      </section>

      {!unavailable && (
        <section className="rounded-xl border border-border bg-card p-4">
          <div>
            <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
              2 · Why this score
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              The three factors that matter most in this demo.
            </p>
          </div>

          <div className="mt-3 space-y-2">
            {drivers.map((driver) => (
              <DriverRow key={driver.label} {...driver} />
            ))}
          </div>
        </section>
      )}

      {!unavailable && (
        <section className="rounded-xl border-2 border-lem/45 bg-lem/[0.05] p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-lem" aria-hidden="true" />
            <div>
              <p className="text-[10px] font-semibold tracking-wide text-lem uppercase">
                3 · What to change
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
                Current
              </p>
              <p className="mt-1 font-medium">{decision.current}</p>
            </div>
            <div className="rounded-lg border border-success/30 bg-success-soft/40 p-2.5">
              <p className="text-[10px] font-semibold tracking-wide text-success uppercase">
                Recommended
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
            lemScore recommends <strong>what to change and why</strong>. lemlist AI can then generate or rewrite the copy.
          </p>
        </section>
      )}

      {!unavailable && (
        <details className="group rounded-xl border border-border bg-card p-4">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold text-muted-foreground">
            How is this score calculated?
            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>

          <div className="mt-3 space-y-2 text-xs">
            <TechnicalRow
              label="Client context"
              value="What the lemlist customer sells, positioning and market"
            />
            <TechnicalRow
              label="Audience"
              value={targetSegment}
            />
            <TechnicalRow
              label="Campaign strategy"
              value="Angle · CTA · proof · copy · channel · order · timing"
            />
            <TechnicalRow
              label="Historical evidence"
              value="Comparable campaigns evaluated on positive replies and meetings"
            />
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            The 0–100 score is an optimization index, not a reply probability. In production, the model would be calibrated on observed outcomes; the values shown here are illustrative demo data.
          </p>
        </details>
      )}

      <DemoBadge className="w-fit" />
    </aside>
  );
}

function DriverRow({
  label,
  status,
  detail,
  tone,
}: {
  label: string;
  status: string;
  detail: string;
  tone: "good" | "bad" | "neutral";
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-2.5">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-foreground">{label}</span>
        <span
          className={cn(
            "ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold",
            tone === "good" && "bg-success-soft text-success",
            tone === "bad" && "bg-destructive/10 text-destructive",
            tone === "neutral" && "bg-surface text-muted-foreground",
          )}
        >
          {status}
        </span>
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function TechnicalRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-2.5">
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-foreground">{value}</p>
    </div>
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

export function ScorePillForStep({ stepId }: { stepId: string }) {
  const { messageScore } = useLemScore();
  const result = messageScore(stepId);
  return <ScorePill score={result.score} validity={result.validity} />;
}
