import type { ReactNode } from "react";
import { Info, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Confidence } from "@/lib/mock-data";

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase",
        className,
      )}
    >
      Demo data
    </span>
  );
}

export function InfoTip({ label }: { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="More information"
          className="inline-flex text-muted-foreground transition-colors hover:text-foreground"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs leading-relaxed">{label}</TooltipContent>
    </Tooltip>
  );
}

export function ConfidencePill({ level }: { level: Confidence }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        level === "High" && "bg-success-soft text-success",
        level === "Medium" && "bg-amber-50 text-amber-700",
        level === "Low" && "bg-muted text-muted-foreground",
      )}
    >
      {level} confidence
    </span>
  );
}

export function AdaptiveMark({ className }: { className?: string }) {
  return <Sparkles className={cn("h-3.5 w-3.5 text-adaptive", className)} />;
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card shadow-card", className)}>
      {children}
    </div>
  );
}

export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2.5">
      <div className="flex items-center gap-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
        {hint ? <InfoTip label={hint} /> : null}
      </div>
      <div className="mt-1 text-xl font-semibold text-foreground">{value}</div>
    </div>
  );
}

export function FieldRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-3 border-b border-border py-2.5 last:border-b-0">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  );
}
