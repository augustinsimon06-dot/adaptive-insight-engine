import { useEffect, useState } from "react";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ArrowRight,
  X,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  analysisStages,
  audiences,
  cycleTotals,
  evidenceFindings,
  strategyComparison,
} from "@/lib/mock-data";
import { useApp } from "@/lib/app-state";
import { ConfidencePill, DemoBadge, FieldRow, InfoTip, StatTile } from "./shared";
import { AdaptiveAudience } from "./prospect-list";
import { toast } from "sonner";

const METRICS = [
  "Positive reply rate",
  "Qualified opportunity rate",
  "Meeting-booked rate",
  "Closed Won rate",
];

export function AnalysisFlow() {
  const {
    analysisStep,
    setAnalysisStep,
    setMainTab,
    setSeqTab,
    setProspectTab,
    settings,
    updateSettings,
    metrics,
    toggleMetric,
    confirmOpen,
    setConfirmOpen,
    setExperimentCreated,
    selectedProspects,
    audienceApproved,
    setAudienceApproved,
  } = useApp();

  const open = analysisStep !== null;
  const close = () => setAnalysisStep(null);

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && close()}>
        <DialogContent
          className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-4xl"
        >
          <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-card px-5 py-3">
            <Sparkles className="h-4 w-4 text-adaptive" />
            <span className="text-sm font-semibold">Adaptive analysis</span>
            <span className="text-xs text-muted-foreground">
              Step {analysisStep ?? 1} of 9
            </span>
            <DemoBadge className="ml-1" />
            <button
              onClick={close}
              aria-label="Close"
              className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6">
            {analysisStep === 1 && <Step1 />}
            {analysisStep === 2 && <Step2 />}
            {analysisStep === 3 && <Step3 />}
            {analysisStep === 4 && <Step4 />}
            {analysisStep === 5 && <Step5 />}
            {analysisStep === 7 && <Step7 />}
            {analysisStep === 9 && <Step9 />}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create experiment drafts?</AlertDialogTitle>
            <AlertDialogDescription>
              No email will be sent automatically. The prospect lists and sequence variations will
              remain drafts until final review and launch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setExperimentCreated(true);
                setAudienceApproved(true);
                setAnalysisStep(9);
              }}
            >
              Create drafts
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  function Step1() {
    return (
      <div>
        <h2 className="text-xl font-semibold">New Adaptive Cycle available</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Your campaign now has enough new CRM outcomes to generate another targeting and messaging
          hypothesis.
        </p>
        <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
          <StatTile label="Closed Won" value={cycleTotals.closedWon} />
          <StatTile label="Closed Lost" value={cycleTotals.closedLost} />
          <StatTile label="Qualified opportunities" value={cycleTotals.qualifiedOpportunities} />
          <StatTile label="Positive replies" value={cycleTotals.positiveReplies} />
          <StatTile label="Analyzed conversations" value={cycleTotals.conversationsAnalyzed} />
          <StatTile label="New outcomes since last cycle" value={cycleTotals.newOutcomesSinceLastCycle} />
        </div>
        <div className="mt-4">
          <DemoBadge />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={close}>
            Not now
          </Button>
          <Button onClick={() => setAnalysisStep(2)}>Start analysis</Button>
        </div>
      </div>
    );
  }

  function Step2() {
    const [stage, setStage] = useState(0);
    const [done, setDone] = useState(false);

    useEffect(() => {
      if (stage >= analysisStages.length) {
        const t = setTimeout(() => setDone(true), 400);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setStage((s) => s + 1), 650);
      return () => clearTimeout(t);
    }, [stage]);

    const pct = Math.round((Math.min(stage, analysisStages.length) / analysisStages.length) * 100);

    return (
      <div>
        <h2 className="text-xl font-semibold">
          {done ? "Analysis complete" : "Analysis in progress"}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Reviewing this campaign's own outcomes, replies and prospect data.
        </p>
        <Progress value={pct} className="mt-5 h-2" />
        <ul className="mt-5 space-y-2.5">
          {analysisStages.map((s, i) => (
            <li key={s} className="flex items-center gap-2.5 text-sm">
              {i < stage ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : i === stage ? (
                <Loader2 className="h-4 w-4 animate-spin text-adaptive" />
              ) : (
                <span className="h-4 w-4 rounded-full border border-border" />
              )}
              <span className={cn(i <= stage ? "text-foreground" : "text-muted-foreground")}>
                {i + 1}. {s}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-end">
          <Button disabled={!done} onClick={() => setAnalysisStep(3)}>
            View findings <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  function Step3() {
    return (
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">What this campaign taught us</h2>
          <DemoBadge />
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Findings generated from this campaign's own results. Another campaign would produce
          different findings.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {evidenceFindings.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-adaptive-soft px-2 py-0.5 text-[11px] font-semibold text-adaptive">
                  {f.category}
                </span>
                <ConfidencePill level={f.confidence} />
                <InfoTip label="Confidence reflects how consistently this pattern held across the demo outcomes analyzed." />
              </div>
              <h4 className="mt-2 text-sm font-semibold">{f.title}</h4>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.pattern}</p>
              <p className="mt-2 text-xs font-medium">{f.stat}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Source: {f.source}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          These findings identify patterns and correlations. They do not guarantee that the
          recommended changes will improve future results.
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              close();
              toast("Cycle ignored — no changes were made");
            }}
          >
            Ignore this cycle
          </Button>
          <Button
            className="bg-adaptive text-adaptive-foreground hover:bg-adaptive/90"
            onClick={() => setAnalysisStep(4)}
          >
            Build Adaptive Challenger
          </Button>
        </div>
      </div>
    );
  }

  function Step4() {
    const c = strategyComparison.current;
    const a = strategyComparison.adaptive;
    return (
      <div>
        <button
          onClick={() => setAnalysisStep(3)}
          className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to findings
        </button>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Current strategy vs Adaptive hypothesis</h2>
          <DemoBadge />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold">Current strategy</h3>
            <FieldRow label="Audience" value={c.audience} />
            <FieldRow label="Personas" value={c.personas} />
            <FieldRow label="Intent criteria" value={c.intent} />
            <FieldRow label="Message angle" value={c.angle} />
            <FieldRow label="Sequence" value={c.sequence} />
            <FieldRow label="Prospects" value={c.prospects.toLocaleString()} />
          </div>
          <div className="rounded-xl border border-adaptive/30 bg-adaptive-soft/30 p-4">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-adaptive">
              <Sparkles className="h-4 w-4" /> Adaptive hypothesis
            </h3>
            <FieldRow label="Audience" value={a.audience} />
            <FieldRow label="Priority persona" value={a.personas} />
            <FieldRow label="Intent criteria" value={a.intent} />
            <FieldRow label="Message angle" value={a.angle} />
            <FieldRow label="Sequence changes" value={a.sequence} />
            <FieldRow label="Matching prospects" value={a.prospects} />
          </div>
        </div>
        <p className="mt-4 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
          The Adaptive Challenger tests a different combination of audience, intent and messaging.
          It is not only another email version.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={close}>
            Keep current strategy
          </Button>
          <Button onClick={() => setAnalysisStep(5)}>Review new prospects</Button>
        </div>
      </div>
    );
  }

  function Step5() {
    return (
      <div>
        <button
          onClick={() => setAnalysisStep(4)}
          className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to hypothesis
        </button>
        <h2 className="text-xl font-semibold">Review new prospects</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {selectedProspects.length} prospects selected · {audiences.adaptive.prospectCount} match
          the Adaptive criteria in total.
        </p>
        <div className="mt-4">
          <AdaptiveAudience compact />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setAudienceApproved(true);
              toast.success("Audience draft approved");
            }}
            disabled={audienceApproved}
          >
            {audienceApproved ? "Draft approved" : "Approve audience draft"}
          </Button>
          <Button
            onClick={() => {
              close();
              setMainTab("sequence");
              setSeqTab("ADAPTIVE");
              toast("Step 6 — review the Adaptive sequence in the campaign builder");
            }}
          >
            Review Adaptive sequence <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  function Step7() {
    return (
      <div>
        <h2 className="text-xl font-semibold">Create an Adaptive experiment</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold">Traditional A/B test</h3>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
              <li>
                <strong className="text-foreground">Sequence A</strong> — current audience, control
                message
              </li>
              <li>
                <strong className="text-foreground">Sequence B</strong> — same current audience,
                alternative message
              </li>
              <li>{audiences.current.prospectCount.toLocaleString()} prospects</li>
            </ul>
          </div>
          <div className="rounded-xl border border-adaptive/30 bg-adaptive-soft/30 p-4">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-adaptive">
              <Sparkles className="h-4 w-4" /> Adaptive Challenger
            </h3>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
              <li>Adaptive audience — {audiences.adaptive.industry}, {audiences.adaptive.companySize}</li>
              <li>Refined targeting criteria and new persona priority</li>
              <li>New intent hypothesis — {audiences.adaptive.intent}</li>
              <li>Adaptive message and sequence structure</li>
              <li>{audiences.adaptive.prospectCount} prospects</li>
            </ul>
          </div>
        </div>

        <p className="mt-4 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
          Sequence A and Sequence B compare messaging within the same audience. Adaptive Challenger
          evaluates a different audience-and-message hypothesis and must be analyzed separately.
        </p>

        <div className="mt-5">
          <h3 className="text-sm font-semibold">Success metrics</h3>
          <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {METRICS.map((m) => (
              <label
                key={m}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <Checkbox checked={metrics.includes(m)} onCheckedChange={() => toggleMetric(m)} />
                {m}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-1">
          <h3 className="text-sm font-semibold">Controls</h3>
          <Ctrl
            label="Require human approval before launch"
            checked={settings.humanApproval}
            onChange={(v) => updateSettings({ humanApproval: v })}
          />
          <Ctrl
            label="Automatically replace current strategy"
            checked={settings.autoReplace}
            onChange={(v) => {
              if (v) {
                toast.warning("Automatic replacement stays OFF. Changes must be reviewed by a human.");
                return;
              }
              updateSettings({ autoReplace: false });
            }}
          />
          <Ctrl
            label="Notify when enough results are available"
            checked={settings.notify}
            onChange={(v) => updateSettings({ notify: v })}
          />
          <Ctrl
            label="Start another Adaptive Cycle automatically"
            checked={settings.autoCycle}
            onChange={(v) => updateSettings({ autoCycle: v })}
          />
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm">
            Start a new learning cycle after:
            <Input
              type="number"
              min={5}
              value={settings.triggerThreshold}
              onChange={(e) => updateSettings({ triggerThreshold: Number(e.target.value) })}
              className="h-8 w-20"
            />
            additional final outcomes
            <InfoTip label="You choose the threshold. There is no fixed number of outcomes required." />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button onClick={() => setConfirmOpen(true)}>Create experiment drafts</Button>
        </div>
      </div>
    );
  }

  function Step9() {
    return (
      <div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <h2 className="text-xl font-semibold">Adaptive experiment created</h2>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Your current sequences and Adaptive Challenger are ready for final review.
        </p>
        <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
          <StatTile label="Current-audience prospects" value={audiences.current.prospectCount.toLocaleString()} />
          <StatTile label="Adaptive-audience prospects" value={selectedProspects.length} />
          <StatTile label="Sequence variations" value={3} />
          <StatTile label="Human approval" value={settings.humanApproval ? "Required" : "Off"} />
          <StatTile
            label="Next learning cycle"
            value={`${settings.triggerThreshold} outcomes`}
          />
          <StatTile label="Auto replacement" value={settings.autoReplace ? "ON" : "OFF"} />
        </div>
        <div className="mt-4">
          <DemoBadge />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              close();
              setMainTab("sequence");
              setSeqTab("A");
            }}
          >
            Return to campaign
          </Button>
          <Button
            onClick={() => {
              close();
              setMainTab("prospects");
              setProspectTab("adaptive");
            }}
          >
            Open experiment
          </Button>
        </div>
      </div>
    );
  }
}

function Ctrl({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted">
      {label}
      <Switch className="ml-auto" checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
