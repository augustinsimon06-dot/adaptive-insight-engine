import type {
  Campaign,
  CampaignOutcome,
  IntentSignal,
  Prospect,
  ProspectContext,
  VariantId,
  WorkspaceHistory,
} from "./types";

/* ---------------------------------- seed ---------------------------------- */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* --------------------------------- campaign -------------------------------- */

export const EMAIL_A_SUBJECT = "Quick question about {{companyName}}'s new sales hires";
export const EMAIL_A_BODY = `Hi {{firstName}},

I noticed {{companyName}} is expanding its sales team this quarter.

Most teams your size lose several weeks getting new reps to their first meetings. We help sales teams shorten that ramp with guided onboarding playbooks.

Would you be open to a 15-minute conversation next week?

{{senderSignature}}`;

const EMAIL_B_SUBJECT = "Onboarding playbooks for the {{companyName}} sales team";
const EMAIL_B_BODY = `Hi {{firstName}},

Our platform gives revenue teams a complete onboarding suite: structured playbooks, certification paths, call libraries, manager dashboards and a full reporting layer that covers every stage of the rep lifecycle from day one to full productivity.

Teams that adopt the suite report 32% faster ramp and 21% higher quota attainment in the first two quarters.

Book a demo here and we will walk you through the full platform.

{{senderSignature}}`;

const LI_A = `Thanks for connecting, {{firstName}}. You are hiring several reps right now — how are you handling their first 30 days? Happy to share the onboarding playbook other {{industry}} teams use.`;

const LI_B = `Hi {{firstName}}, we built the leading revenue enablement platform used by hundreds of companies worldwide. It covers onboarding, certification, coaching and analytics end to end. Can I book 30 minutes with you this week to run a full product demo and pricing walk-through for your team?`;

const FOLLOW_A = `Hi {{firstName}},

Circling back on the ramp-time question. One {{industry}} team cut new-rep ramp from 94 to 61 days with guided playbooks.

Worth a quick look?

{{senderSignature}}`;

const FOLLOW_B = `Hi {{firstName}},

Just following up on my previous message. Let me know if you want the demo. Act now, this is a limited free offer and 100% risk free!!!

{{senderSignature}}`;

export const baseCampaign: Campaign = {
  id: "cmp_sales_onboarding",
  name: "Sales Onboarding Campaign",
  status: "Draft",
  sender: { name: "Léa Moreau", email: "lea@ramplyhq.com" },
  schedule: "Mon–Fri · 09:00–18:00 (Europe/Paris)",
  abTest: true,
  variants: [
    {
      id: "A",
      name: "Sequence A",
      steps: [
        {
          id: "A1",
          variant: "A",
          channel: "email",
          position: 1,
          label: "Step 1 · First-contact email",
          timing: "Send immediately",
          hasContent: true,
          subject: EMAIL_A_SUBJECT,
          body: EMAIL_A_BODY,
        },
        {
          id: "A2",
          variant: "A",
          channel: "wait",
          position: 0,
          label: "Step 2 · Wait 2 days",
          timing: "Wait 2 days",
          hasContent: false,
        },
        {
          id: "A3",
          variant: "A",
          channel: "linkedin_message",
          position: 2,
          label: "Step 3 · LinkedIn message",
          timing: "Send after 2 days",
          hasContent: true,
          body: LI_A,
        },
        {
          id: "A4",
          variant: "A",
          channel: "profile_visit",
          position: 0,
          label: "Step 4 · LinkedIn profile visit",
          timing: "Same day",
          hasContent: false,
        },
        {
          id: "A5",
          variant: "A",
          channel: "email",
          position: 3,
          label: "Step 5 · Follow-up email",
          timing: "Send after 4 days",
          hasContent: true,
          subject: "Re: {{companyName}} ramp time",
          body: FOLLOW_A,
        },
      ],
    },
    {
      id: "B",
      name: "Sequence B",
      steps: [
        {
          id: "B1",
          variant: "B",
          channel: "email",
          position: 1,
          label: "Step 1 · First-contact email",
          timing: "Send immediately",
          hasContent: true,
          subject: EMAIL_B_SUBJECT,
          body: EMAIL_B_BODY,
        },
        {
          id: "B2",
          variant: "B",
          channel: "wait",
          position: 0,
          label: "Step 2 · Wait 2 days",
          timing: "Wait 2 days",
          hasContent: false,
        },
        {
          id: "B3",
          variant: "B",
          channel: "linkedin_message",
          position: 2,
          label: "Step 3 · LinkedIn message",
          timing: "Send after 2 days",
          hasContent: true,
          body: LI_B,
        },
        {
          id: "B4",
          variant: "B",
          channel: "profile_visit",
          position: 0,
          label: "Step 4 · LinkedIn profile visit",
          timing: "Same day",
          hasContent: false,
        },
        {
          id: "B5",
          variant: "B",
          channel: "email",
          position: 3,
          label: "Step 5 · Follow-up email",
          timing: "Send after 4 days",
          hasContent: true,
          subject: "Following up",
          body: FOLLOW_B,
        },
      ],
    },
  ],
};

