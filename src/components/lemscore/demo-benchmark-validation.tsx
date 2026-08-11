import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DemoBadge, InfoPopover } from "./shared";

type Scope = "A" | "B";

type OutcomePoint = {
  stage: string;
  historical: number;
  current: number;
};

type StepRow = {
  step: string;
  metric: string;
  reached: number;
  historical: number;
  current: number;
};

const OUTCOMES: Record<Scope, OutcomePoint[]> = {
  A: [
    { stage: "Positive reply", historical: 7.1, current: 14.2 },
    { stage: "Meeting", historical: 3.1, current: 7.5 },
    { stage: "Opportunity", historical: 1.8, current: 4.2 },
    { stage: "Won", historical: 0.6, current: 1.7 },
  ],
  B: [
    { stage: "Positive reply", historical: 6.7, current: 10.8 },
    { stage: "Meeting", historical: 2.9, current: 5.0 },
    { stage: "Opportunity", historical: 1.6, current: 2.5 },
    { stage: "Won", historical: 0.6, current: 0.8 },
  ],
};

const STEP_ROWS: Record<Scope, StepRow[]> = {
  A: [
    { step: "Email #1", metric: "Opened", reached: 120, historical: 58.4, current: 69.0 },
    { step: "LinkedIn connection request", metric: "Accepted", reached: 99, historical: 34.2, current: 40.0 },
    { step: "LinkedIn message", metric: "Engaged", reached: 85, historical: 20.6, current: 28.0 },
    { step: "Follow-up email", metric: "Opened", reached: 57, historical: 47.8, current: 57.0 },
    { step: "Final email", metric: "Replied", reached: 37, historical: 6.8, current: 9.5 },
  ],
  B: [
    { step: "Email #1", metric: "Opened", reached: 120, historical: 58.4, current: 64.0 },
    { step: "LinkedIn connection request", metric: "Accepted", reached: 94, historical: 34.2, current: 35.7 },
    { step: "LinkedIn message", metric: "Engaged", reached: 73, historical: 20.6, current: 21.5 },
    { step: "Follow-up email", metric: "Opened", reached: 47, historical: 47.8, current: 49.2 },
    { step: "Final email", metric: "Replied", reached: 31, historical: 6.8, current: 7.0 },
  ],
};

export function DemoBenchmarkValidation() {
  const [scope, setScope] = useState<Scope>("A");
  const data = OUTCOMES[scope];
  const rows = STEP_ROWS[scope];
  const launched = 120;
  const yMax = useMemo(
    () => Math.max(16, Math.ceil(Math.max(...data.map((point) => point.current)) + 2)),
    [data],
  );

  return (
    <div className="grid bg-surface lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="hidden border-r border-border bg-background lg:block" aria-hidden="true" />
      <div className="space-y-5 px-6 pb-6">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/25 bg-primary/[0.035] px-4 py-3">
          <div>
            <p className="text-[10px] font-semibold tracking-wide text-primary uppercase">Performance scope</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Illustrative post-launch results for the selected sequence.</p>
          </div>
          <Select value={scope} onValueChange={(value) => setScope(value as Scope)}>
            <SelectTrigger className="ml-auto w-44 bg-background" aria-label="Performance sequence scope">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">Sequence A</SelectItem>
              <SelectItem value="B">Sequence B</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <section className="rounded-2xl border border-border bg-background p-5 shadow-sm">
          <div className="flex flex-wrap items-start gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">Overall outcomes vs benchmark</h2>
                <span className="rounded-full border border-primary/25 bg-primary/[0.04] px-2 py-0.5 text-[11px] font-semibold text-primary">Sequence {scope}</span>
                <InfoPopover label="Illustrative beta simulation. In production, this chart would compare the actual outcomes of the selected launched sequence with a validated historical benchmark." />
              </div>
              <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
                Sequence {scope} vs illustrative historical benchmark after launch.
              </p>
            </div>
            <DemoBadge className="ml-auto" />
          </div>

          <div className="mt-4 rounded-xl border border-border bg-card p-3">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 12, right: 18, left: 0, bottom: 18 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} interval={0} />
                  <YAxis domain={[0, yMax]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={40} />
                  <RechartsTooltip
                    formatter={(value, name) => [
                      `${Number(value).toFixed(1)}% of launched prospects`,
                      name === "historical" ? "Historical benchmark" : `Sequence ${scope}`,
                    ]}
                    contentStyle={{ borderRadius: 10, borderColor: "var(--border)", background: "var(--background)", fontSize: 12 }}
                  />
                  <Legend formatter={(value) => (value === "historical" ? "Historical benchmark" : `Sequence ${scope}`)} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Line type="monotone" dataKey="historical" stroke="var(--muted-foreground)" strokeWidth={2.5} strokeDasharray="7 5" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="current" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            Illustrative demo base = {launched} launched prospects in Sequence {scope}. Demo data only.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-background p-5 shadow-sm">
          <div className="flex flex-wrap items-start gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">Step results vs benchmark</h2>
                <span className="rounded-full border border-primary/25 bg-primary/[0.04] px-2 py-0.5 text-[11px] font-semibold text-primary">Sequence {scope}</span>
              </div>
              <p className="mt-1 max-w-3xl text-xs text-muted-foreground">See what happened at each touch for the illustrative launched prospects.</p>
            </div>
            <DemoBadge className="ml-auto" />
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[1040px] border-collapse text-left text-xs">
              <thead className="bg-surface text-[10px] tracking-wide text-muted-foreground uppercase">
                <tr>
                  {['Step', 'Result measured', 'Prospects exposed', 'Share of launched', 'Current result among exposed', 'Historical benchmark', 'Difference'].map((head) => (
                    <th key={head} className="whitespace-nowrap px-3 py-2.5 font-semibold">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const delta = row.current - row.historical;
                  const exposedShare = (row.reached / launched) * 100;
                  return (
                    <tr key={row.step} className="border-t border-border bg-card">
                      <td className="px-3 py-3 font-semibold">{row.step}</td>
                      <td className="px-3 py-3 text-muted-foreground">{row.metric}</td>
                      <td className="px-3 py-3 font-semibold tabular-nums">{row.reached}</td>
                      <td className="px-3 py-3 tabular-nums">{exposedShare.toFixed(1)}%</td>
                      <td className="px-3 py-3 font-semibold tabular-nums">{row.current.toFixed(1)}% {row.metric.toLowerCase()}</td>
                      <td className="px-3 py-3 tabular-nums text-muted-foreground">{row.historical.toFixed(1)}% {row.metric.toLowerCase()}</td>
                      <td className="px-3 py-3">
                        <span className={cn("inline-flex rounded-md px-2 py-1 font-semibold tabular-nums", delta >= 0 ? "bg-success-soft text-success" : "bg-destructive/10 text-destructive")}>
                          {delta >= 0 ? "+" : ""}{delta.toFixed(1)} pp
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
