import { useState } from "react";
import { ArrowRight, Building2, Check, SlidersHorizontal, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useLemScore } from "@/lib/lemscore/store";
import {
  getIcpState,
  icpLabel,
  saveIcpState,
  suggestIcpFromBusiness,
  type CampaignIcpState,
  type IcpMode,
} from "@/lib/lemscore/icp";
import type { IntentSignal, ProspectContext } from "@/lib/lemscore/types";
import { DemoBadge } from "./shared";

const PERSONAS = [
  "VP Sales",
  "Head of Sales",
  "Sales Director",
  "Chief Revenue Officer",
  "Head of Enablement",
] as const;

const INDUSTRIES = [
  "B2B SaaS",
  "Financial Services",
  "IT Services",
  "Marketing",
  "Manufacturing",
] as const;

const COMPANY_SIZES: ProspectContext["companySizeBand"][] = [
  "1-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

const SIGNALS: Record<IntentSignal["type"], IntentSignal> = {
  sales_hiring: { type: "sales_hiring", label: "Sales team hiring", strength: "strong" },
  leadership_change: {
    type: "leadership_change",
    label: "Sales leadership change",
    strength: "moderate",
  },
  funding: { type: "funding", label: "Recent funding", strength: "moderate" },
  tech_adoption: { type: "tech_adoption", label: "New sales technology", strength: "moderate" },
  content_activity: {
    type: "content_activity",
    label: "Relevant public activity",
    strength: "moderate",
  },
  none: { type: "none", label: "No required signal", strength: "none" },
};

export function IcpScreen() {
  const { update } = useLemScore();
  const [state, setState] = useState<CampaignIcpState>(() => getIcpState());
  const [analyzing, setAnalyzing] = useState(false);

  const patch = (next: Partial<CampaignIcpState>) =>
    setState((current) => ({ ...current, ...next, confirmed: false }));

  const patchContext = (next: Partial<ProspectContext>) =>
    setState((current) => ({
      ...current,
      confirmed: false,
      context: { ...current.context, ...next },
    }));

  const chooseMode = (mode: IcpMode) => patch({ mode });

  const analyze = () => {
    setAnalyzing(true);
    window.setTimeout(() => {
      const context = suggestIcpFromBusiness(state.companyName, state.executiveSummary);
      setState((current) => ({ ...current, context, confirmed: false }));
      setAnalyzing(false);
      toast.success("Suggested ICP ready", {
        description: "Review or adjust the proposed audience before confirming it.",
      });
    }, 550);
  };

  const confirm = () => {
    const saved = saveIcpState({ ...state, confirmed: true });
    setState(saved);
    toast.success("Campaign ICP confirmed", {
      description: `${icpLabel(saved.context)} will now contextualize Sequence scoring.`,
    });
    update({ mainTab: "sequence" as never });
  };

  return (
    <div className="grid bg-surface lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="hidden border-r border-border bg-background px-5 py-6 lg:block">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Campaign setup
        </p>
        <ol className="mt-4 space-y-3 text-sm">
          <li className="flex items-center gap-2 font-semibold text-primary">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              1
            </span>
            Define ICP
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs">
              2
            </span>
            Build sequence
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs">
              3
            </span>
            Score prospects
          </li>
        </ol>
      </aside>

      <div className="mx-auto w-full max-w-5xl space-y-5 px-6 py-6">
        <div className="flex flex-wrap items-start gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Who should this campaign convince?</h2>
              <DemoBadge />
            </div>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              lemScore needs a target audience before it can judge whether a message is commercially
              relevant. Choose how you want to define the campaign ICP.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <ModeCard
            active={state.mode === "ai"}
            icon={<Sparkles className="h-5 w-5" />}
            title="Help me define my ICP"
            description="Give lemlist your company context. AI proposes an ICP hypothesis that you review and confirm."
            onClick={() => chooseMode("ai")}
          />
          <ModeCard
            active={state.mode === "manual"}
            icon={<SlidersHorizontal className="h-5 w-5" />}
            title="I already know my ICP"
            description="For mature teams with established PMF: define the audience directly from your known criteria."
            onClick={() => chooseMode("manual")}
          />
        </div>

        {state.mode === "ai" && (
          <section className="rounded-2xl border border-border bg-background p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Business context</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              In production, company/site data and the summary could be combined with connected CRM
              history. This beta demonstrates the inference flow.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground" htmlFor="company-name">
                  Company name or website
                </label>
                <Input
                  id="company-name"
                  className="mt-1"
                  value={state.companyName}
                  onChange={(event) => patch({ companyName: event.target.value })}
                  placeholder="Ramply or ramplyhq.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="executive-summary">
                  Executive Summary (optional)
                </label>
                <Textarea
                  id="executive-summary"
                  className="mt-1 min-h-28"
                  value={state.executiveSummary}
                  onChange={(event) => patch({ executiveSummary: event.target.value })}
                  placeholder="What do you sell, to whom, and which problem do you solve?"
                />
              </div>
            </div>
            <Button className="mt-4" variant="outline" onClick={analyze} disabled={analyzing}>
              <Sparkles className="h-4 w-4" />
              {analyzing ? "Analyzing business…" : "Analyze & suggest ICP"}
            </Button>
          </section>
        )}

        <section className="rounded-2xl border-2 border-primary/35 bg-background p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <div>
              <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                {state.mode === "ai" ? "Suggested ICP — review before confirming" : "Campaign ICP"}
              </p>
              <h3 className="mt-1 text-lg font-semibold">{icpLabel(state.context)}</h3>
            </div>
            {state.confirmed && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
                <Check className="h-3.5 w-3.5" /> Confirmed
              </span>
            )}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Primary buyer">
              <Select
                value={state.context.persona}
                onValueChange={(persona) =>
                  patchContext({
                    persona,
                    personaGroup: /enablement/i.test(persona) ? "enablement" : "revenue_leader",
                  })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PERSONAS.map((persona) => <SelectItem key={persona} value={persona}>{persona}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Industry">
              <Select
                value={state.context.industry}
                onValueChange={(industry) => patchContext({ industry })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => <SelectItem key={industry} value={industry}>{industry}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Company size">
              <Select
                value={state.context.companySizeBand}
                onValueChange={(companySizeBand) =>
                  patchContext({ companySizeBand: companySizeBand as ProspectContext["companySizeBand"] })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZES.map((size) => <SelectItem key={size} value={size}>{size} employees</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Geography">
              <Input
                value={state.context.geography}
                onChange={(event) => patchContext({ geography: event.target.value })}
              />
            </Field>

            <Field label="Priority signal">
              <Select
                value={state.context.signal.type}
                onValueChange={(type) =>
                  patchContext({ signal: SIGNALS[type as IntentSignal["type"]] })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.values(SIGNALS).map((signal) => (
                    <SelectItem key={signal.type} value={signal.type}>{signal.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="mt-5 rounded-xl border border-primary/20 bg-primary/[0.04] p-4 text-xs leading-relaxed">
            <p className="font-semibold text-foreground">Why this changes lemScore</p>
            <p className="mt-1 text-muted-foreground">
              Sequence score = message × confirmed ICP × channel × position × timing × historical outcomes.
              Prospect List then adds each real prospect's company, persona and signals to calculate the individual prediction.
            </p>
          </div>

          <div className="mt-5 flex justify-end">
            <Button onClick={confirm}>
              Confirm ICP & continue to Sequence <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function ModeCard({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border-2 bg-background p-5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        active ? "border-primary bg-primary/[0.03]" : "border-border hover:border-primary/35",
      )}
    >
      <span className={cn("inline-flex rounded-lg p-2", active ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground")}>{icon}</span>
      <span className="mt-3 block font-semibold">{title}</span>
      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{description}</span>
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
