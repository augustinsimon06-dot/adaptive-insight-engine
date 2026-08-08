import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Lock, PanelRightOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { channelLabel } from "@/lib/lemscore/benchmarks";
import { getIcpState, icpLabel } from "@/lib/lemscore/icp";
import { useLemScore } from "@/lib/lemscore/store";
import type { SequenceStep, VariantId } from "@/lib/lemscore/types";
import { MessagePreviewDialog } from "./message-preview-dialog";
import { ScorePanel } from "./score-panel";
import { DemoBadge, InfoPopover, ScorePill } from "./shared";
import { WorkflowCanvas } from "./workflow-canvas";

export function SequenceScreen() {
  const store = useLemScore();
  const {
    selectedVariant,
    selectedStepId,
    panelOpen,
    lemScoreEnabled,
    lemScoreEntitled,
    update,
    steps,
    setStepContent,
    prospectsFor,
  } = store;
  const icp = getIcpState();
  const lemScoreActive = lemScoreEnabled && lemScoreEntitled;
  const variantSteps = steps(selectedVariant);
  const selected = variantSteps.find((s) => s.id === selectedStepId) ?? variantSteps[0]!;

  const [draftSubject, setDraftSubject] = useState(selected.subject ?? "");
  const [draftBody, setDraftBody] = useState(selected.body ?? "");
  const [analyzing, setAnalyzing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDraftSubject(selected.subject ?? "");
    setDraftBody(selected.body ?? "");
    setAnalyzing(false);
    if (timer.current) clearTimeout(timer.current);
  }, [selected.id, selected.subject, selected.body]);

  const scheduleCommit = (patch: { subject?: string; body?: string }) => {
    if (lemScoreActive) setAnalyzing(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setStepContent(selected.id, patch);
      setAnalyzing(false);
    }, 500);
  };

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const selectStep = (id: string) => update({ selectedStepId: id });
  const selectVariant = (v: VariantId) => {
    const first = steps(v).find((s) => s.hasContent)!;
    update({ selectedVariant: v, selectedStepId: first.id });
  };

  const activateLemScore = () => {
    if (!lemScoreEntitled) {
      window.location.href = "https://www.lemlist.com/fr/tarifs";
      return;
    }
    if (!lemScoreEnabled) {
      update({ lemScoreEnabled: true, panelOpen: true });
      toast.success("lemScore activated", {
        description: "Sequence and prospect prediction scores are now available.",
      });
      return;
    }
    update({ panelOpen: true });
  };

  return (
    <div className="flex h-[calc(100vh-6.5rem)] min-h-[620px] flex-col overflow-hidden bg-surface">
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-background px-6 py-3">
        <div
          className="inline-flex rounded-lg border border-border p-0.5"
          role="tablist"
          aria-label="A/B variants"
        >
          {(["A", "B"] as VariantId[]).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={selectedVariant === v}
              onClick={() => selectVariant(v)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                selectedVariant === v
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Sequence {v}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          A/B test active · leads split 50/50 · each prospect receives exactly one variant
        </span>
        <InfoPopover label="A/B assignment stays unchanged. When lemScore is active, each variant is evaluated independently and prospects are never rerouted automatically." />

        <div className="ml-auto flex items-center gap-2">
          {lemScoreActive && !panelOpen && (
            <Button variant="outline" size="sm" onClick={() => update({ panelOpen: true })}>
              <PanelRightOpen className="h-4 w-4" /> Show lemScore
            </Button>
          )}
          <HoverCard openDelay={120} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Button
                size="sm"
                onClick={activateLemScore}
                className={cn(
                  "gap-2",
                  !lemScoreEntitled &&
                    "border border-border bg-muted text-muted-foreground shadow-none hover:bg-muted hover:text-foreground",
                  lemScoreEntitled && !lemScoreEnabled &&
                    "border border-lem/40 bg-lem text-white hover:bg-lem/90",
                  lemScoreActive &&
                    "border border-success/40 bg-success-soft text-success shadow-none hover:bg-success-soft",
                )}
              >
                {!lemScoreEntitled && <Lock className="h-3.5 w-3.5" />}
                <Sparkles className="h-3.5 w-3.5" />
                {lemScoreActive ? "lemScore active" : "Activate lemScore"}
                <span className="rounded-full border border-current/20 px-1.5 py-0.5 text-[9px] font-bold tracking-wide">
                  NEW
                </span>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent align="end" className="w-80 text-xs leading-relaxed">
              <p className="font-semibold text-foreground">New · lemScore</p>
              <p className="mt-1 text-muted-foreground">
                Compare your sequence and each prospect with historical campaign outcomes to predict,
                before sending, where this campaign is most likely to work.
              </p>
              {!lemScoreEntitled && (
                <p className="mt-2 font-medium text-foreground">
                  Available with the lemScore add-on · click to view plans.
                </p>
              )}
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>

      {lemScoreActive ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-primary/15 bg-primary/[0.035] px-6 py-2 text-xs">
          <span className="font-medium text-muted-foreground">Scoring against AI Context Center ICP:</span>
          <strong className="text-foreground">{icpLabel(icp.context)}</strong>
          <span className="text-muted-foreground">· {icp.context.geography}</span>
          <span className="ml-auto rounded-full border border-success/30 bg-success-soft px-2 py-0.5 text-[10px] font-semibold text-success">
            Live prediction active
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 border-b border-lem/30 bg-lem/[0.07] px-6 py-2 text-xs">
          <Sparkles className="h-3.5 w-3.5 text-lem" />
          <span className="font-medium text-lem">
            Discover lemScore:
          </span>
          <span className="text-foreground/80">
            use your past campaign outcomes to predict which pre-selected prospects best match the
            sequence you just built.
          </span>
          {!lemScoreEntitled && (
            <span className="ml-auto rounded-full border border-lem/30 bg-lem/10 px-2 py-0.5 font-semibold text-lem">
              Premium add-on
            </span>
          )}
        </div>
      )}

      <div
        className={cn(
          "grid min-h-0 flex-1 gap-0 overflow-hidden xl:grid-cols-[390px_minmax(0,1fr)]",
          lemScoreActive && panelOpen && "xl:grid-cols-[390px_360px_minmax(0,1fr)]",
        )}
      >
        <WorkflowCanvas
          variant={selectedVariant}
          steps={variantSteps}
          selectedId={selected.id}
          onSelect={selectStep}
          prospectCount={prospectsFor(selectedVariant).length}
          className="min-h-0 border-r border-border"
          onAddStep={() =>
            toast("Add a step", {
              description:
                "The beta keeps the current multichannel workflow fixed for a reliable demo.",
            })
          }
        />

        {lemScoreActive && panelOpen && selected.hasContent && (
          <div className="hidden min-h-0 overflow-hidden xl:block">
            <ScorePanel
              step={selected}
              analyzing={analyzing}
              onCollapse={() => update({ panelOpen: false })}
            />
          </div>
        )}
        {lemScoreActive && panelOpen && !selected.hasContent && (
          <div className="m-3 hidden min-h-0 rounded-2xl border-2 border-primary/60 bg-background p-4 text-xs text-muted-foreground xl:block">
            This is an action step with no message to evaluate. Select an email, LinkedIn message or
            script step to see its lemScore.
          </div>
        )}

        <div className="min-h-0 min-w-0 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold">{selected.label}</h2>
              <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                {channelLabel(selected.channel)}
              </span>
              {lemScoreActive && selected.hasContent && (
                <MobilePanelTrigger step={selected} analyzing={analyzing} />
              )}
              {selected.hasContent && (
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      toast("Delivery mode", {
                        description: "This campaign step is automated for every assigned prospect.",
                      })
                    }
                  >
                    Automated <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                  <MessagePreviewDialog step={selected} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-lem/40 text-lem hover:bg-lem-soft"
                    onClick={() =>
                      toast("lemlist AI", {
                        description:
                          "The existing lemlist AI writing assistant opens here. lemScore stays diagnostic-only.",
                      })
                    }
                  >
                    <Sparkles className="h-4 w-4" /> lemlist AI
                  </Button>
                </div>
              )}
            </div>

            {selected.hasContent ? (
              <div className="rounded-xl border border-border bg-card p-4">
                {selected.channel === "email" && (
                  <div className="mb-3">
                    <label htmlFor="subject" className="text-xs font-medium text-muted-foreground">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      value={draftSubject}
                      onChange={(e) => {
                        setDraftSubject(e.target.value);
                        scheduleCommit({ subject: e.target.value, body: draftBody });
                      }}
                      className="mt-1"
                    />
                  </div>
                )}
                <label htmlFor="body" className="text-xs font-medium text-muted-foreground">
                  Message
                </label>
                <Textarea
                  id="body"
                  value={draftBody}
                  rows={16}
                  onChange={(e) => {
                    setDraftBody(e.target.value);
                    scheduleCommit({ subject: draftSubject, body: e.target.value });
                  }}
                  className="mt-1 font-normal leading-relaxed"
                />
                {lemScoreActive && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    lemScore evaluates this exact message against the ICP already stored in lemlist,
                    plus channel, order and timing. Individual sequence-to-prospect fit is calculated
                    in Prospect list. It never edits your copy.
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{channelLabel(selected.channel)}</p>
                <p className="mt-1">
                  This step has no message content, so there is no copy to edit here.
                </p>
                <DemoBadge className="mt-3" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobilePanelTrigger({ step, analyzing }: { step: SequenceStep; analyzing: boolean }) {
  const { messageScore } = useLemScore();
  const result = useMemo(() => messageScore(step.id), [messageScore, step.id]);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="xl:hidden">
          Message score <ScorePill score={result.score} validity={result.validity} />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="px-4 pt-4">
          <SheetTitle>lemScore</SheetTitle>
        </SheetHeader>
        <ScorePanel step={step} analyzing={analyzing} />
      </SheetContent>
    </Sheet>
  );
}
