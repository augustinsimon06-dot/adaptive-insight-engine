import { useState } from "react";
import {
  Mail,
  Plus,
  Eye,
  Settings2,
  ChevronDown,
  PanelRightClose,
  Braces,
  Sparkles,
  Link2,
  Users,
  Clock,
  MoreHorizontal,
  Wand2,
  Type,
  Code2,
  PenLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { campaign, adaptiveReasons, audiences, sequences } from "@/lib/mock-data";
import { useApp, type SeqTab } from "@/lib/app-state";
import { DemoBadge, InfoTip, Panel } from "./shared";
import { toast } from "sonner";

const SEQ_TABS: { id: SeqTab; label: string }[] = [
  { id: "A", label: "Sequence A" },
  { id: "B", label: "Sequence B" },
  { id: "ADAPTIVE", label: "Adaptive Challenger" },
];

export function SequenceBuilder() {
  const {
    seqTab,
    setSeqTab,
    subject,
    body,
    setSubject,
    setBody,
    setEvidenceOpen,
    setCompareOpen,
    setAnalysisStep,
    experimentCreated,
  } = useApp();
  const [mode, setMode] = useState("Automated");
  const isAdaptive = seqTab === "ADAPTIVE";
  const tag = sequences[seqTab].tag;

  return (
    <div className="grid grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      {/* Canvas */}
      <section className="relative min-h-[calc(100vh-9rem)] border-r border-border bg-[radial-gradient(circle,_oklch(0.9_0.01_255)_1px,_transparent_1px)] [background-size:22px_22px]">
        <div className="flex items-center gap-1 border-b border-border bg-card/80 px-4 backdrop-blur">
          {SEQ_TABS.map((t) => {
            const active = seqTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSeqTab(t.id)}
                className={cn(
                  "relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  t.id === "ADAPTIVE" && "text-adaptive",
                )}
              >
                {t.label}
                {t.id === "ADAPTIVE" && <Sparkles className="h-3.5 w-3.5" />}
                {active && (
                  <span
                    className={cn(
                      "absolute inset-x-2 bottom-0 h-0.5 rounded-full",
                      t.id === "ADAPTIVE" ? "bg-adaptive" : "bg-primary",
                    )}
                  />
                )}
                {t.id !== "ADAPTIVE" && active && (
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col items-center px-6 py-10">
          <span
            className={cn(
              "mb-4 rounded-full border px-2.5 py-1 text-[11px] font-medium",
              isAdaptive
                ? "border-adaptive/30 bg-adaptive-soft text-adaptive"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {tag}
          </span>

          <Panel className="w-[320px] px-4 py-3">
            <div className="grid grid-cols-2 divide-x divide-border">
              <div className="pr-3">
                <div className="text-xs text-muted-foreground">Senders</div>
                <div className="mt-2 flex h-6 w-6 items-center justify-center rounded-full bg-adaptive text-[10px] font-bold text-adaptive-foreground">
                  {campaign.sender.initials}
                </div>
              </div>
              <div className="pl-4">
                <div className="text-xs text-muted-foreground">Schedule</div>
                <div className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {campaign.schedule}
                </div>
              </div>
            </div>
          </Panel>

          <Connector />
          <button
            onClick={() => toast("Step inserted above (prototype)")}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            aria-label="Insert step"
          >
            <Plus className="h-4 w-4" />
          </button>
          <Connector />

          <div
            className={cn(
              "w-[320px] overflow-hidden rounded-xl border-2 bg-card shadow-card",
              isAdaptive ? "border-adaptive" : "border-primary",
            )}
          >
            <div className="px-4 py-2.5 text-sm font-medium text-foreground">Send immediately</div>
            <div className="flex items-center gap-3 border-t border-border px-4 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-success-soft text-success">
                <Mail className="h-4 w-4" />
              </span>
              <span className="text-base font-medium">Email</span>
              <MoreHorizontal className="ml-auto h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {isAdaptive && (
            <>
              <Connector />
              <div className="w-[320px] rounded-xl border border-dashed border-adaptive/50 bg-adaptive-soft/40 px-4 py-3">
                <div className="text-xs font-medium text-adaptive">Wait 2 days</div>
                <div className="mt-2 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-card text-adaptive">
                    <Link2 className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium">LinkedIn visit</span>
                </div>
              </div>
            </>
          )}

          <Connector />
          <button
            onClick={() => toast("Add a step (prototype)")}
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground shadow-card transition-colors hover:border-primary hover:text-primary"
          >
            <Plus className="h-4 w-4" /> Add a step
          </button>
        </div>
      </section>

      {/* Editor */}
      <section className="min-h-[calc(100vh-9rem)] bg-card px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-success-soft text-success">
            <Mail className="h-4 w-4" />
          </span>
          <span className="text-lg font-semibold">Email</span>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setMode(mode === "Automated" ? "Manual" : "Automated")}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              {mode} <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => toast("Preview opened (prototype)")}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Eye className="h-4 w-4" /> Preview
            </button>
            <button
              aria-label="Step settings"
              onClick={() => toast("Step settings (prototype)")}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted"
            >
              <Settings2 className="h-4 w-4" />
            </button>
            <button
              aria-label="Collapse editor"
              onClick={() => toast("Panel collapse (prototype)")}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted"
            >
              <PanelRightClose className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isAdaptive && (
          <div className="mt-4 rounded-xl border border-adaptive/30 bg-adaptive-soft/60 p-4">
            <div className="flex items-start gap-2.5">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-adaptive" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  Adaptive Challenger generated from the latest Closed Won and Closed Lost patterns.
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <DemoBadge />
                  <span className="inline-flex items-center gap-1 rounded-full border border-adaptive/30 bg-card px-2 py-0.5 text-[11px] font-medium text-adaptive">
                    <Users className="h-3 w-3" /> Uses Adaptive audience
                  </span>
                  <InfoTip label="Adaptive Challenger proposes a new commercial hypothesis: a different audience and a different message, derived from your own closed deals. It is not a third email variation." />
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <button
                    onClick={() => setEvidenceOpen(true)}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    View supporting evidence
                  </button>
                  <button
                    onClick={() => setCompareOpen(true)}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Compare audiences
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">Sender assignment</label>
          <button className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-left transition-colors hover:bg-muted">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-adaptive text-[10px] font-bold text-adaptive-foreground">
              {campaign.sender.initials}
            </span>
            <span className="text-sm font-medium">{campaign.sender.name}</span>
            <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted-foreground">Email subject</label>
            <button
              onClick={() => toast("Cc / Bcc added (prototype)")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Add Cc:
            </button>
          </div>
          <div className="relative">
            <Input
              value={subject[seqTab]}
              onChange={(e) => setSubject(seqTab, e.target.value)}
              className="pr-10 text-[15px]"
            />
            <Braces className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div className="mt-5 space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">Message</label>
          <div className="rounded-xl border border-border">
            <Textarea
              value={body[seqTab]}
              onChange={(e) => setBody(seqTab, e.target.value)}
              className="min-h-[260px] resize-none border-0 text-[15px] leading-relaxed shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center gap-1 border-t border-border px-3 py-2 text-muted-foreground">
              <button
                onClick={() => toast("Variable inserted")}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-foreground hover:bg-muted"
              >
                <Plus className="h-4 w-4" /> Add
              </button>
              <button
                onClick={() => toast("AI rewrite (prototype)")}
                className="rounded-md p-1.5 hover:bg-muted"
                aria-label="AI assist"
              >
                <Wand2 className="h-4 w-4" />
              </button>
              <div className="ml-auto flex items-center gap-1">
                {[Braces, Type, Link2, PenLine, Code2].map((Icon, i) => (
                  <button key={i} className="rounded-md p-1.5 hover:bg-muted" aria-label="Format">
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {isAdaptive && (
          <div className="mt-6">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Why this version was recommended</h3>
              <DemoBadge />
            </div>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {adaptiveReasons.map((r) => (
                <div
                  key={r.title}
                  className="rounded-lg border border-border bg-surface p-3 transition-colors hover:border-adaptive/40"
                >
                  <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-adaptive" />
                    {r.title}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{r.detail}</p>
                  <p className="mt-2 text-xs font-medium text-adaptive">{r.stat}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
              Adaptive audience: {audiences.adaptive.prospectCount} matching prospects vs{" "}
              {audiences.current.prospectCount} in the current audience.
              <Button
                size="sm"
                className="ml-auto bg-adaptive text-adaptive-foreground hover:bg-adaptive/90"
                onClick={() => setAnalysisStep(7)}
              >
                {experimentCreated ? "Manage Adaptive experiment" : "Create Adaptive experiment"}
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Connector() {
  return <div className="h-6 w-px bg-border" />;
}
