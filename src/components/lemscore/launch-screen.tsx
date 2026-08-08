import { useEffect, useState } from "react";
import { AlertTriangle, Mail, Rocket, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLemScore } from "@/lib/lemscore/store";
import type { VariantId } from "@/lib/lemscore/types";
import { DemoBadge, InfoPopover } from "./shared";
import { WorkflowCanvas } from "./workflow-canvas";

export function LaunchScreen() {
  const { steps, launch, activeProspects, launchedProspects } = useLemScore();
  const [variant, setVariant] = useState<VariantId>("A");
  const [search, setSearch] = useState("");
  const [queueTab, setQueueTab] = useState<"to_send" | "sent">("to_send");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toSendProspects = activeProspects.filter(
    (prospect) => !launchedProspects.some((launchedOne) => launchedOne.id === prospect.id),
  );
  const queueProspects = queueTab === "sent" ? launchedProspects : toSendProspects;
  const visibleProspects = queueProspects.filter((prospect) =>
    `${prospect.name} ${prospect.company}`.toLowerCase().includes(search.toLowerCase()),
  );
  const validSelectedIds = selectedIds.filter((id) =>
    toSendProspects.some((prospect) => prospect.id === id),
  );
  const allSelected =
    toSendProspects.length > 0 &&
    toSendProspects.every((prospect) => validSelectedIds.includes(prospect.id));
  const someSelected = validSelectedIds.length > 0 && !allSelected;

  const previewProspects =
    queueTab === "sent"
      ? launchedProspects
      : validSelectedIds.length
        ? toSendProspects.filter((prospect) => validSelectedIds.includes(prospect.id))
        : toSendProspects;
  const variantProspectCount = previewProspects.filter(
    (prospect) => prospect.variant === variant,
  ).length;

  useEffect(() => {
    if (!previewProspects.length) return;
    if (!previewProspects.some((prospect) => prospect.variant === variant)) {
      setVariant(previewProspects[0]!.variant);
    }
  }, [previewProspects, variant]);

  const toggleProspect = (id: string) => {
    const isSelected = validSelectedIds.includes(id);
    setSelectedIds((previous) =>
      isSelected ? previous.filter((selectedId) => selectedId !== id) : [...previous, id],
    );
    if (!isSelected) {
      const prospect = toSendProspects.find((item) => item.id === id);
      if (prospect) setVariant(prospect.variant);
    }
  };

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : toSendProspects.map((prospect) => prospect.id));
  };

  return (
    <div className="flex h-[calc(100vh-6.5rem)] min-h-[620px] flex-col overflow-hidden bg-surface">
      <div className="flex items-center gap-2 border-b border-border bg-background px-6 py-3">
        <h2 className="text-sm font-semibold">Review &amp; launch</h2>
        <DemoBadge />
        <span className="text-xs text-muted-foreground">
          Final send queue · checked prospects will launch; unchecked prospects stay in the
          campaign.
        </span>
        <span className="ml-auto inline-flex items-center gap-2 rounded-lg bg-success-soft px-3 py-1.5 text-xs font-semibold text-success">
          All checks complete
        </span>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-r border-border bg-background">
          <div className="flex border-b border-border px-4 pt-3">
            <button
              type="button"
              onClick={() => setQueueTab("to_send")}
              className={cn(
                "px-3 py-2 text-sm font-medium",
                queueTab === "to_send"
                  ? "border-b-2 border-primary font-semibold text-primary"
                  : "text-muted-foreground",
              )}
            >
              To send <span className="ml-1 text-xs">{toSendProspects.length}</span>
            </button>
            <button
              type="button"
              onClick={() => setQueueTab("sent")}
              className={cn(
                "px-3 py-2 text-sm font-medium",
                queueTab === "sent"
                  ? "border-b-2 border-primary font-semibold text-primary"
                  : "text-muted-foreground",
              )}
            >
              Sent <span className="ml-1 text-xs">{launchedProspects.length}</span>
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
            <div className="flex items-center gap-2 px-2 pb-3">
              {queueTab === "to_send" && (
                <Checkbox
                  aria-label="Select all prospects to launch"
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={toggleAll}
                />
              )}
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {queueTab === "to_send"
                  ? `${validSelectedIds.length} selected · ${visibleProspects.length} ready`
                  : `${visibleProspects.length} prospects sent`}
              </p>
            </div>
            <div className="space-y-2">
              {visibleProspects.map((prospect) => (
                <div
                  key={prospect.id}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                    queueTab === "to_send" && validSelectedIds.includes(prospect.id)
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:border-border hover:bg-muted/30",
                  )}
                >
                  {queueTab === "to_send" && (
                    <Checkbox
                      aria-label={`Select ${prospect.name} for launch`}
                      checked={validSelectedIds.includes(prospect.id)}
                      onCheckedChange={() => toggleProspect(prospect.id)}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setVariant(prospect.variant)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
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
                </div>
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
              {variantProspectCount} prospect{variantProspectCount === 1 ? "" : "s"} in this{" "}
              {queueTab === "sent"
                ? "sent"
                : validSelectedIds.length
                  ? "selected launch"
                  : "to-send"}{" "}
              view · random 50/50 split preserved
            </span>
            <InfoPopover label="Each prospect receives exactly one A/B variant. lemScore evaluates the fixed messages but never changes the split or sends anything automatically in this beta." />
          </div>

          <WorkflowCanvas
            variant={variant}
            steps={steps(variant)}
            prospectCount={variantProspectCount}
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
              disabled={queueTab !== "to_send" || validSelectedIds.length === 0}
              onClick={() => {
                const count = validSelectedIds.length;
                launch(validSelectedIds, "launch");
                setSelectedIds([]);
                setQueueTab("to_send");
                toast.success("Demo A/B launch completed", {
                  description: `${count} selected prospect${count === 1 ? "" : "s"} were simulated. You can immediately select and launch more prospects.`,
                });
              }}
            >
              <Rocket className="h-4 w-4" />
              {queueTab === "sent"
                ? "Switch to To send to launch"
                : validSelectedIds.length
                  ? `Launch ${validSelectedIds.length} selected prospect${validSelectedIds.length === 1 ? "" : "s"}`
                  : "Select prospects to launch"}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
