import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, Eye, Mail, Linkedin, PanelRightOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { channelLabel } from "@/lib/lemscore/benchmarks";
import { baseCampaign } from "@/lib/lemscore/data";
import { useLemScore } from "@/lib/lemscore/store";
import type { OutreachChannel, SequenceStep, VariantId } from "@/lib/lemscore/types";
import { ScorePanel } from "./score-panel";
import { DemoBadge, InfoPopover, ScorePill } from "./shared";

function ChannelIcon({ channel }: { channel: OutreachChannel }) {
  if (channel === "email") return <Mail className="h-4 w-4" aria-hidden="true" />;
  if (channel === "wait") return <Clock className="h-4 w-4" aria-hidden="true" />;
  if (channel === "profile_visit") return <Eye className="h-4 w-4" aria-hidden="true" />;
  return <Linkedin className="h-4 w-4" aria-hidden="true" />;
}

export function SequenceScreen() {
  const store = useLemScore();
  const { selectedVariant, selectedStepId, panelOpen, update, steps, setStepContent, prospectsFor, messageScore } = store;
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
    setAnalyzing(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setStepContent(selected.id, patch);
      setAnalyzing(false);
    }, 1000);
  };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const selectStep = (id: string) => update({ selectedStepId: id });
  const selectVariant = (v: VariantId) => {
    const first = steps(v).find((s) => s.hasContent)!;
    update({ selectedVariant: v, selectedStepId: first.id });
  };

  return (
    <div className="min-h-[calc(100vh-6.5rem)] bg-surface">
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-background px-6 py-3">
        <div className="inline-flex rounded-lg border border-border p-0.5" role="tablist" aria-label="A/B variants">
          {(["A", "B"] as VariantId[]).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={selectedVariant === v}
              onClick={() => selectVariant(v)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                selectedVariant === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              Sequence {v}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          A/B test active · leads split 50/50 · each prospect receives exactly one variant
        </span>
        <InfoPopover label="lemScore does not route prospects toward the highest predicted score and does not change the 50/50 split. Each variant is scored independently." />
        {!panelOpen && (
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={() => update({ panelOpen: true })}>
              <PanelRightOpen className="h-4 w-4" /> Show lemScore
            </Button>
          </div>
        )}
      </div>

      <div
        className={cn(
          "grid gap-0 xl:grid-cols-[280px_360px_minmax(0,1fr)]",
          !panelOpen && "xl:grid-cols-[280px_minmax(0,1fr)]",
        )}
      >
        {/* Canvas */}
        <div className="space-y-3 border-r border-border bg-background p-4">
          <div className="rounded-xl border border-border bg-card p-3">
            <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Sender &amp; schedule</h2>
            <p className="mt-1.5 text-sm font-medium">{baseCampaign.sender.name}</p>
            <p className="text-xs text-muted-foreground">{baseCampaign.sender.email}</p>
            <p className="mt-2 text-xs text-muted-foreground">{baseCampaign.schedule}</p>
          </div>

          <h2 className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Campaign canvas</h2>
          <ol className="space-y-2">
            {variantSteps.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => selectStep(s.id)}
                  aria-current={s.id === selected.id ? "step" : undefined}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    s.id === selected.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <ChannelIcon channel={s.channel} />
                    <span className="text-sm font-medium">{s.label.split("·")[1]?.trim() ?? s.label}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">{s.timing}</span>
                    {s.hasContent ? (
                      <ScorePill score={messageScore(s.id).score} className="ml-auto" />
                    ) : (
                      <span className="ml-auto text-[11px] text-muted-foreground">No content · no score</span>
                    )}
                  </div>
                </button>
                <div className="mx-auto h-3 w-px bg-border" aria-hidden="true" />
              </li>
            ))}
          </ol>
          <p className="text-[11px] text-muted-foreground">
            {prospectsFor(selectedVariant).length} prospects assigned to Sequence {selectedVariant}.
          </p>
        </div>

        {/* lemScore panel (desktop) */}
        {panelOpen && selected.hasContent && (
          <div className="hidden xl:block">
            <ScorePanel step={selected} analyzing={analyzing} onCollapse={() => update({ panelOpen: false })} />
          </div>
        )}
        {panelOpen && !selected.hasContent && (
          <div className="hidden border-l border-r border-border bg-lem-soft/40 p-4 text-xs text-muted-foreground xl:block">
            This step carries no message content, so it does not receive a lemScore. Select an email, LinkedIn message or
            script step.
          </div>
        )}

        {/* Editor */}
        <div className="min-w-0 p-6">
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold">{selected.label}</h2>
              <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                {channelLabel(selected.channel)}
              </span>
              {selected.hasContent && (
                <MobilePanelTrigger step={selected} analyzing={analyzing} />
              )}
              <Button
                variant="outline"
                size="sm"
                className="ml-auto border-lem/40 text-lem hover:bg-lem-soft"
                onClick={() => toast("lemlist AI", { description: "The existing lemlist AI writing assistant opens here. lemScore stays diagnostic-only." })}
              >
                <Sparkles className="h-4 w-4" /> lemlist AI
              </Button>
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
                <p className="mt-2 text-[11px] text-muted-foreground">
                  This fixed content is sent to every prospect assigned to Sequence {selected.variant}. lemScore only
                  predicts its fit — it never edits your message.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{channelLabel(selected.channel)}</p>
                <p className="mt-1">
                  This step has no message content, so lemScore does not score it.
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
  const score = useMemo(() => messageScore(step.id).score, [messageScore, step.id]);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="xl:hidden">
          lemScore <ScorePill score={score} />
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
