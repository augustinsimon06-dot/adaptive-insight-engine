import { useState } from "react";
import { AlertTriangle, Mail, Rocket, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLemScore } from "@/lib/lemscore/store";
import type { VariantId } from "@/lib/lemscore/types";
import { DemoBadge, InfoPopover } from "./shared";
import { WorkflowCanvas } from "./workflow-canvas";

export function LaunchScreen() {
  const { steps, prospectsFor, launched, launch, activeProspects } = useLemScore();
  const [variant, setVariant] = useState<VariantId>("A");
  const [search, setSearch] = useState("");

  const visibleProspects = activeProspects.filter((prospect) =>
    `${prospect.name} ${prospect.company}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex h-[calc(100vh-6.5rem)] min-h-[620px] flex-col overflow-hidden bg-surface">
      <div className="flex items-center gap-2 border-b border-border bg-background px-6 py-3">
        <h2 className="text-sm font-semibold">Review &amp; launch</h2>
        <DemoBadge />
        <span className="ml-auto inline-flex items-center gap-2 rounded-lg bg-success-soft px-3 py-1.5 text-xs font-semibold text-success">
          All checks complete
        </span>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-r border-border bg-background">
          <div className="flex border-b border-border px-4 pt-3">
            <button className="border-b-2 border-primary px-3 py-2 text-sm font-semibold text-primary">
              To send <span className="ml-1 text-xs">{activeProspects.length}</span>
            </button>
            <button className="px-3 py-2 text-sm font-medium text-muted-foreground">
              Sent <span className="ml-1 text-xs">0</span>
            </button>
          </div>
          <div className="border-b border-border p-4">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search prospects"
                className="pl-9"
              />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <p className="px-2 pb-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              {visibleProspects.length} prospects ready
            </p>
            <div className="space-y-2">
              {visibleProspects.map((prospect, index) => (
                <button
                  key={prospect.id}
                  type="button"
                  onClick={() => setVariant(prospect.variant)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                    index === 0
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:border-border hover:bg-muted/30",
                  )}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {prospect.firstName[0]}
                    {prospect.lastName[0]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{prospect.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {prospect.email}
                    </span>
                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Mail className="h-3 w-3" /> Sequence {prospect.variant}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-3 border-b border-border bg-background px-5 py-3">
            <div className="inline-flex rounded-lg border border-border p-0.5" role="tablist">
              {(["A", "B"] as VariantId[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={variant === item}
                  onClick={() => setVariant(item)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-semibold",
                    variant === item
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  Sequence {item}
                </button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {prospectsFor(variant).length} prospects · random 50/50 split preserved
            </span>
            <InfoPopover label="Each prospect receives exactly one A/B variant. lemScore evaluates the fixed messages but never changes the split or sends anything automatically in this beta." />
          </div>

          <WorkflowCanvas
            variant={variant}
            steps={steps(variant)}
            prospectCount={prospectsFor(variant).length}
            showContent
            className="min-h-0 flex-1"
            onAddStep={() =>
              toast("Add a step", {
                description: "The launch review preserves the fixed A/B workflow.",
              })
            }
          />

          <div className="flex flex-wrap items-center gap-3 border-t border-border bg-background px-5 py-3 shadow-[0_-6px_20px_rgba(15,23,42,0.05)]">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <span>
                Beta simulation: no real message will be sent. Scores never block the launch.
              </span>
            </div>
            <Button
              className="ml-auto"
              disabled={launched}
              onClick={() => {
                launch();
                toast.success("Demo A/B campaign launched", {
                  description:
                    "No real message was sent. lemScore snapshots were frozen for Performance.",
                });
              }}
            >
              <Rocket className="h-4 w-4" />
              {launched ? "Campaign active (demo)" : "Launch A/B campaign (demo)"}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
