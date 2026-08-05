import { useMemo, useState } from "react";
import { Sparkles, Search, SlidersHorizontal, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { adaptiveProspects, currentProspects, selectionLogic } from "@/lib/mock-data";
import { useApp } from "@/lib/app-state";
import { DemoBadge, InfoTip } from "./shared";
import { toast } from "sonner";

const ALL = "all";

export function ProspectListTab() {
  const { prospectTab, setProspectTab } = useApp();

  return (
    <div className="min-h-[calc(100vh-9rem)] bg-surface px-6 py-5">
      <div className="mb-4 flex items-center gap-1 border-b border-border">
        <SubTab active={prospectTab === "current"} onClick={() => setProspectTab("current")}>
          Current audience
        </SubTab>
        <SubTab active={prospectTab === "adaptive"} onClick={() => setProspectTab("adaptive")} adaptive>
          Adaptive audience <Sparkles className="h-3.5 w-3.5" />
        </SubTab>
      </div>
      {prospectTab === "current" ? <CurrentAudience /> : <AdaptiveAudience />}
    </div>
  );
}

function SubTab({
  children,
  active,
  onClick,
  adaptive,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  adaptive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors",
        active
          ? adaptive
            ? "text-adaptive"
            : "text-primary"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
      {active && (
        <span
          className={cn(
            "absolute inset-x-2 -bottom-px h-0.5 rounded-full",
            adaptive ? "bg-adaptive" : "bg-primary",
          )}
        />
      )}
    </button>
  );
}

function CurrentAudience() {
  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <span className="text-sm font-semibold">
          Prospects in Sequence A &amp; B · {currentProspects.length} shown
        </span>
        <DemoBadge />
        <div className="relative ml-auto w-56">
          <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search prospects" className="h-8 pl-8 text-sm" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              {["Name", "Company", "Job title", "Industry", "Company size", "Intent signal", "Email status", "Campaign status"].map(
                (h) => (
                  <th key={h} className="px-4 py-2.5 font-medium whitespace-nowrap">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {currentProspects.map((p) => (
              <tr key={p.id} className="border-b border-border transition-colors last:border-0 hover:bg-muted/60">
                <td className="px-4 py-2.5 font-medium whitespace-nowrap">{p.name}</td>
                <td className="px-4 py-2.5 whitespace-nowrap">{p.company}</td>
                <td className="px-4 py-2.5 whitespace-nowrap">{p.title}</td>
                <td className="px-4 py-2.5 whitespace-nowrap">{p.industry}</td>
                <td className="px-4 py-2.5">{p.size}</td>
                <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">{p.intent}</td>
                <td className="px-4 py-2.5">{p.emailStatus}</td>
                <td className="px-4 py-2.5 whitespace-nowrap">{p.campaignStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdaptiveAudience({ compact }: { compact?: boolean }) {
  const {
    selectedProspects,
    toggleProspect,
    audienceApproved,
    setAudienceApproved,
    setCompareOpen,
    logicOpen,
    setLogicOpen,
  } = useApp();
  const [industry, setIndustry] = useState(ALL);
  const [size, setSize] = useState(ALL);
  const [persona, setPersona] = useState(ALL);
  const [intent, setIntent] = useState(ALL);
  const [fit, setFit] = useState(ALL);
  const [location, setLocation] = useState(ALL);

  const rows = useMemo(
    () =>
      adaptiveProspects.filter((p) => {
        if (industry !== ALL && p.industry !== industry) return false;
        if (size !== ALL) {
          const n = Number(p.size);
          if (size === "120-250" && !(n <= 250)) return false;
          if (size === "251-450" && !(n > 250)) return false;
        }
        if (persona !== ALL && p.title !== persona) return false;
        if (intent !== ALL && !p.intent.toLowerCase().includes(intent.toLowerCase())) return false;
        if (fit === "90+" && (p.fitScore ?? 0) < 90) return false;
        if (fit === "80-89" && ((p.fitScore ?? 0) < 80 || (p.fitScore ?? 0) >= 90)) return false;
        if (fit === "<80" && (p.fitScore ?? 0) >= 80) return false;
        if (location !== ALL && p.location !== location) return false;
        return true;
      }),
    [industry, size, persona, intent, fit, location],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-adaptive/30 bg-adaptive-soft/50 px-4 py-3">
        <Sparkles className="h-4 w-4 text-adaptive" />
        <span className="text-sm font-medium">
          Prospects selected from the latest Closed Won and Closed Lost patterns.
        </span>
        <DemoBadge />
        {audienceApproved && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">
            <CheckCircle2 className="h-3.5 w-3.5" /> Draft approved
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <Filter label="Industry" value={industry} onChange={setIndustry} options={["B2B SaaS", "Fintech"]} />
        <Filter label="Company size" value={size} onChange={setSize} options={["120-250", "251-450"]} />
        <Filter
          label="Persona"
          value={persona}
          onChange={setPersona}
          options={["Head of Enablement", "Revenue Enablement Manager", "Sales Ops Lead"]}
        />
        <Filter label="Intent signal" value={intent} onChange={setIntent} options={["open", "hired"]} />
        <Filter label="Fit score" value={fit} onChange={setFit} options={["90+", "80-89", "<80"]} />
        <Filter label="Location" value={location} onChange={setLocation} options={["France", "Benelux", "UK", "Ireland"]} />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
          <span className="text-sm font-semibold">
            {selectedProspects.length} of {rows.length} prospects selected
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setCompareOpen(true)}>
              Compare audiences
            </Button>
            <Button variant="outline" size="sm" onClick={() => setLogicOpen(true)}>
              Review selection logic
            </Button>
            <Button
              size="sm"
              className="bg-adaptive text-adaptive-foreground hover:bg-adaptive/90"
              onClick={() => {
                setAudienceApproved(true);
                toast.success("Audience draft approved — nothing has been launched");
              }}
            >
              Approve audience draft
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="w-10 px-4 py-2.5" />
                {["Name", "Company", "Job title", "Industry", "Company size", "Intent signal"].map((h) => (
                  <th key={h} className="px-4 py-2.5 font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
                <th className="px-4 py-2.5 font-medium whitespace-nowrap">
                  <span className="inline-flex items-center gap-1">
                    Fit score
                    <InfoTip label="Fit score ranks how closely a prospect matches the patterns found in this campaign's Closed Won deals. It is a demo heuristic, not a prediction." />
                  </span>
                </th>
                <th className="px-4 py-2.5 font-medium">Why selected</th>
                <th className="px-4 py-2.5 font-medium whitespace-nowrap">Verification</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-border transition-colors last:border-0 hover:bg-muted/60">
                  <td className="px-4 py-2.5">
                    <Checkbox
                      checked={selectedProspects.includes(p.id)}
                      onCheckedChange={() => toggleProspect(p.id)}
                      aria-label={`Select ${p.name}`}
                    />
                  </td>
                  <td className="px-4 py-2.5 font-medium whitespace-nowrap">{p.name}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{p.company}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{p.title}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{p.industry}</td>
                  <td className="px-4 py-2.5">{p.size}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <Tooltip>
                      <TooltipTrigger className="text-left text-muted-foreground underline decoration-dotted underline-offset-4">
                        {p.intent}
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-xs">
                        Intent signal: an observable public event (hiring, leadership change) that
                        correlated with Closed Won deals in this demo campaign.
                      </TooltipContent>
                    </Tooltip>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                        (p.fitScore ?? 0) >= 90
                          ? "bg-success-soft text-success"
                          : (p.fitScore ?? 0) >= 80
                            ? "bg-adaptive-soft text-adaptive"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {p.fitScore}
                    </span>
                  </td>
                  <td className="max-w-[260px] px-4 py-2.5 text-xs text-muted-foreground">{p.why}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{p.verification}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No prospects match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!compact && <SelectionLogicDrawer open={logicOpen} onOpenChange={setLogicOpen} />}
    </div>
  );
}

export function SelectionLogicDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Selection logic</SheetTitle>
          <DemoBadge />
        </SheetHeader>
        <div className="space-y-3 px-4 pb-8">
          <p className="text-sm text-muted-foreground">
            Each criterion below was derived from a finding in the latest Adaptive Cycle for this
            demo campaign. Another campaign would produce different criteria.
          </p>
          {selectionLogic.map((s) => (
            <div key={s.criterion} className="rounded-lg border border-border bg-card p-3">
              <div className="text-xs font-semibold tracking-wide text-adaptive uppercase">
                {s.criterion}
              </div>
              <div className="mt-1 text-sm font-medium">{s.rule}</div>
              <div className="mt-1 text-xs text-muted-foreground">Derived from: {s.from}</div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-auto min-w-[130px] bg-card text-xs">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{label}: All</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
