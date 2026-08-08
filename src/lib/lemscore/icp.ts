import { campaignModelProspect } from "./data";
import type { ProspectContext } from "./types";

export type IcpMode = "ai" | "manual";

export type CampaignIcpState = {
  mode: IcpMode;
  companyName: string;
  executiveSummary: string;
  context: ProspectContext;
  confirmed: boolean;
};

const STORAGE_KEY = "lemscore.icp.v1";

export const DEFAULT_ICP_CONTEXT: ProspectContext = {
  persona: "VP Sales",
  personaGroup: "revenue_leader",
  industry: "B2B SaaS",
  companySizeBand: "201-500",
  geography: "France, Benelux, UK",
  signal: {
    type: "sales_hiring",
    label: "Sales team hiring",
    strength: "strong",
  },
  growth: "Sales team expanding",
  technologies: ["CRM", "Sales engagement"],
  publicActivity: "Hiring and onboarding activity",
};

export const DEFAULT_ICP_STATE: CampaignIcpState = {
  mode: "ai",
  companyName: "Ramply",
  executiveSummary:
    "Ramply helps B2B revenue teams onboard new sales reps faster with guided onboarding playbooks, certification and coaching workflows.",
  context: DEFAULT_ICP_CONTEXT,
  confirmed: true,
};

function cloneContext(context: ProspectContext): ProspectContext {
  return {
    ...context,
    signal: { ...context.signal },
    technologies: [...context.technologies],
  };
}

function applyToScoringModel(context: ProspectContext) {
  campaignModelProspect.jobTitle = context.persona;
  campaignModelProspect.context = cloneContext(context);
}

export function getIcpState(): CampaignIcpState {
  if (typeof window === "undefined") {
    applyToScoringModel(DEFAULT_ICP_STATE.context);
    return { ...DEFAULT_ICP_STATE, context: cloneContext(DEFAULT_ICP_STATE.context) };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      applyToScoringModel(DEFAULT_ICP_STATE.context);
      return { ...DEFAULT_ICP_STATE, context: cloneContext(DEFAULT_ICP_STATE.context) };
    }

    const parsed = JSON.parse(raw) as Partial<CampaignIcpState>;
    const context: ProspectContext = {
      ...DEFAULT_ICP_CONTEXT,
      ...(parsed.context ?? {}),
      signal: {
        ...DEFAULT_ICP_CONTEXT.signal,
        ...(parsed.context?.signal ?? {}),
      },
      technologies: parsed.context?.technologies ?? DEFAULT_ICP_CONTEXT.technologies,
    };
    const next: CampaignIcpState = {
      ...DEFAULT_ICP_STATE,
      ...parsed,
      context,
    };
    applyToScoringModel(next.context);
    return next;
  } catch {
    applyToScoringModel(DEFAULT_ICP_STATE.context);
    return { ...DEFAULT_ICP_STATE, context: cloneContext(DEFAULT_ICP_STATE.context) };
  }
}

export function saveIcpState(state: CampaignIcpState) {
  const next = { ...state, context: cloneContext(state.context) };
  applyToScoringModel(next.context);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* localStorage can be unavailable in private browsing */
    }
  }
  return next;
}

export function suggestIcpFromBusiness(
  companyName: string,
  executiveSummary: string,
): ProspectContext {
  const text = `${companyName} ${executiveSummary}`.toLowerCase();

  const industry = /bank|finance|fintech|insurance/.test(text)
    ? "Financial Services"
    : /agency|marketing|media/.test(text)
      ? "Marketing"
      : /manufactur|industrial/.test(text)
        ? "Manufacturing"
        : "B2B SaaS";

  const enablementLed = /enablement|training|coaching|onboarding/.test(text);
  const persona = enablementLed ? "VP Sales" : "Head of Sales";
  const personaGroup: ProspectContext["personaGroup"] = "revenue_leader";

  const companySizeBand: ProspectContext["companySizeBand"] = /enterprise|large account|global/.test(
    text,
  )
    ? "501-1000"
    : /startup|smb|small business/.test(text)
      ? "51-200"
      : "201-500";

  const signal: ProspectContext["signal"] = /hire|hiring|recruit|onboard|sales rep/.test(text)
    ? { type: "sales_hiring", label: "Sales team hiring", strength: "strong" }
    : /fund|series [abc]|raised/.test(text)
      ? { type: "funding", label: "Recent funding", strength: "moderate" }
      : { type: "leadership_change", label: "Sales leadership change", strength: "moderate" };

  return {
    persona,
    personaGroup,
    industry,
    companySizeBand,
    geography: "France, Benelux, UK",
    signal,
    growth: signal.type === "sales_hiring" ? "Sales team expanding" : "Growth / change signal",
    technologies: ["CRM", "Sales engagement"],
    publicActivity: "Relevant public company activity",
  };
}

export function icpLabel(context: ProspectContext) {
  return `${context.persona} · ${context.industry} · ${context.companySizeBand}`;
}

// Hydrate the scoring model as soon as the module is loaded in the browser.
getIcpState();
