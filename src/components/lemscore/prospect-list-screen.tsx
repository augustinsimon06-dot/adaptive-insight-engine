import { useMemo, useState } from "react";
import { Rocket, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLemScore } from "@/lib/lemscore/store";
import { scoreBand } from "@/lib/lemscore/scoring";
import { prospects as allProspects } from "@/lib/lemscore/data";
import type { Prospect } from "@/lib/lemscore/types";
import { DemoBadge, InfoPopover, ScorePill, bandWord, formatCount } from "./shared";
import { FactorRow } from "./score-panel";

const PAGE_SIZE = 15;

export function ProspectListScreen() {
  const {
    filters,
    update,
    sortDir,
    prospectScore,
    excluded,
    moved,
    launchedProspectIds,
    launch,
    lemScoreEnabled,
    lemScoreEntitled,
  } = useLemScore();
  const lemScoreActive = lemScoreEnabled && lemScoreEntitled;
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    let list = allProspects.map((p) => ({ p, result: prospectScore(p.id) }));
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      list = list.filter(({ p }) =>
        `${p.name} ${p.company} ${p.jobTitle}`.toLowerCase().includes(q),
      );
    }
    if (filters.variant !== "all") list = list.filter(({ p }) => p.variant === filters.variant);
    if (filters.persona !== "all") list = list.filter(({ p }) => p.jobTitle === filters.persona);
    if (lemScoreActive && filters.band !== "all")
      list = list.filter(({ result }) => scoreBand(result.score) === filters.band);
    if (lemScoreActive && sortDir)
      list = [...list].sort((a, b) =>
        sortDir === "asc" ? a.result.score - b.result.score : b.result.score - a.result.score,
      );
    return list;
  }, [filters, sortDir, prospectScore, lemScoreActive]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = rows.slice(
    (Math.min(page, pageCount) - 1) * PAGE_SIZE,
    Math.min(page, pageCount) * PAGE_SIZE,
  );
  const currentIds = current.map(({ p }) => p.id);
  const allCurrentSelected =
    currentIds.length > 0 && currentIds.every((id) => selected.includes(id));
  const someCurrentSelected = currentIds.some((id) => selected.includes(id)) && !allCurrentSelected;
  const personas = Array.from(new Set(allProspects.map((p) => p.jobTitle))).sort();
  const launchableSelectedIds = selected.filter((id) => {
    const prospect = allProspects.find((item) => item.id === id);
    return (
      prospect &&
      !excluded.includes(id) &&
      !moved[id] &&
      !launchedProspectIds.includes(id)
    );
  });

  const statusOf = (p: Prospect) =>
    excluded.includes(p.id)
      ? "Excluded"
      : moved[p.id]
        ? `Moved · ${moved[p.id]}`
        : launchedProspectIds.includes(p.id)
          ? "In sequence"
          : "Not started";

  return (
    <div className="min-h-[calc(100vh-6.5rem)] space-y-4 bg-surface px-6 py-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold">Prospect list</h2>
        <DemoBadge />
        <span className="text-xs text-muted-foreground">
          Qualified campaign members · lemScore adds a second ranking based on fit with the exact sequence you built.
        </span>
        <InfoPopover label="lemlist already handles sourcing and qualification. lemScore does not replace that first selection: it ranks the already-qualified prospects by compatibility with this exact campaign, then Launch applies only to checked eligible prospects." />
      </div>

      {!lemScoreActive && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/25 px-4 py-3 text-xs text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          <span>
            Activate lemScore in Sequence to add campaign-specific fit on top of lemlist's existing prospect qualification.
          </span>
        </div>
      )}

      {lemScoreActive && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/25 bg-primary/[0.035] px-4 py-3 text-xs">
          <Sparkles className="h-4 w-4 text-primary" />
          <strong>Second-stage ranking:</strong>
          <span className="text-muted-foreground">
            Lead qualification asks “is this a good prospect?” · lemScore asks “is this exact campaign a good fit for this qualified prospect?”
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
        <div className="relative">
          <Search
            className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            aria-label="Search prospects"
            placeholder="Search prospects"
            value={filters.search}
            onChange={(e) => {
              update({ filters: { ...filters, search: e.target.value } });
              setPage(1);
            }}
            className="w-56 pl-8"
          />
        </div>
        {lemScoreActive && (
          <FilterSelect
            label="Score band"
            value={filters.band}
            onChange={(v) => update({ filters: { ...filters, band: v as typeof filters.band } })}
            options={[
              ["all", "All scores"],
              ["strong", "Strong (80–100)"],
              ["medium", "Medium (60–79)"],
              ["weak", "Weak (0–59)"],
            ]}
          />
        )}
        <FilterSelect
          label="Variant"
          value={filters.variant}
          onChange={(v) =>
            update({ filters: { ...filters, variant: v as typeof filters.variant } })
          }
          options={[
            ["all", "A and B"],
            ["A", "Sequence A"],
            ["B", "Sequence B"],
          ]}
        />
        <FilterSelect
          label="Persona"
          value={filters.persona}
          onChange={(v) => update({ filters: { ...filters, persona: v } })}
          options={[["all", "All personas"], ...personas.map((p) => [p, p] as [string, string])]}
        />
        {lemScoreActive && (
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => update({ sortDir: sortDir === "desc" ? "asc" : "desc" })}
          >
            Sort by campaign fit {sortDir === "asc" ? "↑" : sortDir === "desc" ? "↓" : ""}
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-3 py-2.5">
                <Checkbox
                  aria-label="Select all prospects on this page"
                  checked={
                    allCurrentSelected ? true : someCurrentSelected ? "indeterminate" : false
                  }
                  onCheckedChange={() =>
                    setSelected((previous) =>
                      allCurrentSelected
                        ? previous.filter((id) => !currentIds.includes(id))
                        : Array.from(new Set([...previous, ...currentIds])),
                    )
                  }
                />
              </th>
              <th className="px-3 py-2.5 font-medium">Name</th>
              {lemScoreActive && (
                <th className="px-3 py-2.5 font-medium">
                  <span className="inline-flex items-center gap-1">
                    Campaign fit
                    <InfoPopover label="This is not lemlist Lead Score. It estimates how well the exact assigned sequence matches this already-qualified prospect's company, persona and intent context." />
                  </span>
                </th>
              )}
              <th className="px-3 py-2.5 font-medium">Variant</th>
              <th className="px-3 py-2.5 font-medium">Company</th>
              <th className="px-3 py-2.5 font-medium">Job title</th>
              <th className="px-3 py-2.5 font-medium">Industry</th>
              <th className="px-3 py-2.5 font-medium">Company size</th>
              <th className="px-3 py-2.5 font-medium">Intent signal</th>
              <th className="px-3 py-2.5 font-medium">Campaign status</th>
            </tr>
          </thead>
          <tbody>
            {current.map(({ p, result }) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                <td className="px-3 py-2">
                  <Checkbox
                    aria-label={`Select ${p.name}`}
                    checked={selected.includes(p.id)}
                    onCheckedChange={() =>
                      setSelected((prev) =>
                        prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id],
                      )
                    }
                  />
                </td>
                <td className="px-3 py-2 font-medium whitespace-nowrap">{p.name}</td>
                {lemScoreActive && (
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setOpenId(p.id)}
                      className="rounded focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      aria-label={`Explain campaign fit ${result.score} for ${p.name}`}
                    >
                      <ScorePill score={result.score} validity={result.validity} suffix={false} />
                    </button>
                  </td>
                )}
                <td className="px-3 py-2">{p.variant}</td>
                <td className="px-3 py-2 whitespace-nowrap">{p.company}</td>
                <td className="px-3 py-2 whitespace-nowrap">{p.jobTitle}</td>
                <td className="px-3 py-2 whitespace-nowrap">{p.context.industry}</td>
                <td className="px-3 py-2">{p.context.companySizeBand}</td>
                <td className="px-3 py-2 whitespace-nowrap">{p.context.signal.label}</td>
                <td className="px-3 py-2 text-xs whitespace-nowrap text-muted-foreground">
                  {statusOf(p)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>
          {rows.length} prospects · page {Math.min(page, pageCount)} of {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>

      <div className="sticky bottom-0 -mx-6 flex flex-wrap items-center gap-3 border-t border-border bg-background px-6 py-3 shadow-[0_-6px_20px_rgba(15,23,42,0.06)]">
        <span className="text-xs text-muted-foreground">
          {selected.length
            ? `${selected.length} checked · ${launchableSelectedIds.length} ready to launch`
            : "Check at least one prospect to enable Launch"}
        </span>
        <Button
          className="ml-auto"
          disabled={launchableSelectedIds.length === 0}
          onClick={() => {
            const count = launchableSelectedIds.length;
            launch(launchableSelectedIds, "prospects");
            setSelected((previous) =>
              previous.filter((id) => !launchableSelectedIds.includes(id)),
            );
            toast.success(`${count} prospect${count === 1 ? "" : "s"} launched`, {
              description: "Only the checked eligible prospects were added to the sequence.",
            });
          }}
        >
          <Rocket className="h-4 w-4" />
          {launchableSelectedIds.length
            ? `Launch ${launchableSelectedIds.length} prospect${launchableSelectedIds.length === 1 ? "" : "s"}`
            : "Select prospects to launch"}
        </Button>
      </div>

      {lemScoreActive && <ProspectDrawer id={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-44" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map(([v, l]) => (
          <SelectItem key={v} value={v}>
            {l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ProspectDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { prospectScore, excluded, moved, update, launched, outcome, trendFor } = useLemScore();
  if (!id) return null;
  const p = allProspects.find((x) => x.id === id)!;
  const result = prospectScore(p.id);
  const trend = trendFor(`variant:${p.variant}`, result.score, p.variant);
  const out = outcome(p.variant);
  const priority = [...result.factors].sort((a, b) => a.contribution - b.contribution)[0];
  const summary =
    result.score >= 80
      ? "The assigned fixed sequence is well aligned with this prospect's context."
      : result.score >= 60
        ? "The sequence is credible, but one or two contextual elements limit the predicted fit."
        : "The current sequence has a weak fit with this prospect's context.";

  const currentAngle =
    p.variant === "A" ? "Ramp-time during active sales hiring" : "Broad onboarding suite / productivity";
  const bestHistoricalFit =
    p.context.signal.type === "sales_hiring"
      ? "Ramp-time during active sales hiring"
      : p.context.signal.type === "leadership_change"
        ? "First-90-days priorities / manager productivity"
        : p.context.signal.type === "funding"
          ? "Scaling enablement without adding manager load"
          : p.context.signal.type === "tech_adoption"
            ? "Workflow adoption / manager efficiency"
            : p.context.signal.type === "content_activity"
              ? "Onboarding proof / ramp-time benchmark"
              : "Manager productivity / enablement efficiency";
  const angleMismatch = currentAngle !== bestHistoricalFit;
  const recommendedAction = angleMismatch
    ? `Do not discard ${p.name}: test or move this prospect to an angle closer to “${bestHistoricalFit}”.`
    : result.score >= 80
      ? `Keep ${p.name} in this campaign: the current angle matches the strongest comparable pattern.`
      : `Keep the angle, but review the CTA, proof and touch order before launch.`;

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {p.name} <ScorePill score={result.score} validity={result.validity} />
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-4 px-4 pb-8 text-xs">
          <p className="text-sm">
            <span className="font-semibold">
              {result.score}/100 —{" "}
              {result.validity === "valid" ? bandWord(result.score) : "Prediction paused"}
            </span>
            <br />
            <span className="text-muted-foreground">
              {result.validity === "valid" ? summary : result.validityReason}
            </span>
          </p>

          <div className="rounded-lg border border-primary/30 bg-primary/[0.035] p-3">
            <p className="text-[10px] font-semibold tracking-wide text-primary uppercase">
              What this score adds after lemlist qualification
            </p>
            <p className="mt-1.5 leading-relaxed text-foreground">
              <strong>{p.name} is already a qualified campaign member.</strong> lemScore is not deciding whether this is a good lead in general. It is checking whether <strong>Sequence {p.variant}</strong> is the right strategy for this prospect's exact context.
            </p>
          </div>

          <div className="rounded-lg border-2 border-lem/40 bg-lem/[0.05] p-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-lem" />
              <h3 className="text-xs font-semibold text-foreground">Campaign-fit decision</h3>
            </div>
            <dl className="mt-3 space-y-2">
              <Line label="Current campaign angle" value={currentAngle} />
              <Line label="Prospect signal" value={p.context.signal.label} />
              <Line label="Historically strongest fit" value={bestHistoricalFit} />
            </dl>
            <p className="mt-3 leading-relaxed text-foreground">
              <strong>Why:</strong> for comparable {p.context.persona} prospects in {p.context.industry} companies of {p.context.companySizeBand} employees, the model gives more weight to strategies aligned with <strong>{p.context.signal.label.toLowerCase()}</strong> and to the outcomes those strategies generated.
            </p>
            <div className="mt-3 rounded-md border border-success/30 bg-success-soft/40 p-2.5">
              <p className="text-[10px] font-semibold tracking-wide text-success uppercase">Recommendation</p>
              <p className="mt-1 font-medium text-foreground">{recommendedAction}</p>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Personalized copy can still be generated by lemlist AI. lemScore decides what strategic direction is most supported by comparable outcomes.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <h3 className="text-xs font-semibold">Inputs used for this prospect fit</h3>
            <dl className="mt-2 space-y-1.5">
              <Line label="Assigned variant" value={`Sequence ${p.variant}`} />
              <Line label="Persona" value={p.context.persona} />
              <Line label="Industry" value={p.context.industry} />
              <Line label="Company size" value={p.context.companySizeBand} />
              <Line label="Geography" value={p.context.geography} />
              <Line label="Intent signal" value={p.context.signal.label} />
              <Line label="Growth" value={p.context.growth} />
              <Line label="Technologies" value={p.context.technologies.join(", ") || "—"} />
              <Line label="Public activity" value={p.context.publicActivity} />
            </dl>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Why this score
            </h3>
            <ul className="mt-2 space-y-2">
              {result.factors.slice(0, 4).map((f) => (
                <FactorRow key={f.label} factor={f} />
              ))}
            </ul>
          </div>

          <details className="rounded-lg border border-border p-3">
            <summary className="cursor-pointer font-medium">Advanced prediction details</summary>
            <dl className="mt-3 space-y-1.5">
              <Line
                label="Variant score at launch"
                value={trend.snapshot ? trend.snapshot.score : "Not launched yet"}
              />
              <Line
                label="Launched-version outcome"
                value={
                  launched && trend.recalibrated
                    ? trend.trend === "up"
                      ? "Above prediction"
                      : trend.trend === "down"
                        ? "Below prediction"
                        : "In line with prediction"
                    : "Waiting for campaign outcomes"
                }
              />
              <Line
                label="Predicted positive replies"
                value={`${result.prediction.positiveReplyRate}%`}
              />
              <Line
                label="Predicted opportunities"
                value={`${result.prediction.opportunityRate}%`}
              />
              <Line
                label="Actual positive replies (variant)"
                value={out ? `${out.actualPositiveRate}%` : "—"}
              />
              <Line label="Confidence" value={result.confidence} />
              <Line
                label="Comparable messages"
                value={formatCount(result.comparableMessages)}
              />
            </dl>
          </details>

          {priority && (
            <div className="rounded-lg border border-warning/30 bg-warning-soft/40 p-3">
              <h3 className="text-xs font-semibold">Largest score gap</h3>
              <p className="mt-1 leading-relaxed">
                <strong>{priority.label}:</strong> {priority.benchmark}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">Observed: {priority.observed}</p>
            </div>
          )}

          <div className="space-y-2 rounded-lg border border-border p-3">
            <h3 className="text-xs font-semibold">Prospect management</h3>
            <p className="text-muted-foreground">
              Nothing is removed or moved automatically. Keep the prospect, exclude it from this campaign, or move it to a strategy that better matches the recommendation above.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const nextMoved = { ...moved };
                  delete nextMoved[p.id];
                  update({ excluded: excluded.filter((x) => x !== p.id), moved: nextMoved });
                  toast.success(`${p.name} kept in this campaign`);
                }}
              >
                Keep in campaign
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  update({ excluded: Array.from(new Set([...excluded, p.id])) });
                  toast.success(`${p.name} excluded from this campaign`);
                }}
              >
                Exclude from this campaign
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  update({ moved: { ...moved, [p.id]: "Alternative angle · lemScore" } });
                  toast.success(`${p.name} moved to an alternative-angle campaign`);
                }}
              >
                Move to suggested angle
              </Button>
            </div>
          </div>
          <DemoBadge />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Line({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border pb-1 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("max-w-[62%] text-right font-medium")}>{value}</dd>
    </div>
  );
}
