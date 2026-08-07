import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Equal, Info, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { scoreBand } from "@/lib/lemscore/scoring";

export const BETA_EXPLANATION =
  "This beta uses deterministic demo benchmarks and outcomes. Production lemScore would use anonymized lemlist patterns, workspace history, CRM outcomes and prospect context.";

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase",
        className,
      )}
    >
      Demo data
    </span>
  );
}

export function BetaBadge() {
  return (
    <InfoPopover
      label={BETA_EXPLANATION}
      trigger={
        <span className="inline-flex items-center gap-1 rounded-full border border-lem/30 bg-lem-soft px-2 py-0.5 text-[10px] font-semibold tracking-wide text-lem uppercase">
          <Sparkles className="h-3 w-3" aria-hidden="true" /> Beta · Demo data
        </span>
      }
    />
  );
}

/** Tooltip that also opens with click and keyboard focus. */
export function InfoPopover({
  trigger,
  label,
  children,
  className,
}: {
  trigger?: ReactNode;
  label?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            aria-label="More information"
            className="inline-flex rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className={cn("w-80 text-xs leading-relaxed", className)}>
        {children ?? label}
      </PopoverContent>
    </Popover>
  );
}

export function bandClasses(score: number) {
  const band = scoreBand(score);
  if (band === "strong") return "border-success/40 bg-success-soft text-success";
  if (band === "medium") return "border-warning/40 bg-warning-soft text-warning";
  return "border-destructive/40 bg-destructive/10 text-destructive";
}

export function bandWord(score: number) {
  const band = scoreBand(score);
  return band === "strong" ? "Strong fit" : band === "medium" ? "Medium fit" : "Weak fit";
}

export function ScorePill({
  score,
  size = "sm",
  suffix = true,
  className,
}: {
  score: number;
  size?: "sm" | "lg";
  suffix?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold tabular-nums",
        bandClasses(score),
        size === "lg" ? "px-2.5 py-1 text-sm" : "px-2 py-0.5 text-xs",
        className,
      )}
    >
      {score}
      {suffix ? "/100" : ""}
      <span className="sr-only"> — {bandWord(score)}</span>
      <span aria-hidden="true" className="text-[10px] font-medium opacity-80">
        {bandWord(score)}
      </span>
    </span>
  );
}

export type TrendDetail = {
  trend: "up" | "down" | "flat";
  launchScore: number | null;
  currentScore: number;
  predictedPositive: number;
  actualPositive: number | null;
  predictedOpportunity: number;
  actualOpportunity: number | null;
  sends: number;
  confidence: string;
  explanation: string;
};

export function TrendArrow({ trend }: { trend: "up" | "down" | "flat" }) {
  const Icon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Equal;
  const label =
    trend === "up"
      ? "above prediction"
      : trend === "down"
        ? "below prediction"
        : "in line with prediction";
  return (
    <span
      className={cn(
        "inline-flex items-center",
        trend === "up" && "text-success",
        trend === "down" && "text-destructive",
        trend === "flat" && "text-muted-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function TrendIndicator({ detail, className }: { detail: TrendDetail; className?: string }) {
  return (
    <InfoPopover
      className="w-80"
      trigger={
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 rounded px-1 font-semibold tabular-nums focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            className,
          )}
          aria-label={`Score ${detail.currentScore}, ${detail.explanation}`}
        >
          {detail.currentScore}
          <TrendArrow trend={detail.trend} />
        </button>
      }
    >
      <div className="space-y-1">
        <Line label="Score at launch" value={detail.launchScore ?? "—"} />
        <Line label="Current score" value={detail.currentScore} />
        <Line label="Predicted positive reply rate" value={`${detail.predictedPositive}%`} />
        <Line
          label="Actual positive reply rate"
          value={detail.actualPositive === null ? "—" : `${detail.actualPositive}%`}
        />
        <Line
          label="Predicted qualified opportunity rate"
          value={`${detail.predictedOpportunity}%`}
        />
        <Line
          label="Actual qualified opportunity rate"
          value={detail.actualOpportunity === null ? "—" : `${detail.actualOpportunity}%`}
        />
        <Line label="Analyzed sends" value={detail.sends} />
        <Line label="Confidence" value={detail.confidence} />
        <p className="pt-1 text-muted-foreground">{detail.explanation}</p>
        <DemoBadge className="mt-1" />
      </div>
    </InfoPopover>
  );
}

function Line({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card shadow-card", className)}>
      {children}
    </div>
  );
}

export function LemMark({ className }: { className?: string }) {
  return <Sparkles className={cn("h-3.5 w-3.5 text-lem", className)} aria-hidden="true" />;
}

export { Tooltip, TooltipContent, TooltipTrigger };
