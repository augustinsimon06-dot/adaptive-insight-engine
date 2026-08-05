// Central mock dataset for the Adaptive Challenger prototype.
// Everything shown in the UI derives from this single fictional campaign.

export type Confidence = "High" | "Medium" | "Low";

export const campaign = {
  name: "Sales Onboarding Campaign",
  status: "Active",
  sender: { name: "Augustin Simon", initials: "AS", email: "augustin@northbeam.io" },
  schedule: "Paris",
  createdAt: "12 Mar 2026",
};

export const cycleTotals = {
  closedWon: 34,
  closedLost: 61,
  qualifiedOpportunities: 88,
  positiveReplies: 142,
  conversationsAnalyzed: 27,
  repliesAnalyzed: 396,
  crmFieldsUsed: [
    "Deal stage",
    "Deal outcome",
    "Close date",
    "Account industry",
    "Employee count",
    "Contact job title",
    "Lost reason",
  ],
  newOutcomesSinceLastCycle: 41,
};

export const sequences = {
  A: {
    id: "A",
    label: "Sequence A",
    tag: "Current control",
    subject: "hey {{Contact > firstName}}, quick question about onboarding",
    body: `hey {{Contact > firstName}},

I noticed {{Company > name}} has been growing the sales team this quarter.

Most teams your size lose 3-4 weeks getting new reps to first meeting. We cut that ramp with guided onboarding playbooks.

Worth a 15 min chat next week?

{{Sender > signature}}`,
  },
  B: {
    id: "B",
    label: "Sequence B",
    tag: "Message variation — same audience",
    subject: "{{Company > name}} — 3 weeks of ramp time back",
    body: `hey {{Contact > firstName}},

Short one: new reps at companies like {{Company > name}} usually take 11 weeks to hit quota.

We've pulled that down to 7 for teams running guided onboarding playbooks.

Open to seeing how it works?

{{Sender > signature}}`,
  },
  ADAPTIVE: {
    id: "ADAPTIVE",
    label: "Adaptive Challenger",
    tag: "Uses Adaptive audience",
    subject: "{{Company > name}}: onboarding 9 reps without a RevOps hire",
    body: `hey {{Contact > firstName}},

You're hiring across the {{Company > name}} sales floor right now — and from what we see, that usually lands on Enablement before RevOps has headcount to help.

The teams we work with in that exact spot stopped rebuilding ramp docs per cohort and moved to one certification track their managers actually run.

Their last cohort hit first closed deal 24 days earlier.

Want the 12-minute walkthrough of how they set it up?

{{Sender > signature}}`,
  },
} as const;

export const adaptiveReasons = [
  {
    title: "Stronger intent signal detected",
    detail:
      "Accounts running 5+ open sales roles closed at 3.1x the rate of accounts with 0-2 open roles in this campaign.",
    stat: "21 of 34 Closed Won had 5+ open sales roles",
  },
  {
    title: "Different priority persona",
    detail:
      "Enablement and Revenue Enablement leaders replied positively far more than VP Sales, who dominated the current list.",
    stat: "Positive reply rate 14.2% vs 4.8%",
  },
  {
    title: "Narrower company profile",
    detail:
      "Closed Won clustered in 120-450 employee B2B SaaS and Fintech accounts; sub-80 employee accounts stalled after first call.",
    stat: "29 of 34 Closed Won inside 120-450 employees",
  },
  {
    title: "Pain point found more often in won deals",
    detail:
      "\"No RevOps headcount to own ramp\" appeared in won-deal calls far more than the generic ramp-time pain used today.",
    stat: "Mentioned in 19 of 27 analyzed calls",
  },
  {
    title: "More relevant CTA",
    detail:
      "Replies to a short recorded walkthrough offer outperformed the generic 15-minute meeting ask.",
    stat: "Reply rate 11.6% vs 6.1% on the control CTA",
  },
  {
    title: "Different sequence structure",
    detail:
      "Won deals engaged when the second touch arrived on day 3 with a LinkedIn step before the follow-up email.",
    stat: "Median 2.4 touches to first reply vs 4.1 today",
  },
];