/* ------------------------------- workspace -------------------------------- */

export const workspaceHistory: WorkspaceHistory = {
  campaigns: 82,
  positiveReplies: 1394,
  meetings: 388,
  opportunities: 147,
  closedWon: 47,
  closedLost: 100,
  baselinePositiveRate: 4.9,
  baselineOpportunityRate: 1.6,
  maturity: "calibrated",
};

/* -------------------------------- prospects -------------------------------- */

const SIGNALS: Record<string, IntentSignal> = {
  hiring6: { type: "sales_hiring", label: "6 open sales roles", strength: "strong" },
  hiring7: { type: "sales_hiring", label: "7 open sales roles", strength: "strong" },
  hiring3: { type: "sales_hiring", label: "3 open sales roles", strength: "moderate" },
  cro: { type: "leadership_change", label: "New CRO hired", strength: "strong" },
  leader: { type: "leadership_change", label: "New sales leader", strength: "moderate" },
  funding: { type: "funding", label: "Series B raised", strength: "moderate" },
  tech: { type: "tech_adoption", label: "New CRM rollout", strength: "moderate" },
  posts: { type: "content_activity", label: "Posts on rep onboarding", strength: "moderate" },
  none: { type: "none", label: "No strong signal", strength: "none" },
};

const ENABLEMENT_TITLES = [
  "Head of Enablement",
  "Revenue Enablement Manager",
  "Sales Enablement Lead",
  "Sales Operations Manager",
];

export function personaGroupFor(jobTitle: string) {
  return ENABLEMENT_TITLES.some((t) => t.toLowerCase() === jobTitle.toLowerCase()) ||
    /enablement|operations|ops/i.test(jobTitle)
    ? ("enablement" as const)
    : ("revenue_leader" as const);
}

type Seeded = {
  first: string;
  last: string;
  company: string;
  title: string;
  variant: VariantId;
  signal: IntentSignal;
  industry: string;
  size: ProspectContext["companySizeBand"];
  geo: string;
};

const FIXED_ROWS: Seeded[] = [
  {
    first: "Camille",
    last: "Ferrand",
    company: "Norvella Systems",
    title: "VP Sales",
    variant: "A",
    signal: SIGNALS.hiring6!,
    industry: "B2B SaaS",
    size: "201-500",
    geo: "France",
  },
  {
    first: "Tobias",
    last: "Lindqvist",
    company: "Brightloop Digital",
    title: "Head of Growth",
    variant: "B",
    signal: SIGNALS.none!,
    industry: "Marketing",
    size: "51-200",
    geo: "Sweden",
  },
  {
    first: "Marion",
    last: "Delacroix",
    company: "Kaptiva Cloud",
    title: "Sales Director",
    variant: "B",
    signal: SIGNALS.cro!,
    industry: "B2B SaaS",
    size: "201-500",
    geo: "France",
  },
  {
    first: "Sofia",
    last: "Kellerman",
    company: "Trailmark Finance",
    title: "Head of Enablement",
    variant: "A",
    signal: SIGNALS.hiring7!,
    industry: "Financial Services",
    size: "501-1000",
    geo: "Germany",
  },
  {
    first: "Nicolas",
    last: "Aubert",
    company: "Cendrix Software",
    title: "Revenue Enablement Manager",
    variant: "B",
    signal: SIGNALS.leader!,
    industry: "B2B SaaS",
    size: "51-200",
    geo: "France",
  },
];

const FIRSTS = ["Julia","Marc","Elena","Pavel","Anya","Thomas","Clara","Diego","Hannah","Owen","Mireia","Lukas","Nora","Felix","Amara","Sven","Iris","Rui","Petra","Adrien","Sanne","Milan","Lea","Karim","Emma","Jonas","Alice","Victor","Chloe","Mateo"];
const LASTS = ["Vandermeer","Okafor","Reinhart","Novak","Bianchi","Duarte","Halvorsen","Marchetti","Sundqvist","Kowalski","Fontaine","Petersen","Almeida","Weber","Larsen","Baptiste","Rossi","Jensen","Moreau","Castellan","Hoffmann","Ivanov","Serrano","Bergman","Dupont","Klein","Navarro","Sorensen","Laurent","Verhoeven"];
const COMPANIES = ["Aureon Labs","Northgate Retail","Veridian Health","Lumeneo","Stackforge","Calibra Works","Orbis Freight","Petramind","Havenly Cloud","Zenrick Analytics","Brightpath ERP","Solvexa","Marlowe Group","Tenzing Data","Fjordline Tech","Cyrus Payments","Verdana Energy","Onyxa Media","Pluralink","Keystone Robotics","Astridge Bank","Melvora","Quintal Systems","Ridgeway Logistics","Sablon Studio","Terrafirm","Uplandia","Vertexo","Winterbourne","Yavena"];
const TITLES = ["VP Sales","Sales Director","Head of Growth","Chief Revenue Officer","Head of Enablement","Revenue Enablement Manager","Sales Operations Manager","Sales Enablement Lead","VP Revenue","Head of Sales"];
const INDUSTRIES = ["B2B SaaS","Financial Services","Marketing","Manufacturing","Healthcare","IT Services"];
const SIZES: ProspectContext["companySizeBand"][] = ["1-50","51-200","201-500","501-1000","1000+"];
const GEOS = ["France","Germany","United Kingdom","Netherlands","Spain","Sweden","United States"];
const SIGNAL_POOL = [SIGNALS.hiring6!, SIGNALS.hiring3!, SIGNALS.cro!, SIGNALS.leader!, SIGNALS.funding!, SIGNALS.tech!, SIGNALS.posts!, SIGNALS.none!, SIGNALS.none!, SIGNALS.hiring7!];
const TECHS = [["Salesforce","Gong"],["HubSpot","Outreach"],["Pipedrive"],["Salesforce","Clari","Chorus"],["Dynamics 365"]];

