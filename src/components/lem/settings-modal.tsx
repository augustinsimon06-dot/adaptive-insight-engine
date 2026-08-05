import { AlertTriangle, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/lib/app-state";
import { InfoTip } from "./shared";
import { toast } from "sonner";

export function SettingsModal() {
  const { settingsOpen, setSettingsOpen, settings, updateSettings } = useApp();

  return (
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-adaptive" /> Adaptive Challenger settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <section>
            <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Learning-cycle trigger
            </h4>
            <div className="mt-2 flex items-center gap-2 text-sm">
              Start a new learning cycle after
              <Input
                type="number"
                min={5}
                value={settings.triggerThreshold}
                onChange={(e) => updateSettings({ triggerThreshold: Number(e.target.value) })}
                className="h-8 w-20"
              />
              additional final outcomes
            </div>
          </section>

          <section>
            <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Data sources used
            </h4>
            <div className="mt-2 space-y-1">
              <Toggle
                label="CRM outcomes"
                checked={settings.sourceCrm}
                onChange={(v) => updateSettings({ sourceCrm: v })}
              />
              <Toggle
                label="Campaign replies"
                checked={settings.sourceReplies}
                onChange={(v) => updateSettings({ sourceReplies: v })}
              />
              <Toggle
                label="Prospect data"
                checked={settings.sourceProspects}
                onChange={(v) => updateSettings({ sourceProspects: v })}
              />
              <Toggle
                label="Sales-call insights"
                checked={settings.sourceCalls}
                onChange={(v) => updateSettings({ sourceCalls: v })}
              />
              <Toggle
                label="Use anonymized lemlist network benchmarks"
                hint="Only anonymized and aggregated performance patterns are used. Other companies' identities, prospects, exact messages and private campaign strategies are never displayed."
                checked={settings.networkBenchmarks}
                onChange={(v) => updateSettings({ networkBenchmarks: v })}
              />
            </div>
            {settings.networkBenchmarks && (
              <p className="mt-2 rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-muted-foreground">
                Only anonymized and aggregated performance patterns are used. Other companies'
                identities, prospects, exact messages and private campaign strategies are never
                displayed. Adaptive Challenger works without this setting, using only your own
                campaign data, CRM outcomes, prospect data, replies and sales conversations.
              </p>
            )}
          </section>

          <section>
            <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Governance
            </h4>
            <div className="mt-2 space-y-1">
              <Toggle
                label="Require human approval before launch"
                checked={settings.humanApproval}
                onChange={(v) => updateSettings({ humanApproval: v })}
              />
              <Toggle
                label="Notify when enough results are available"
                checked={settings.notify}
                onChange={(v) => updateSettings({ notify: v })}
              />
              <Toggle
                label="Automatically replace current strategy"
                checked={settings.autoReplace}
                onChange={(v) => {
                  if (v) {
                    toast.warning(
                      "Automatic replacement stays off in this prototype. An Adaptive hypothesis must be reviewed by a human before it can replace a live strategy.",
                    );
                    return;
                  }
                  updateSettings({ autoReplace: false });
                }}
              />
            </div>
            {!settings.autoReplace && (
              <p className="mt-2 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Automatic campaign replacement is disabled. Every Adaptive change must be reviewed
                and approved.
              </p>
            )}
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setSettingsOpen(false)}>
            Close
          </Button>
          <Button
            onClick={() => {
              setSettingsOpen(false);
              toast.success("Settings saved");
            }}
          >
            Save settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted">
      <span className="flex items-center gap-1.5">
        {label}
        {hint ? <InfoTip label={hint} /> : null}
      </span>
      <Switch className="ml-auto" checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
