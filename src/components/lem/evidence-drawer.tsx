import { Sparkles, AlertTriangle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-state";
import { cycleTotals, evidenceFindings } from "@/lib/mock-data";
import { ConfidencePill, DemoBadge, InfoTip, StatTile } from "./shared";

export function EvidenceDrawer() {
  const { evidenceOpen, setEvidenceOpen, setAnalysisStep } = useApp();

  return (
    <Sheet open={evidenceOpen} onOpenChange={setEvidenceOpen}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="space-y-2">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-4 w-4 text-adaptive" />
            Evidence behind the Adaptive Challenger
          </SheetTitle>
          <DemoBadge />
        </SheetHeader>

        <div className="space-y-5 px-4 pb-8">
          <div className="grid grid-cols-2 gap-2.5">
            <StatTile label="Closed Won analyzed" value={cycleTotals.closedWon} />
            <StatTile label="Closed Lost analyzed" value={cycleTotals.closedLost} />
            <StatTile label="Campaign replies" value={cycleTotals.repliesAnalyzed} />
            <StatTile
              label="Sales conversations"
              value={cycleTotals.conversationsAnalyzed}
              hint="Call recordings and notes attached to deals in this campaign."
            />
          </div>

          <div>
            <div className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              CRM fields used
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {cycleTotals.crmFieldsUsed.map((f) => (
                <span
                  key={f}
                  className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {evidenceFindings.slice(0, 4).map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-4 shadow-card">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-adaptive-soft px-2 py-0.5 text-[11px] font-semibold text-adaptive">
                    {f.category}
                  </span>
                  <InfoTip
                    label={`Confidence reflects how consistently this pattern appeared across the ${cycleTotals.closedWon + cycleTotals.closedLost} demo outcomes analyzed.`}
                  />
                  <ConfidencePill level={f.confidence} />
                </div>
                <h4 className="mt-2 text-sm font-semibold text-foreground">{f.title}</h4>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.pattern}</p>
                <p className="mt-2 text-xs font-medium text-foreground">{f.stat}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            These patterns show correlations in the available demo data. They do not prove why an
            individual deal was won or lost.
          </div>

          <Button
            className="w-full"
            onClick={() => {
              setEvidenceOpen(false);
              setAnalysisStep(3);
            }}
          >
            Review full analysis
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
