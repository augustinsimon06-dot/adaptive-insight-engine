import { Users, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-state";
import { audiences } from "@/lib/mock-data";
import { DemoBadge, FieldRow } from "./shared";
import { toast } from "sonner";

export function CompareAudiencesModal() {
  const { compareOpen, setCompareOpen, setMainTab, setProspectTab } = useApp();
  const c = audiences.current;
  const a = audiences.adaptive;

  return (
    <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Compare audiences <DemoBadge />
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Users className="h-4 w-4 text-muted-foreground" /> Current audience
            </div>
            <div className="mt-2">
              <FieldRow label="Industry" value={c.industry} />
              <FieldRow label="Company size" value={c.companySize} />
              <FieldRow label="Personas" value={c.personas} />
              <FieldRow label="Intent signals" value={c.intent} />
              <FieldRow label="Geography" value={c.geography} />
              <FieldRow
                label="Available prospects"
                value={<span className="font-semibold">{c.prospectCount.toLocaleString()}</span>}
              />
            </div>
          </div>

          <div className="rounded-xl border border-adaptive/30 bg-adaptive-soft/30 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-adaptive">
              <Sparkles className="h-4 w-4" /> Adaptive audience
            </div>
            <div className="mt-2">
              <FieldRow label="Industry" value={a.industry} />
              <FieldRow label="Company size" value={a.companySize} />
              <FieldRow label="Priority persona" value={a.personas} />
              <FieldRow label="Intent signals" value={a.intent} />
              <FieldRow label="Growth / hiring" value={a.growth} />
              <FieldRow label="Geography" value={a.geography} />
              <FieldRow
                label="Matching prospects"
                value={<span className="font-semibold text-adaptive">{a.prospectCount}</span>}
              />
            </div>
          </div>
        </div>

        <p className="rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-muted-foreground">
          The Adaptive audience is a recommendation generated from the latest campaign and CRM
          outcomes. It must be tested before replacing the current targeting strategy.
        </p>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setCompareOpen(false);
              toast("Current audience kept");
            }}
          >
            Keep current audience
          </Button>
          <Button
            onClick={() => {
              setCompareOpen(false);
              setMainTab("prospects");
              setProspectTab("adaptive");
            }}
          >
            Review Adaptive audience
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