export const evidenceFindings = [
  {
    category: "Company profile",
    title: "Mid-market B2B SaaS and Fintech convert best",
    pattern:
      "Closed Won accounts cluster between 120 and 450 employees. Accounts under 80 employees reached a first call but rarely reached procurement.",
    stat: "29 / 34 Closed Won · 8 / 61 Closed Lost in that range",
    confidence: "High" as Confidence,
    source: "CRM outcomes",
  },
  {
    category: "Buyer persona",
    title: "Enablement leaders outperform VP Sales",
    pattern:
      "Head of Enablement and Revenue Enablement Manager replied positively far more often than the VP Sales persona this campaign primarily targets.",
    stat: "14.2% positive reply rate vs 4.8%",
    confidence: "High" as Confidence,
    source: "Campaign replies",
  },
  {
    category: "Intent signal",
    title: "Open sales headcount predicts a won deal",
    pattern:
      "Accounts with 5 or more open sales or enablement roles at first touch closed at roughly 3x the campaign average.",
    stat: "21 / 34 Closed Won had 5+ open roles",
    confidence: "Medium" as Confidence,
    source: "Prospect data",
  },
  {
    category: "Messaging angle",
    title: "\"Ramp without RevOps headcount\" beats generic ramp time",
    pattern:
      "Won-deal conversations repeatedly framed the problem as missing operational ownership, not slow ramp in the abstract.",
    stat: "Mentioned in 19 / 27 analyzed calls",
    confidence: "Medium" as Confidence,
    source: "Sales-call transcripts",
  },
  {
    category: "Sequence timing",
    title: "Earlier second touch shortens time to reply",
    pattern:
      "Threads that received a second touch on day 3, preceded by a LinkedIn view, reached a reply in fewer steps.",
    stat: "Median 2.4 touches vs 4.1 on the control",
    confidence: "Low" as Confidence,
    source: "Campaign performance",
  },
  {
    category: "Channel",
    title: "LinkedIn-first threads reply more on cold accounts",
    pattern:
      "Adding a LinkedIn visit before email two correlated with higher reply rates on accounts with no prior touchpoint.",
    stat: "+3.4 pts reply rate on 212 threads",
    confidence: "Low" as Confidence,
    source: "Campaign performance",
  },
];

export const audiences = {
  current: {
    name: "Current audience",
    industry: "B2B SaaS, IT Services, Marketing Agencies",
    companySize: "20 - 1,000 employees",
    personas: "VP Sales, Sales Director, Head of Growth",
    intent: "Visited pricing page (last 90 days)",
    growth: "Not used",
    geography: "France, Benelux, UK",
    prospectCount: 1240,
  },
  adaptive: {
    name: "Adaptive audience",
    industry: "B2B SaaS, Fintech",
    companySize: "120 - 450 employees",
    personas: "Head of Enablement (priority), Revenue Enablement Manager, Sales Ops Lead",
    intent: "5+ open sales/enablement roles · New sales leader hired < 6 months",
    growth: "Headcount +15% over 6 months, no RevOps title in org",
    geography: "France, Benelux, UK, Ireland",
    prospectCount: 386,
  },
};

export type Prospect = {
  id: string;
  name: string;
  company: string;
  title: string;
  industry: string;
  size: string;
  intent: string;
  location: string;
  emailStatus?: string;
  campaignStatus?: string;
  fitScore?: number;
  why?: string;
  verification?: string;
};

export const currentProspects: Prospect[] = [
  { id: "c1", name: "Camille Ferrand", company: "Norvella Systems", title: "VP Sales", industry: "B2B SaaS", size: "310", intent: "Pricing page visit", location: "France", emailStatus: "Verified", campaignStatus: "Replied" },
  { id: "c2", name: "Tobias Lindqvist", company: "Brightloop Digital", title: "Head of Growth", industry: "Marketing Agency", size: "64", intent: "Pricing page visit", location: "Benelux", emailStatus: "Verified", campaignStatus: "Opened" },
  { id: "c3", name: "Marion Delacroix", company: "Kaptiva Cloud", title: "Sales Director", industry: "B2B SaaS", size: "180", intent: "None", location: "France", emailStatus: "Verified", campaignStatus: "In sequence" },
  { id: "c4", name: "Owen Hartley", company: "Pellham IT Group", title: "VP Sales", industry: "IT Services", size: "820", intent: "Pricing page visit", location: "UK", emailStatus: "Risky", campaignStatus: "Bounced" },
  { id: "c5", name: "Ines Moreau", company: "Vantoria Labs", title: "Head of Growth", industry: "B2B SaaS", size: "42", intent: "None", location: "France", emailStatus: "Verified", campaignStatus: "No reply" },
  { id: "c6", name: "Jasper Veen", company: "Ardenne Retailtech", title: "Sales Director", industry: "IT Services", size: "260", intent: "Pricing page visit", location: "Benelux", emailStatus: "Verified", campaignStatus: "Meeting booked" },
  { id: "c7", name: "Elodie Rambert", company: "Sundara Media", title: "VP Sales", industry: "Marketing Agency", size: "95", intent: "None", location: "France", emailStatus: "Verified", campaignStatus: "No reply" },
  { id: "c8", name: "Callum Bright", company: "Halstead Works", title: "Head of Growth", industry: "IT Services", size: "1,100", intent: "None", location: "UK", emailStatus: "Unverified", campaignStatus: "In sequence" },
];

