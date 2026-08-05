import { Sparkles, TrendingUp, Bell, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { performance as perf, audiences, cycleTotals } from "@/lib/mock-data";
import { useApp } from "@/lib/app-state";
import { DemoBadge, InfoTip, StatTile } from "./shared";

export function PerformanceTab() {
  const { settings, setAnalysisStep } = useApp();
  const progress = Math.min(
    100,
    Math.round((perf.nextCycle.collected / settings.triggerThreshold) * 100),
  );
  const a = perf.adaptive;
  const rate = (n: number) => `${((n / a.contacted) * 100).toFixed(1)}%`;

  return (
    <div className="min-h-[calc(100vh-9rem)] space-y-6 bg-surface px-6 py-6">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Campaign performance</h2>
        <DemoBadge />
      </div>

      {settings.notify && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-adaptive/30 bg-adaptive-soft/50 px-4 py-3">
          <Bell className="h-4 w-4 text-adaptive" />
          <span className="text-sm font-medium">
            A new Adaptive Cycle is available — {cycleTotals.newOutcomesSinceLastCycle} new final CRM
            outcomes collected.
          </span>
          <Button
            size="sm"
            className="ml-auto bg-adaptive text-adaptive-foreground hover:bg-adaptive/90"
            onClick={() => setAnalysisStep(1)}
          >
            Adaptive analysis
          </Button>
        </div>
      )}

      <section className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h3 className="text-sm font-semibold">Section 1 — Current audience A/B test</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Sequence A and Sequence B run on the same audience ({audiences.current.prospectCount.toLocaleString()}{" "}
          prospects). Only the message differs.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                {["Sequence", "Delivered", "Positive replies", "Meetings", "Opportunities", "Closed Won"].map((h) => (
                  <th key={h} className="px-3 py-2 font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {perf.ab.map((r) => (
                <tr key={r.seq} className="border-b border-border last:border-0 hover:bg-muted/60">
                  <td className="px-3 py-2.5 font-medium">{r.seq}</td>
                  <td className="px-3 py-2.5">{r.delivered}</td>
                  <td className="px-3 py-2.5">
                    {r.positive}{" "}
                    <span className="text-xs text-muted-foreground">
                      ({((r.positive / r.delivered) * 100).toFixed(1)}%)
                    </span>
                  </td>
                  <td className="px-3 py-2.5">{r.meetings}</td>
                  <td className="px-3 py-2.5">{r.opportunities}</td>
                  <td className="px-3 py-2.5 font-medium">{r.won}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-adaptive/30 bg-card p-5 shadow-card">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-adaptive">
          <Sparkles className="h-4 w-4" /> Section 2 — Adaptive Challenger
          <InfoTip label="Adaptive Challenger tests a different audience and message hypothesis, so it is reported separately from the A/B test." />
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Audience: {audiences.adaptive.industry} · {audiences.adaptive.companySize} ·{" "}
          {audiences.adaptive.personas}
        </p>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Prospects contacted" value={a.contacted} />
          <StatTile label="Positive replies" value={`${a.positive} · ${rate(a.positive)}`} />
          <StatTile label="Qualified opportunities" value={`${a.opportunities} · ${rate(a.opportunities)}`} />
          <StatTile label="Closed Won" value={`${a.won} · ${rate(a.won)}`} />
        </div>

        <div className="mt-4 rounded-lg border border-border bg-surface p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
            <TrendingUp className="h-3.5 w-3.5" /> Compared with historical campaign baseline
          </div>
          <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
            <Delta label="Positive reply rate" now={(a.positive / a.contacted) * 100} base={a.baseline.positiveRate} />
            <Delta label="Opportunity rate" now={(a.opportunities / a.contacted) * 100} base={a.baseline.opportunityRate} />
            <Delta label="Closed Won rate" now={(a.won / a.contacted) * 100} base={a.baseline.wonRate} />
          </div>
        </div>

        <div className="mt-4 flex gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          Because the Adaptive Challenger uses a different audience, its results should be
          interpreted as a commercial-hypothesis test rather than a message-only A/B test.
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Next Adaptive Cycle</h3>
          <DemoBadge />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {perf.nextCycle.collected} new final outcomes collected of {settings.triggerThreshold}{" "}
          required by your trigger.
        </p>
        <Progress value={progress} className="mt-3 h-2" />
        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{progress}% toward trigger</span>
          <Button size="sm" className="ml-auto" onClick={() => setAnalysisStep(1)}>
            Run analysis now
          </Button>
        </div>
      </section>
    </div>
  );
}

function Delta({ label, now, base }: { label: string; now: number; base: number }) {
  const diff = now - base;
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">
        {now.toFixed(1)}%{" "}
        <span className={diff >= 0 ? "text-success" : "text-destructive"}>
          ({diff >= 0 ? "+" : ""}
          {diff.toFixed(1)} pts vs {base}% baseline)
        </span>
      </div>
    </div>
  );
}
