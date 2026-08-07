import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLemScore } from "@/lib/lemscore/store";
import { scoreBand } from "@/lib/lemscore/scoring";
import { prospects as allProspects } from "@/lib/lemscore/data";
import type { Prospect } from "@/lib/lemscore/types";
import { DemoBadge, ScorePill } from "./shared";
import { FactorRow } from "./score-panel";

const PAGE_SIZE = 15;

export function ProspectListScreen() {
  const { filters, update, sortDir, prospectScore, excluded, moved, launched } = useLemScore();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    let list = allProspects.map((p) => ({ p, score: prospectScore(p.id).score }));
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      list = list.filter(({ p }) => `${p.name} ${p.company} ${p.jobTitle}`.toLowerCase().includes(q));
    }
    if (filters.variant !== "all") list = list.filter(({ p }) => p.variant === filters.variant);
    if (filters.persona !== "all") list = list.filter(({ p }) => p.jobTitle === filters.persona);
    if (filters.band !== "all") list = list.filter(({ score }) => scoreBand(score) === filters.band);
    if (sortDir) list = [...list].sort((a, b) => (sortDir === "asc" ? a.score - b.score : b.score - a.score));
    return list;
  }, [filters, sortDir, prospectScore]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = rows.slice((Math.min(page, pageCount) - 1) * PAGE_SIZE, Math.min(page, pageCount) * PAGE_SIZE);
  const personas = Array.from(new Set(allProspects.map((p) => p.jobTitle))).sort();

  const statusOf = (p: Prospect) =>
    excluded.includes(p.id) ? "Excluded" : moved[p.id] ? `Moved · ${moved[p.id]}` : launched ? "In sequence" : "Not started";

  return (
    <div className="min-h-[calc(100vh-6.5rem)] space-y-4 bg-surface px-6 py-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold">Prospect list</h2>
        <DemoBadge />
        <span className="text-xs text-muted-foreground">
          Each prospect receives exactly one variant. The score evaluates the complete fixed sequence assigned to them.
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
        <div className="relative">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
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
        <FilterSelect
          label="Variant"
          value={filters.variant}
          onChange={(v) => update({ filters: { ...filters, variant: v as typeof filters.variant } })}
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
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() => update({ sortDir: sortDir === "desc" ? "asc" : "desc" })}
        >
          Sort by lemScore {sortDir === "asc" ? "↑" : sortDir === "desc" ? "↓" : ""}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-3 py-2.5"><span className="sr-only">Select</span></th>
              <th className="px-3 py-2.5 font-medium">Name</th>
              <th className="px-3 py-2.5 font-medium">lemScore</th>
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
            {current.map(({ p, score }) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                <td className="px-3 py-2">
                  <Checkbox
                    aria-label={`Select ${p.name}`}
                    checked={selected.includes(p.id)}
                    onCheckedChange={() =>
                      setSelected((prev) => (prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id]))
                    }
                  />
                </td>
                <td className="px-3 py-2 font-medium whitespace-nowrap">{p.name}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setOpenId(p.id)}
                    className="rounded focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    aria-label={`Explain lemScore ${score} for ${p.name}`}
                  >
                    <ScorePill score={score} suffix={false} />
                  </button>
                </td>
                <td className="px-3 py-2">{p.variant}</td>
                <td className="px-3 py-2 whitespace-nowrap">{p.company}</td>
                <td className="px-3 py-2 whitespace-nowrap">{p.jobTitle}</td>
                <td className="px-3 py-2 whitespace-nowrap">{p.context.industry}</td>
                <td className="px-3 py-2">{p.context.companySizeBand}</td>
                <td className="px-3 py-2 whitespace-nowrap">{p.context.signal.label}</td>
                <td className="px-3 py-2 text-xs whitespace-nowrap text-muted-foreground">{statusOf(p)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>
          {rows.length} prospects · page {Math.min(page, pageCount)} of {pageCount}
        </span>
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
      </div>

      <ProspectDrawer id={openId} onClose={() => setOpenId(null)} />
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
  const signalRelevant = p.context.signal.type !== "none";
  const classification = signalRelevant ? "Message mismatch" : "Campaign mismatch";
  const classificationText = signalRelevant
    ? "The prospect fits the campaign audience, but the fixed message angle is poorly aligned with this persona and channel context."
    : "This prospect belongs to the broader ICP but has no signal connected to the sales-onboarding angle used in this campaign.";

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {p.name} <ScorePill score={result.score} />
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-4 px-4 pb-8 text-xs">
          <p className="text-sm">
            <span className="font-semibold">
              {result.score}/100 — {result.score >= 80 ? "Strong fit" : classification}
            </span>
            <br />
            <span className="text-muted-foreground">{result.score >= 80 ? "This prospect matches the campaign angle and message." : classificationText}</span>
          </p>

          <dl className="space-y-1.5">
            <Line label="Assigned variant" value={`Sequence ${p.variant}`} />
            <Line label="Score at launch" value={trend.snapshot ? trend.snapshot.score : "Not launched yet"} />
            <Line
              label="Trend"
              value={launched && trend.recalibrated ? `${trend.score} (${trend.trend})` : "Not enough outcomes to recalibrate yet."}
            />
            <Line label="Predicted positive reply rate" value={`${result.prediction.positiveReplyRate}%`} />
            <Line label="Predicted qualified opportunity rate" value={`${result.prediction.opportunityRate}%`} />
            <Line label="Actual positive reply rate (variant)" value={out ? `${out.actualPositiveRate}%` : "—"} />
            <Line label="Confidence" value={result.confidence} />
            <Line label="Comparable messages" value={result.comparableMessages.toLocaleString()} />
            <Line label="Persona" value={p.context.persona} />
            <Line label="Industry" value={p.context.industry} />
            <Line label="Company size" value={p.context.companySizeBand} />
            <Line label="Geography" value={p.context.geography} />
            <Line label="Intent signal" value={p.context.signal.label} />
            <Line label="Growth" value={p.context.growth} />
            <Line label="Technologies" value={p.context.technologies.join(", ") || "—"} />
            <Line label="Public activity" value={p.context.publicActivity} />
          </dl>

          <div>
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Strongest factors</h3>
            <ul className="mt-2 space-y-2">
              {result.factors.slice(0, 6).map((f) => (
                <FactorRow key={f.label} factor={f} />
              ))}
            </ul>
          </div>

          <div className="space-y-2 rounded-lg border border-border p-3">
            <h3 className="text-xs font-semibold">Prospect management</h3>
            <p className="text-muted-foreground">Nothing is removed or moved automatically. lemScore never generates a unique message for a prospect.</p>
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
                  update({ moved: { ...moved, [p.id]: "Enablement Nurture Q3" } });
                  toast.success(`${p.name} moved to “Enablement Nurture Q3”`);
                }}
              >
                Move to another campaign
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
      <dd className={cn("text-right font-medium")}>{value}</dd>
    </div>
  );
}