export const adaptiveProspects: Prospect[] = [
  { id: "a1", name: "Sofia Kellerman", company: "Trailmark Finance", title: "Head of Enablement", industry: "Fintech", size: "340", intent: "7 open sales roles", location: "Benelux", fitScore: 94, why: "120-450 employees, 7 open sales roles, no RevOps title in org chart", verification: "Verified" },
  { id: "a2", name: "Nicolas Aubert", company: "Cendrix Software", title: "Revenue Enablement Manager", industry: "B2B SaaS", size: "265", intent: "New CRO hired 2 months ago", location: "France", fitScore: 91, why: "New sales leader within 6 months, headcount +18% over 6 months", verification: "Verified" },
  { id: "a3", name: "Hanna Vogel", company: "Lumeo Payments", title: "Head of Enablement", industry: "Fintech", size: "410", intent: "6 open enablement roles", location: "Benelux", fitScore: 89, why: "Matches won-deal profile: Fintech, 410 employees, enablement hiring burst", verification: "Verified" },
  { id: "a4", name: "Declan Moore", company: "Riverstack Cloud", title: "Sales Ops Lead", industry: "B2B SaaS", size: "150", intent: "5 open sales roles", location: "Ireland", fitScore: 84, why: "Inside company-size band, 5 open roles, no dedicated RevOps headcount", verification: "Verified" },
  { id: "a5", name: "Aurélie Panisse", company: "Novaquint Group", title: "Head of Enablement", industry: "B2B SaaS", size: "225", intent: "New VP Sales hired", location: "France", fitScore: 82, why: "Priority persona present, leadership change signal, growth +15%", verification: "Verified" },
  { id: "a6", name: "Marek Dubois", company: "Fintrail Nordics", title: "Revenue Enablement Manager", industry: "Fintech", size: "190", intent: "5 open sales roles", location: "Benelux", fitScore: 78, why: "Persona and size match; intent signal at the lower threshold", verification: "Catch-all" },
  { id: "a7", name: "Priya Rasmussen", company: "Oakbend Systems", title: "Sales Ops Lead", industry: "B2B SaaS", size: "430", intent: "8 open sales roles", location: "UK", fitScore: 76, why: "Top of size band, strongest hiring signal, secondary persona only", verification: "Verified" },
  { id: "a8", name: "Julien Rocher", company: "Verdanta Pay", title: "Head of Enablement", industry: "Fintech", size: "128", intent: "New CRO hired 4 months ago", location: "France", fitScore: 71, why: "Bottom of size band, priority persona, single intent signal", verification: "Unverified" },
];

export const selectionLogic = [
  { criterion: "Industry", rule: "B2B SaaS or Fintech only", from: "Company profile finding (High confidence)" },
  { criterion: "Company size", rule: "120 - 450 employees", from: "29 / 34 Closed Won fell in this band" },
  { criterion: "Priority persona", rule: "Head of Enablement first, Revenue Enablement Manager second", from: "Buyer persona finding (14.2% vs 4.8% reply rate)" },
  { criterion: "Intent", rule: "5+ open sales/enablement roles OR new sales leader < 6 months", from: "Intent signal finding (Medium confidence)" },
  { criterion: "Org structure", rule: "No RevOps title present", from: "Messaging angle finding from 19 / 27 calls" },
  { criterion: "Geography", rule: "France, Benelux, UK, Ireland", from: "Existing campaign coverage, extended to Ireland" },
];

export const performance = {
  ab: [
    { seq: "Sequence A", delivered: 612, positive: 37, meetings: 14, opportunities: 9, won: 3 },
    { seq: "Sequence B", delivered: 604, positive: 44, meetings: 18, opportunities: 11, won: 4 },
  ],
  adaptive: {
    contacted: 142,
    positive: 21,
    opportunities: 8,
    won: 3,
    baseline: { positiveRate: 6.6, opportunityRate: 1.6, wonRate: 0.6 },
  },
  nextCycle: {
    collected: cycleTotals.newOutcomesSinceLastCycle,
  },
};

export const analysisStages = [
  "Importing final CRM outcomes",
  "Comparing Closed Won and Closed Lost profiles",
  "Analyzing buyer personas",
  "Identifying intent signals",
  "Reviewing replies and messages",
  "Reviewing available sales-call insights",
  "Generating an Adaptive hypothesis",
];

export const strategyComparison = {
  current: {
    audience: `${audiences.current.industry} · ${audiences.current.companySize}`,
    personas: audiences.current.personas,
    intent: audiences.current.intent,
    angle: "Generic ramp-time reduction for growing sales teams",
    sequence: "Email day 0 → Email day 5 → Email day 12",
    prospects: audiences.current.prospectCount,
  },
  adaptive: {
    audience: `${audiences.adaptive.industry} · ${audiences.adaptive.companySize}`,
    personas: audiences.adaptive.personas,
    intent: audiences.adaptive.intent,
    angle: "Running ramp and certification without RevOps headcount",
    sequence: "Email day 0 → LinkedIn visit day 2 → Email day 3 → Email day 9",
    prospects: audiences.adaptive.prospectCount,
  },
};