function buildProspect(s: Seeded, index: number): Prospect {
  const group = personaGroupFor(s.title);
  const rnd = mulberry32(1000 + index);
  const context: ProspectContext = {
    persona: s.title,
    personaGroup: group,
    industry: s.industry,
    companySizeBand: s.size,
    geography: s.geo,
    signal: s.signal,
    growth:
      s.signal.strength === "strong"
        ? "Headcount up 18% over 6 months"
        : s.signal.strength === "moderate"
          ? "Headcount up 7% over 6 months"
          : "Headcount stable",
    technologies: TECHS[Math.floor(rnd() * TECHS.length)]!,
    publicActivity:
      s.signal.type === "content_activity"
        ? "Recent LinkedIn posts about rep onboarding"
        : s.signal.type === "leadership_change"
          ? "Announced a new revenue leadership hire"
          : s.signal.type === "sales_hiring"
            ? "Multiple sales job postings published"
            : "No recent public activity detected",
  };
  return {
    id: `p_${index}`,
    firstName: s.first,
    lastName: s.last,
    name: `${s.first} ${s.last}`,
    company: s.company,
    jobTitle: s.title,
    email: `${s.first.toLowerCase()}.${s.last.toLowerCase()}@${s.company.toLowerCase().replace(/[^a-z]/g, "")}.com`,
    variant: s.variant,
    status: "Not started",
    context,
  };
}

function generateProspects(total = 120): Prospect[] {
  const list: Prospect[] = FIXED_ROWS.map((row, i) => buildProspect(row, i));
  const rnd = mulberry32(20260807);
  for (let i = FIXED_ROWS.length; i < total; i++) {
    const seeded: Seeded = {
      first: FIRSTS[Math.floor(rnd() * FIRSTS.length)]!,
      last: LASTS[Math.floor(rnd() * LASTS.length)]!,
      company: COMPANIES[i % COMPANIES.length]!,
      title: TITLES[Math.floor(rnd() * TITLES.length)]!,
      variant: i % 2 === 0 ? "A" : "B",
      signal: SIGNAL_POOL[Math.floor(rnd() * SIGNAL_POOL.length)]!,
      industry: INDUSTRIES[Math.floor(rnd() * INDUSTRIES.length)]!,
      size: SIZES[Math.floor(rnd() * SIZES.length)]!,
      geo: GEOS[Math.floor(rnd() * GEOS.length)]!,
    };
    // keep company names unique-ish across pages
    const dupCount = Math.floor(i / COMPANIES.length);
    if (dupCount > 0) seeded.company = `${seeded.company} ${["Europe", "Group", "International"][dupCount - 1] ?? dupCount}`;
    list.push(buildProspect(seeded, i));
  }
  return list;
}

export const prospects: Prospect[] = generateProspects();

/* ------------------------------ demo outcomes ------------------------------ */

export const simulatedOutcomes: Record<VariantId, CampaignOutcome> = {
  A: {
    variant: "A",
    sends: 200,
    actualPositiveRate: 6.4,
    actualOpportunityRate: 1.8,
    meetings: 9,
    opportunities: 4,
    closedWon: 1,
    closedLost: 3,
  },
  B: {
    variant: "B",
    sends: 200,
    actualPositiveRate: 9.5,
    actualOpportunityRate: 3.5,
    meetings: 14,
    opportunities: 7,
    closedWon: 2,
    closedLost: 5,
  },
};

/** Per-step demo performance metrics used in the Step details view. */
export const stepMetrics: Record<string, { sent: number; opened: number; clicked: number; replied: number }> = {
  A1: { sent: 200, opened: 121, clicked: 34, replied: 21 },
  A3: { sent: 168, opened: 140, clicked: 12, replied: 17 },
  A5: { sent: 151, opened: 84, clicked: 19, replied: 9 },
  B1: { sent: 200, opened: 118, clicked: 29, replied: 26 },
  B3: { sent: 172, opened: 149, clicked: 15, replied: 22 },
  B5: { sent: 146, opened: 71, clicked: 11, replied: 6 },
};

export const MIN_OUTCOMES_FOR_RECALIBRATION = 120;
