import { AlertTriangle, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { baseCampaign } from "@/lib/lemscore/data";
import { channelLabel } from "@/lib/lemscore/benchmarks";
import { useLemScore } from "@/lib/lemscore/store";
import type { VariantId } from "@/lib/lemscore/types";
import { DemoBadge, InfoPopover, ScorePill } from "./shared";

export function LaunchScreen() {
  const { steps, prospectsFor, messageScore, launched, launch, activeProspects } = useLemScore();

  return (
    <div className="min-h-[calc(100vh-6.5rem)] space-y-5 bg-surface px-6 py-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold">Review &amp; launch</h2>
        <DemoBadge />
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Prospects</h3>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{activeProspects.length}</p>
            <p className="text-xs text-muted-foreground">
              {prospectsFor("A").length} on Sequence A · {prospectsFor("B").length} on Sequence B
            </p>
            <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
              {activeProspects.slice(0, 5).map((p) => (
                <li key={p.id}>
                  {p.name} — {p.company} · {p.variant}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-xs">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Sender &amp; schedule</h3>
            <p className="mt-1.5 font-medium text-foreground">{baseCampaign.sender.name}</p>
            <p className="text-muted-foreground">{baseCampaign.sender.email}</p>
            <p className="mt-2 text-muted-foreground">{baseCampaign.schedule}</p>
          </div>
          <div className="flex gap-2 rounded-xl border border-warning/40 bg-warning-soft p-3 text-xs text-foreground">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
            Beta simulation: launching never sends a real message. lemScore never blocks a launch.
          </div>
        </div>

        <div className="space-y-4">
          {(["A", "B"] as VariantId[]).map((variant) => (
            <section key={variant} className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold">Sequence {variant}</h3>
              <p className="text-xs text-muted-foreground">
                {prospectsFor(variant).length} prospects assigned · random 50/50 split preserved
              </p>
              <div className="mt-3 space-y-2">
                {steps(variant).map((s) => {
                  if (!s.hasContent) {
                    return (
                      <div key={s.id} className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                        {s.label} · {s.timing} — no message content, no lemScore
                      </div>
                    );
                  }
                  const r = messageScore(s.id);
                  return (
                    <div key={s.id} className="rounded-lg border border-border p-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-medium">{s.timing}</span>
                        <span className="text-muted-foreground">· {channelLabel(s.channel)}</span>
                        <span className="ml-1 inline-flex items-center gap-1.5">
                          <span className="font-semibold">lemScore {r.score}/100</span>
                          <InfoPopover>
                            <div className="space-y-1">
                              <p className="font-medium">Fit of this fixed message with its assigned prospects</p>
                              <p>Strong fit: {r.distribution.strong}%</p>
                              <p>Medium fit: {r.distribution.medium}%</p>
                              <p>Weak fit: {r.distribution.weak}%</p>
                              <p>Confidence: {r.confidence}</p>
                              <p>Predicted positive reply rate: {r.prediction.positiveReplyRate}%</p>
                              <p>Predicted qualified opportunity rate: {r.prediction.opportunityRate}%</p>
                              <DemoBadge className="mt-1" />
                            </div>
                          </InfoPopover>
                        </span>
                        <ScorePill score={r.score} suffix={false} className="ml-auto" />
                      </div>
                      {s.subject && <p className="mt-2 text-xs font-medium">{s.subject}</p>}
                      <p className="mt-1 line-clamp-3 text-xs whitespace-pre-line text-muted-foreground">{s.body}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
            <Button
              disabled={launched}
              onClick={() => {
                launch();
                toast.success("Demo campaign launched", {
                  description: "No real message was sent. lemScore snapshots were frozen and simulated outcomes unlocked.",
                });
              }}
            >
              <Rocket className="h-4 w-4" /> {launched ? "Campaign active (demo)" : "Launch campaign (demo)"}
            </Button>
            <p className="text-xs text-muted-foreground">
              {launched
                ? "Launch snapshots are stored and preserved. Open Performance to compare predictions with simulated outcomes."
                : "Launching saves an immutable lemScore snapshot for every message and unlocks simulated Performance data."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
