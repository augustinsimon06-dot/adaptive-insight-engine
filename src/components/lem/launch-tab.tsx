import { CheckCircle2, Circle, Rocket, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-state";
import { audiences, campaign } from "@/lib/mock-data";
import { DemoBadge, Panel } from "./shared";
import { toast } from "sonner";

export function LaunchTab() {
  const { launched, setLaunched, audienceApproved, experimentCreated, settings } = useApp();

  return (
    <div className="min-h-[calc(100vh-9rem)] space-y-5 bg-surface px-6 py-6">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Review before launch</h2>
        <DemoBadge />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="p-5">
          <h3 className="text-sm font-semibold">Sequences</h3>
          <div className="mt-3 space-y-2">
            <Row label="Sequence A" value="Ready" ok />
            <Row label="Sequence B" value="Ready" ok />
            <Row
              label="Adaptive Challenger"
              value={experimentCreated ? "Draft ready" : "Draft — not configured"}
              ok={experimentCreated}
            />
          </div>
        </Panel>

        <Panel className="p-5">
          <h3 className="text-sm font-semibold">Audiences</h3>
          <div className="mt-3 space-y-2">
            <Row
              label="Current audience"
              value={`${audiences.current.prospectCount.toLocaleString()} prospects · Ready`}
              ok
            />
            <Row
              label="Adaptive audience"
              value={
                audienceApproved
                  ? `${audiences.adaptive.prospectCount} prospects · Draft approved`
                  : `${audiences.adaptive.prospectCount} prospects · Awaiting approval`
              }
              ok={audienceApproved}
            />
          </div>
        </Panel>

        <Panel className="p-5">
          <h3 className="text-sm font-semibold">Sender &amp; schedule</h3>
          <div className="mt-3 space-y-2">
            <Row label="Sender" value={`${campaign.sender.name} · ${campaign.sender.email}`} ok />
            <Row label="Schedule" value={`${campaign.schedule} · Mon–Fri, 09:00–18:00`} ok />
          </div>
        </Panel>

        <Panel className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" /> Approval requirements
          </h3>
          <div className="mt-3 space-y-2">
            <Row label="Human approval before launch" value={settings.humanApproval ? "Required" : "Off"} ok={settings.humanApproval} />
            <Row label="Automatic strategy replacement" value={settings.autoReplace ? "ON" : "OFF"} ok={!settings.autoReplace} />
            <Row label="Nothing launches automatically" value="Enforced" ok />
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel className="flex flex-col gap-3 p-5">
          <h3 className="text-sm font-semibold">Traditional A/B campaign</h3>
          <p className="text-xs text-muted-foreground">
            Sequence A and Sequence B on the current audience.
          </p>
          <Button
            className="mt-auto"
            disabled={launched.ab}
            onClick={() => {
              setLaunched({ ...launched, ab: true });
              toast.success("A/B campaign launched");
            }}
          >
            <Rocket className="h-4 w-4" />
            {launched.ab ? "A/B campaign running" : "Launch A/B campaign"}
          </Button>
        </Panel>

        <Panel className="flex flex-col gap-3 border-adaptive/30 p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-adaptive">
            <Sparkles className="h-4 w-4" /> Adaptive Challenger
          </h3>
          <p className="text-xs text-muted-foreground">
            Adaptive audience and Adaptive message. Launched and measured separately.
          </p>
          <Button
            className="mt-auto bg-adaptive text-adaptive-foreground hover:bg-adaptive/90"
            disabled={launched.adaptive || !audienceApproved}
            onClick={() => {
              setLaunched({ ...launched, adaptive: true });
              toast.success("Adaptive Challenger launched");
            }}
          >
            <Rocket className="h-4 w-4" />
            {launched.adaptive
              ? "Adaptive Challenger running"
              : audienceApproved
                ? "Launch Adaptive Challenger"
                : "Approve the audience draft first"}
          </Button>
        </Panel>
      </div>
    </div>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm">
      {ok ? (
        <CheckCircle2 className="h-4 w-4 text-success" />
      ) : (
        <Circle className="h-4 w-4 text-muted-foreground" />
      )}
      <span className="font-medium">{label}</span>
      <span className="ml-auto text-xs text-muted-foreground">{value}</span>
    </div>
  );
}
